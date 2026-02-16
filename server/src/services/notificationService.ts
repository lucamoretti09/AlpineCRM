import { PrismaClient, Prisma } from '@prisma/client';
import { emitToUser } from '../socket';

const prisma = new PrismaClient();

export class NotificationService {
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        read: false,
      },
    });

    // Emit real-time notification
    emitToUser(data.userId, 'notification:new', notification);

    return notification;
  }

  async getNotifications(userId: string, filters: any = {}) {
    const { read, limit = 50, offset = 0 } = filters;

    const where: Prisma.NotificationWhereInput = { userId };
    if (read !== undefined) where.read = read === 'true' || read === true;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    return { notifications, total, unreadCount, limit, offset };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    });
    emitToUser(userId, 'notification:read', { id: notificationId });
    return notification;
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true, readAt: new Date() },
    });
    emitToUser(userId, 'notification:all-read', {});
    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(notificationId: string) {
    await prisma.notification.delete({ where: { id: notificationId } });
    return { message: 'Notification deleted' };
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({ where: { userId, read: false } });
    return { count };
  }

  // Helper methods for common notifications
  async notifyTaskAssigned(userId: string, taskTitle: string, assignedBy: string) {
    return this.createNotification({
      userId,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `${assignedBy} assigned you a task: ${taskTitle}`,
      data: { taskTitle, assignedBy },
    });
  }

  async notifyDealWon(userId: string, dealName: string, dealValue: string) {
    return this.createNotification({
      userId,
      type: 'deal_won',
      title: 'Deal Won!',
      message: `Congratulations! Deal "${dealName}" worth ${dealValue} has been won!`,
      data: { dealName, dealValue },
    });
  }

  async notifyTicketAssigned(userId: string, ticketNumber: string, subject: string) {
    return this.createNotification({
      userId,
      type: 'ticket_assigned',
      title: 'Ticket Assigned',
      message: `Ticket ${ticketNumber}: ${subject} has been assigned to you`,
      data: { ticketNumber, subject },
    });
  }

  async notifyTaskDue(userId: string, taskTitle: string, dueDate: string) {
    return this.createNotification({
      userId,
      type: 'task_due',
      title: 'Task Due Soon',
      message: `Task "${taskTitle}" is due on ${dueDate}`,
      data: { taskTitle, dueDate },
    });
  }
}

export default new NotificationService();
