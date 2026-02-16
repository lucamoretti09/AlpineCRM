import { PrismaClient, Prisma } from '@prisma/client';
import activityService from './activityService';
import { NotFoundError } from '../middleware/errorHandler';
import { broadcast, emitToUser } from '../socket';

const prisma = new PrismaClient();

export class TicketService {
  private generateTicketNumber(): string {
    const prefix = 'TKT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  async createTicket(data: any, userId?: string) {
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: this.generateTicketNumber(),
        subject: data.subject,
        description: data.description,
        status: data.status || 'open',
        priority: data.priority || 'normal',
        category: data.category,
        contactId: data.contactId,
        assignedToId: data.assignedToId,
        slaDueAt: data.slaDueAt ? new Date(data.slaDueAt) : undefined,
        tags: data.tags || [],
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    await activityService.logTicketActivity('created', ticket.id,
      `Ticket created: ${ticket.ticketNumber}`, `Subject: ${ticket.subject}`, userId,
      { ticketNumber: ticket.ticketNumber, priority: ticket.priority });

    if (ticket.assignedToId) {
      emitToUser(ticket.assignedToId, 'ticket:assigned', ticket);
    }
    broadcast('ticket:created', ticket);

    return ticket;
  }

  async getTickets(filters: any) {
    const { search, status, priority, category, assignedToId, contactId,
      limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    const where: Prisma.TicketWhereInput = {};
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (assignedToId) where.assignedToId = assignedToId;
    if (contactId) where.contactId = contactId;

    const orderBy: any = {};
    if (sortBy === 'priority') orderBy.priority = sortOrder;
    else if (sortBy === 'status') orderBy.status = sortOrder;
    else orderBy.createdAt = sortOrder;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          _count: { select: { comments: true } },
        },
        orderBy, take: limit, skip: offset,
      }),
      prisma.ticket.count({ where }),
    ]);

    return { tickets, total, limit, offset, pages: Math.ceil(total / limit) };
  }

  async getTicketById(ticketId: string, userId?: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        contact: true,
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' }, take: 20,
          include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
        },
        _count: { select: { comments: true } },
      },
    });

    if (!ticket) throw new NotFoundError('Ticket not found');
    return ticket;
  }

  async updateTicket(ticketId: string, data: any, userId?: string) {
    const existing = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!existing) throw new NotFoundError('Ticket not found');

    const updateData: any = {};
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId;
    if (data.tags !== undefined) updateData.tags = data.tags;

    // Auto-track response/resolution times
    if (data.status === 'in_progress' && !existing.firstResponseAt) {
      updateData.firstResponseAt = new Date();
    }
    if (data.status === 'resolved' && !existing.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
    if (data.status === 'closed' && !existing.closedAt) {
      updateData.closedAt = new Date();
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId }, data: updateData,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    const changes: string[] = [];
    if (data.status && data.status !== existing.status) changes.push(`status: ${existing.status} → ${data.status}`);
    if (data.priority && data.priority !== existing.priority) changes.push(`priority: ${existing.priority} → ${data.priority}`);

    await activityService.logTicketActivity('updated', ticketId,
      `Ticket updated: ${ticket.ticketNumber}`, changes.join(', ') || 'Ticket updated', userId);

    broadcast('ticket:updated', ticket);
    return ticket;
  }

  async addComment(ticketId: string, data: { content: string; isInternal?: boolean; attachments?: any[] }, userId: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, select: { ticketNumber: true, firstResponseAt: true } });
    if (!ticket) throw new NotFoundError('Ticket not found');

    const comment = await prisma.ticketComment.create({
      data: {
        ticketId,
        userId,
        content: data.content,
        isInternal: data.isInternal || false,
        attachments: data.attachments || [],
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    // Track first response time
    if (!ticket.firstResponseAt) {
      await prisma.ticket.update({ where: { id: ticketId }, data: { firstResponseAt: new Date() } });
    }

    await activityService.logTicketActivity('updated', ticketId,
      `Comment added to ${ticket.ticketNumber}`, data.isInternal ? 'Internal note' : 'Reply sent', userId);

    broadcast('ticket:comment-added', { ticketId, comment });
    return comment;
  }

  async deleteTicket(ticketId: string, userId?: string) {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, select: { ticketNumber: true, subject: true } });
    if (!ticket) throw new NotFoundError('Ticket not found');

    await prisma.ticket.delete({ where: { id: ticketId } });

    await activityService.createActivity({ type: 'deleted',
      title: `Ticket deleted: ${ticket.ticketNumber}`, userId });

    broadcast('ticket:deleted', { ticketId });
    return { message: 'Ticket deleted successfully' };
  }

  async getTicketStats(userId?: string) {
    const where: Prisma.TicketWhereInput = userId ? { assignedToId: userId } : {};
    const [total, open, pending, inProgress, resolved, closed] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.count({ where: { ...where, status: 'open' } }),
      prisma.ticket.count({ where: { ...where, status: 'pending' } }),
      prisma.ticket.count({ where: { ...where, status: 'in_progress' } }),
      prisma.ticket.count({ where: { ...where, status: 'resolved' } }),
      prisma.ticket.count({ where: { ...where, status: 'closed' } }),
    ]);
    return { total, byStatus: { open, pending, inProgress, resolved, closed } };
  }
}

export default new TicketService();
