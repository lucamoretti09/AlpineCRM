import { PrismaClient, Prisma } from '@prisma/client';
import activityService from './activityService';
import { NotFoundError } from '../middleware/errorHandler';
import { broadcast } from '../socket';

const prisma = new PrismaClient();

export interface CreateTaskData {
  title: string;
  description?: string;
  type?: 'task' | 'call' | 'meeting' | 'email' | 'follow_up';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date | string;
  assignedToId?: string;
  contactId?: string;
  dealId?: string;
  reminder?: boolean;
  reminderAt?: Date | string;
  recurrence?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  completedAt?: Date | string | null;
}

export interface TaskFilters {
  search?: string;
  type?: string;
  priority?: string;
  status?: string;
  assignedToId?: string;
  contactId?: string;
  dealId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  overdue?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class TaskService {
  /**
   * Create a new task
   */
  async createTask(data: CreateTaskData, userId?: string) {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type || 'task',
        priority: data.priority || 'medium',
        status: data.status || 'pending',
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assignedToId: data.assignedToId || userId,
        createdById: userId,
        contactId: data.contactId,
        dealId: data.dealId,
        reminder: data.reminder || false,
        reminderAt: data.reminderAt ? new Date(data.reminderAt) : undefined,
        recurrence: data.recurrence,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      },
    });

    // Log activity
    await activityService.logTaskActivity(
      'created',
      task.id,
      `Task created: ${task.title}`,
      `${task.type} task assigned to ${task.assignedTo?.firstName} ${task.assignedTo?.lastName}`,
      userId,
      { taskType: task.type, priority: task.priority }
    );

    // Emit real-time event
    broadcast('task:created', task);

    return task;
  }

  /**
   * Get all tasks with filters
   */
  async getTasks(filters: TaskFilters) {
    const {
      search,
      type,
      priority,
      status,
      assignedToId,
      contactId,
      dealId,
      dueDateFrom,
      dueDateTo,
      overdue,
      limit = 50,
      offset = 0,
      sortBy = 'dueDate',
      sortOrder = 'asc',
    } = filters;

    const where: Prisma.TaskWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type as any;
    }

    if (priority) {
      where.priority = priority as any;
    }

    if (status) {
      where.status = status as any;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (dealId) {
      where.dealId = dealId;
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) {
        where.dueDate.gte = new Date(dueDateFrom);
      }
      if (dueDateTo) {
        where.dueDate.lte = new Date(dueDateTo);
      }
    }

    if (overdue) {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'completed' };
    }

    const orderBy: Prisma.TaskOrderByWithRelationInput = {};
    if (sortBy === 'priority') {
      orderBy.priority = sortOrder;
    } else if (sortBy === 'dueDate') {
      orderBy.dueDate = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string, userId?: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        contact: true,
        deal: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Log view activity
    if (userId) {
      await activityService.logTaskActivity(
        'viewed',
        taskId,
        `Task viewed: ${task.title}`,
        undefined,
        userId
      );
    }

    return task;
  }

  /**
   * Update task
   */
  async updateTask(taskId: string, data: UpdateTaskData, userId?: string) {
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    const updateData: any = {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      assignedToId: data.assignedToId,
      contactId: data.contactId,
      dealId: data.dealId,
      reminder: data.reminder,
      reminderAt: data.reminderAt ? new Date(data.reminderAt) : undefined,
      recurrence: data.recurrence,
      completedAt: data.completedAt ? new Date(data.completedAt) : data.completedAt === null ? null : undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Auto-set completedAt if status changed to completed
    if (data.status === 'completed' && existingTask.status !== 'completed') {
      updateData.completedAt = new Date();
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Detect changes
    const changes: string[] = [];
    if (data.status && data.status !== existingTask.status) {
      changes.push(`status changed to ${data.status}`);
    }
    if (data.priority && data.priority !== existingTask.priority) {
      changes.push(`priority changed to ${data.priority}`);
    }
    if (data.assignedToId && data.assignedToId !== existingTask.assignedToId) {
      changes.push(`reassigned to ${task.assignedTo?.firstName} ${task.assignedTo?.lastName}`);
    }

    await activityService.logTaskActivity(
      'updated',
      task.id,
      `Task updated: ${task.title}`,
      changes.length > 0 ? changes.join(', ') : 'Task updated',
      userId,
      { changes }
    );

    broadcast('task:updated', task);

    return task;
  }

  /**
   * Complete task
   */
  async completeTask(taskId: string, userId?: string) {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await activityService.logTaskActivity(
      'updated',
      taskId,
      `Task completed: ${task.title}`,
      'Task marked as completed',
      userId
    );

    broadcast('task:completed', task);

    return task;
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string, userId?: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { title: true },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    await activityService.createActivity({
      type: 'deleted',
      title: `Task deleted: ${task.title}`,
      userId,
    });

    broadcast('task:deleted', { taskId });

    return { message: 'Task deleted successfully' };
  }

  /**
   * Get task statistics
   */
  async getTaskStats(userId?: string) {
    const where: Prisma.TaskWhereInput = userId ? { assignedToId: userId } : {};

    const [total, pending, inProgress, completed, overdue] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: 'pending' } }),
      prisma.task.count({ where: { ...where, status: 'in_progress' } }),
      prisma.task.count({ where: { ...where, status: 'completed' } }),
      prisma.task.count({
        where: {
          ...where,
          status: { not: 'completed' },
          dueDate: { lt: new Date() },
        },
      }),
    ]);

    return {
      total,
      byStatus: {
        pending,
        inProgress,
        completed,
      },
      overdue,
    };
  }
}

export default new TaskService();
