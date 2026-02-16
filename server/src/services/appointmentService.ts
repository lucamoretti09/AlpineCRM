import { PrismaClient, Prisma } from '@prisma/client';
import activityService from './activityService';
import { NotFoundError } from '../middleware/errorHandler';
import { broadcast } from '../socket';

const prisma = new PrismaClient();

export class AppointmentService {
  async createAppointment(data: any, userId?: string) {
    const appointment = await prisma.appointment.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        timezone: data.timezone || 'UTC',
        allDay: data.allDay || false,
        status: data.status || 'scheduled',
        contactId: data.contactId,
        dealId: data.dealId,
        createdById: userId,
        attendees: data.attendees || [],
        reminders: data.reminders || [],
        recurrence: data.recurrence,
        externalId: data.externalId,
      },
      include: {
        contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        deal: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    await activityService.createActivity({
      type: 'created', title: `Appointment scheduled: ${appointment.title}`,
      description: `${appointment.startTime.toISOString()} - ${appointment.endTime.toISOString()}`,
      contactId: data.contactId, dealId: data.dealId, userId,
    });

    broadcast('appointment:created', appointment);
    return appointment;
  }

  async getAppointments(filters: any) {
    const { search, status, contactId, dealId, dateFrom, dateTo, createdById,
      limit = 50, offset = 0, sortBy = 'startTime', sortOrder = 'asc' } = filters;

    const where: Prisma.AppointmentWhereInput = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;
    if (createdById) where.createdById = createdById;
    if (dateFrom || dateTo) {
      where.startTime = {};
      if (dateFrom) where.startTime.gte = new Date(dateFrom);
      if (dateTo) where.startTime.lte = new Date(dateTo);
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          contact: { select: { id: true, firstName: true, lastName: true } },
          deal: { select: { id: true, name: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
        orderBy, take: limit, skip: offset,
      }),
      prisma.appointment.count({ where }),
    ]);

    return { appointments, total, limit, offset, pages: Math.ceil(total / limit) };
  }

  async getAppointmentById(id: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        contact: true, deal: true,
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
    });
    if (!appointment) throw new NotFoundError('Appointment not found');
    return appointment;
  }

  async updateAppointment(id: string, data: any, userId?: string) {
    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Appointment not found');

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime);
    if (data.endTime !== undefined) updateData.endTime = new Date(data.endTime);
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.allDay !== undefined) updateData.allDay = data.allDay;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.contactId !== undefined) updateData.contactId = data.contactId;
    if (data.dealId !== undefined) updateData.dealId = data.dealId;
    if (data.attendees !== undefined) updateData.attendees = data.attendees;
    if (data.reminders !== undefined) updateData.reminders = data.reminders;
    if (data.recurrence !== undefined) updateData.recurrence = data.recurrence;

    const appointment = await prisma.appointment.update({
      where: { id }, data: updateData,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    await activityService.createActivity({
      type: 'updated', title: `Appointment updated: ${appointment.title}`,
      contactId: appointment.contactId || undefined, dealId: appointment.dealId || undefined, userId,
    });

    broadcast('appointment:updated', appointment);
    return appointment;
  }

  async deleteAppointment(id: string, userId?: string) {
    const appointment = await prisma.appointment.findUnique({ where: { id }, select: { title: true } });
    if (!appointment) throw new NotFoundError('Appointment not found');

    await prisma.appointment.delete({ where: { id } });
    await activityService.createActivity({ type: 'deleted', title: `Appointment deleted: ${appointment.title}`, userId });
    broadcast('appointment:deleted', { id });
    return { message: 'Appointment deleted successfully' };
  }
}

export default new AppointmentService();
