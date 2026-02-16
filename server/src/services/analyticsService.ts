import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsService {
  async getDashboardStats(userId?: string) {
    const userFilter = userId ? { ownerId: userId } : {};
    const userTaskFilter = userId ? { assignedToId: userId } : {};
    const userTicketFilter = userId ? { assignedToId: userId } : {};

    const [
      contactsTotal, contactsActive,
      dealsTotal, dealsOpen, dealsWon, totalPipelineValue, totalWonValue,
      tasksTotal, tasksPending, tasksOverdue,
      ticketsTotal, ticketsOpen,
      invoicesTotal, invoicesPaid, totalRevenue,
      recentActivities,
    ] = await Promise.all([
      prisma.contact.count({ where: userFilter }),
      prisma.contact.count({ where: { ...userFilter, status: 'active' } }),
      prisma.deal.count({ where: userFilter }),
      prisma.deal.count({ where: { ...userFilter, status: 'open' } }),
      prisma.deal.count({ where: { ...userFilter, status: 'won' } }),
      prisma.deal.aggregate({ where: { ...userFilter, status: 'open' }, _sum: { value: true } }),
      prisma.deal.aggregate({ where: { ...userFilter, status: 'won' }, _sum: { value: true } }),
      prisma.task.count({ where: userTaskFilter }),
      prisma.task.count({ where: { ...userTaskFilter, status: 'pending' } }),
      prisma.task.count({
        where: { ...userTaskFilter, status: { not: 'completed' }, dueDate: { lt: new Date() } },
      }),
      prisma.ticket.count({ where: userTicketFilter }),
      prisma.ticket.count({ where: { ...userTicketFilter, status: { in: ['open', 'pending', 'in_progress'] } } }),
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'paid' } }),
      prisma.invoice.aggregate({ where: { status: 'paid' }, _sum: { total: true } }),
      prisma.activity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          deal: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      contacts: {
        total: contactsTotal,
        active: contactsActive,
      },
      deals: {
        total: dealsTotal,
        open: dealsOpen,
        won: dealsWon,
        pipelineValue: totalPipelineValue._sum.value?.toString() || '0',
        wonValue: totalWonValue._sum.value?.toString() || '0',
        winRate: dealsTotal > 0 ? ((dealsWon / dealsTotal) * 100).toFixed(1) : '0',
      },
      tasks: {
        total: tasksTotal,
        pending: tasksPending,
        overdue: tasksOverdue,
      },
      tickets: {
        total: ticketsTotal,
        open: ticketsOpen,
      },
      invoices: {
        total: invoicesTotal,
        paid: invoicesPaid,
        totalRevenue: totalRevenue._sum.total?.toString() || '0',
      },
      recentActivities,
    };
  }

  async getSalesPipelineData(userId?: string) {
    const where = userId ? { ownerId: userId } : {};

    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

    const pipelineData = await Promise.all(
      stages.map(async (stage) => {
        const [count, sum] = await Promise.all([
          prisma.deal.count({ where: { ...where, stage } }),
          prisma.deal.aggregate({ where: { ...where, stage }, _sum: { value: true } }),
        ]);
        return {
          stage,
          count,
          totalValue: sum._sum.value?.toString() || '0',
        };
      })
    );

    return pipelineData;
  }

  async getRevenueOverTime(period: 'week' | 'month' | 'quarter' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
    }

    const deals = await prisma.deal.findMany({
      where: {
        status: 'won',
        actualCloseDate: { gte: startDate },
      },
      select: {
        value: true,
        actualCloseDate: true,
      },
      orderBy: { actualCloseDate: 'asc' },
    });

    return deals.map(d => ({
      date: d.actualCloseDate?.toISOString() || '',
      value: d.value.toString(),
    }));
  }

  async getTopPerformers(limit: number = 5) {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        _count: {
          select: {
            contacts: true,
            deals: true,
          },
        },
      },
    });

    // Get won deals per user
    const userStats = await Promise.all(
      users.map(async (user) => {
        const wonDeals = await prisma.deal.aggregate({
          where: { ownerId: user.id, status: 'won' },
          _sum: { value: true },
          _count: true,
        });

        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
          contacts: user._count.contacts,
          deals: user._count.deals,
          wonDeals: wonDeals._count,
          wonValue: wonDeals._sum.value?.toString() || '0',
        };
      })
    );

    return userStats
      .sort((a, b) => parseFloat(b.wonValue) - parseFloat(a.wonValue))
      .slice(0, limit);
  }

  async getUpcomingTasks(userId?: string, limit: number = 10) {
    const where: any = {
      status: { not: 'completed' },
      dueDate: { gte: new Date() },
    };
    if (userId) where.assignedToId = userId;

    return prisma.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
      take: limit,
    });
  }

  async getUpcomingAppointments(userId?: string, limit: number = 10) {
    const where: any = {
      status: { in: ['scheduled', 'confirmed'] },
      startTime: { gte: new Date() },
    };
    if (userId) where.createdById = userId;

    return prisma.appointment.findMany({
      where,
      include: {
        contact: { select: { id: true, firstName: true, lastName: true } },
        deal: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
      take: limit,
    });
  }
}

export default new AnalyticsService();
