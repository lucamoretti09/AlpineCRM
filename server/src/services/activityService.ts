import { PrismaClient } from '@prisma/client';
import { getIO } from '../socket';

const prisma = new PrismaClient();

export interface CreateActivityData {
  type: 'created' | 'updated' | 'deleted' | 'viewed' | 'emailed' | 'called' | 'note' | 'status_changed' | 'assigned';
  title: string;
  description?: string;
  contactId?: string;
  dealId?: string;
  taskId?: string;
  ticketId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class ActivityService {
  /**
   * Create a new activity log entry
   */
  async createActivity(data: CreateActivityData) {
    const activity = await prisma.activity.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        contactId: data.contactId,
        dealId: data.dealId,
        taskId: data.taskId,
        ticketId: data.ticketId,
        userId: data.userId,
        metadata: data.metadata || {},
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        deal: {
          select: {
            id: true,
            name: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        ticket: {
          select: {
            id: true,
            ticketNumber: true,
            subject: true,
          },
        },
      },
    });

    // Emit real-time event
    try {
      const io = getIO();

      // Emit to user who performed the action
      if (data.userId) {
        io.to(`user-${data.userId}`).emit('activity:created', activity);
      }

      // Emit to related entities
      if (data.contactId) {
        io.to(`contact-${data.contactId}`).emit('activity:created', activity);
      }
      if (data.dealId) {
        io.to(`deal-${data.dealId}`).emit('activity:created', activity);
      }
      if (data.taskId) {
        io.to(`task-${data.taskId}`).emit('activity:created', activity);
      }
      if (data.ticketId) {
        io.to(`ticket-${data.ticketId}`).emit('activity:created', activity);
      }

      // Emit to global activity feed
      io.emit('activity:new', activity);
    } catch (error) {
      // Log error but don't fail the request if socket emission fails
      console.error('Failed to emit activity via socket:', error);
    }

    return activity;
  }

  /**
   * Get activities with filters
   */
  async getActivities(filters: {
    contactId?: string;
    dealId?: string;
    taskId?: string;
    ticketId?: string;
    userId?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }) {
    const { limit = 50, offset = 0, ...where } = filters;

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          deal: {
            select: {
              id: true,
              name: true,
            },
          },
          task: {
            select: {
              id: true,
              title: true,
            },
          },
          ticket: {
            select: {
              id: true,
              ticketNumber: true,
              subject: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.activity.count({ where }),
    ]);

    return {
      activities,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get activity by ID
   */
  async getActivityById(activityId: string) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        contact: true,
        deal: true,
        task: true,
        ticket: true,
      },
    });

    return activity;
  }

  /**
   * Delete activity (admin only)
   */
  async deleteActivity(activityId: string) {
    await prisma.activity.delete({
      where: { id: activityId },
    });

    return { message: 'Activity deleted successfully' };
  }

  /**
   * Helper method: Log contact activity
   */
  async logContactActivity(
    type: CreateActivityData['type'],
    contactId: string,
    title: string,
    description?: string,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    return this.createActivity({
      type,
      title,
      description,
      contactId,
      userId,
      metadata,
    });
  }

  /**
   * Helper method: Log deal activity
   */
  async logDealActivity(
    type: CreateActivityData['type'],
    dealId: string,
    title: string,
    description?: string,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    return this.createActivity({
      type,
      title,
      description,
      dealId,
      userId,
      metadata,
    });
  }

  /**
   * Helper method: Log task activity
   */
  async logTaskActivity(
    type: CreateActivityData['type'],
    taskId: string,
    title: string,
    description?: string,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    return this.createActivity({
      type,
      title,
      description,
      taskId,
      userId,
      metadata,
    });
  }

  /**
   * Helper method: Log ticket activity
   */
  async logTicketActivity(
    type: CreateActivityData['type'],
    ticketId: string,
    title: string,
    description?: string,
    userId?: string,
    metadata?: Record<string, any>
  ) {
    return this.createActivity({
      type,
      title,
      description,
      ticketId,
      userId,
      metadata,
    });
  }
}

export default new ActivityService();
