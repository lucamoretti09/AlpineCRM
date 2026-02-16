import { PrismaClient, Prisma } from '@prisma/client';
import activityService from './activityService';
import { NotFoundError } from '../middleware/errorHandler';
import { broadcast } from '../socket';

const prisma = new PrismaClient();

export class InvoiceService {
  private generateInvoiceNumber(): string {
    const prefix = 'INV';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  }

  async createInvoice(data: any, userId?: string) {
    const items = data.items || [];
    const subtotal = items.reduce((sum: number, item: any) =>
      sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * ((data.taxRate || 0) / 100);
    const total = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: this.generateInvoiceNumber(),
        contactId: data.contactId,
        dealId: data.dealId,
        status: data.status || 'draft',
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: Number(subtotal),
        taxRate: Number(data.taxRate || 0),
        taxAmount: Number(taxAmount),
        total: Number(total),
        currency: data.currency || 'USD',
        notes: data.notes,
        terms: data.terms,
        items: items,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true, company: true } },
        deal: { select: { id: true, name: true } },
      },
    });

    await activityService.createActivity({
      type: 'created', title: `Invoice created: ${invoice.invoiceNumber}`,
      description: `Total: ${invoice.currency} ${invoice.total}`,
      contactId: data.contactId, dealId: data.dealId, userId,
    });

    broadcast('invoice:created', invoice);
    return invoice;
  }

  async getInvoices(filters: any) {
    const { search, status, contactId, dealId, dueDateFrom, dueDateTo,
      limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    const where: Prisma.InvoiceWhereInput = {};
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;
    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
      if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, email: true, company: true } },
          deal: { select: { id: true, name: true } },
        },
        orderBy, take: limit, skip: offset,
      }),
      prisma.invoice.count({ where }),
    ]);

    return { invoices, total, limit, offset, pages: Math.ceil(total / limit) };
  }

  async getInvoiceById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { contact: true, deal: true },
    });
    if (!invoice) throw new NotFoundError('Invoice not found');
    return invoice;
  }

  async updateInvoice(id: string, data: any, userId?: string) {
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Invoice not found');

    const updateData: any = {};
    if (data.items !== undefined) {
      updateData.items = data.items;
      const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
      const taxRate = data.taxRate !== undefined ? data.taxRate : Number(existing.taxRate);
      const taxAmount = subtotal * (taxRate / 100);
      updateData.subtotal = Number(subtotal);
      updateData.taxRate = Number(taxRate);
      updateData.taxAmount = Number(taxAmount);
      updateData.total = Number(subtotal + taxAmount);
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
    if (data.issueDate !== undefined) updateData.issueDate = new Date(data.issueDate);
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.terms !== undefined) updateData.terms = data.terms;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.contactId !== undefined) updateData.contactId = data.contactId;
    if (data.dealId !== undefined) updateData.dealId = data.dealId;

    if (data.status === 'paid' && existing.status !== 'paid') {
      updateData.paidAt = new Date();
    }

    const invoice = await prisma.invoice.update({
      where: { id }, data: updateData,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        deal: { select: { id: true, name: true } },
      },
    });

    await activityService.createActivity({
      type: 'updated', title: `Invoice updated: ${invoice.invoiceNumber}`,
      contactId: invoice.contactId || undefined, dealId: invoice.dealId || undefined, userId,
    });

    broadcast('invoice:updated', invoice);
    return invoice;
  }

  async deleteInvoice(id: string, userId?: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id }, select: { invoiceNumber: true } });
    if (!invoice) throw new NotFoundError('Invoice not found');
    await prisma.invoice.delete({ where: { id } });
    await activityService.createActivity({ type: 'deleted', title: `Invoice deleted: ${invoice.invoiceNumber}`, userId });
    return { message: 'Invoice deleted successfully' };
  }

  async getInvoiceStats(userId?: string) {
    const where: Prisma.InvoiceWhereInput = {};
    const [total, draft, sent, paid, overdue, totalRevenue, paidRevenue] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.count({ where: { ...where, status: 'draft' } }),
      prisma.invoice.count({ where: { ...where, status: 'sent' } }),
      prisma.invoice.count({ where: { ...where, status: 'paid' } }),
      prisma.invoice.count({ where: { ...where, status: 'overdue' } }),
      prisma.invoice.aggregate({ where, _sum: { total: true } }),
      prisma.invoice.aggregate({ where: { ...where, status: 'paid' }, _sum: { total: true } }),
    ]);
    return {
      total, byStatus: { draft, sent, paid, overdue },
      totalRevenue: totalRevenue._sum.total?.toString() || '0',
      paidRevenue: paidRevenue._sum.total?.toString() || '0',
    };
  }
}

export default new InvoiceService();
