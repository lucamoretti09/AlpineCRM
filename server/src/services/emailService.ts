import { PrismaClient, Prisma } from '@prisma/client';
import nodemailer from 'nodemailer';
import activityService from './activityService';
import { NotFoundError } from '../middleware/errorHandler';
import { broadcast } from '../socket';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  async sendEmail(data: any, userId?: string) {
    // Store email in database
    const email = await prisma.email.create({
      data: {
        messageId: `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        threadId: data.threadId,
        fromEmail: data.fromEmail || process.env.SMTP_USER || '',
        toEmails: data.toEmails,
        ccEmails: data.ccEmails || [],
        bccEmails: data.bccEmails || [],
        subject: data.subject,
        body: data.body,
        bodyHtml: data.bodyHtml,
        status: 'sent',
        direction: 'outbound',
        contactId: data.contactId,
        dealId: data.dealId,
        userId: userId,
        attachments: data.attachments || [],
        sentAt: new Date(),
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        deal: { select: { id: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Actually send the email via SMTP
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail({
          from: data.fromEmail || process.env.SMTP_USER,
          to: data.toEmails.join(', '),
          cc: data.ccEmails?.join(', '),
          bcc: data.bccEmails?.join(', '),
          subject: data.subject,
          text: data.body,
          html: data.bodyHtml || data.body,
        });

        await prisma.email.update({
          where: { id: email.id },
          data: { status: 'delivered' },
        });
      }
    } catch (error) {
      await prisma.email.update({
        where: { id: email.id },
        data: { status: 'bounced' },
      });
    }

    await activityService.createActivity({
      type: 'emailed',
      title: `Email sent: ${data.subject}`,
      description: `To: ${data.toEmails.join(', ')}`,
      contactId: data.contactId, dealId: data.dealId, userId,
    });

    broadcast('email:sent', email);
    return email;
  }

  async getEmails(filters: any) {
    const { search, status, direction, contactId, dealId, userId,
      limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    const where: Prisma.EmailWhereInput = {};
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
        { fromEmail: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (direction) where.direction = direction;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;
    if (userId) where.userId = userId;

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, email: true } },
          deal: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy, take: limit, skip: offset,
      }),
      prisma.email.count({ where }),
    ]);

    return { emails, total, limit, offset, pages: Math.ceil(total / limit) };
  }

  async getEmailById(id: string) {
    const email = await prisma.email.findUnique({
      where: { id },
      include: { contact: true, deal: true, user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    if (!email) throw new NotFoundError('Email not found');
    return email;
  }

  async getEmailThread(threadId: string) {
    const emails = await prisma.email.findMany({
      where: { threadId },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return emails;
  }

  async trackEmailOpen(id: string) {
    const email = await prisma.email.update({
      where: { id },
      data: { status: 'opened', openedAt: new Date() },
    });
    broadcast('email:opened', { id });
    return email;
  }

  async trackEmailClick(id: string) {
    const email = await prisma.email.update({
      where: { id },
      data: { status: 'clicked', clickedAt: new Date() },
    });
    broadcast('email:clicked', { id });
    return email;
  }

  async deleteEmail(id: string, userId?: string) {
    const email = await prisma.email.findUnique({ where: { id }, select: { subject: true } });
    if (!email) throw new NotFoundError('Email not found');
    await prisma.email.delete({ where: { id } });
    return { message: 'Email deleted successfully' };
  }

  async getEmailTemplates() {
    return prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createEmailTemplate(data: any) {
    return prisma.emailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
        variables: data.variables || [],
        category: data.category,
      },
    });
  }

  async updateEmailTemplate(id: string, data: any) {
    return prisma.emailTemplate.update({
      where: { id },
      data: {
        name: data.name,
        subject: data.subject,
        body: data.body,
        variables: data.variables,
        category: data.category,
      },
    });
  }

  async deleteEmailTemplate(id: string) {
    await prisma.emailTemplate.delete({ where: { id } });
    return { message: 'Template deleted successfully' };
  }
}

export default new EmailService();
