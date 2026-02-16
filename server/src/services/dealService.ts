import { PrismaClient, Prisma } from '@prisma/client';
import activityService from './activityService';
import { NotFoundError } from '../middleware/errorHandler';
import { emitToRoom, broadcast } from '../socket';

const prisma = new PrismaClient();

export interface CreateDealData {
  name: string;
  contactId?: string;
  company?: string;
  value: number;
  currency?: string;
  stage?: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability?: number;
  expectedCloseDate?: Date | string;
  ownerId?: string;
  description?: string;
  products?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface UpdateDealData extends Partial<CreateDealData> {
  actualCloseDate?: Date | string;
  status?: 'open' | 'won' | 'lost';
}

export interface DealFilters {
  search?: string;
  stage?: string;
  status?: string;
  ownerId?: string;
  contactId?: string;
  minValue?: number;
  maxValue?: number;
  expectedCloseDateFrom?: string;
  expectedCloseDateTo?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class DealService {
  /**
   * Create a new deal
   */
  async createDeal(data: CreateDealData, userId?: string) {
    const deal = await prisma.deal.create({
      data: {
        name: data.name,
        contactId: data.contactId,
        company: data.company,
        value: data.value,
        currency: data.currency || 'USD',
        stage: data.stage || 'prospecting',
        probability: data.probability || 10,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
        ownerId: data.ownerId || userId,
        description: data.description,
        products: data.products || [],
        status: 'open',
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        },
      },
    });

    // Log activity
    await activityService.logDealActivity(
      'created',
      deal.id,
      `Deal created: ${deal.name}`,
      `New deal worth ${deal.currency} ${deal.value} in ${deal.stage} stage`,
      userId,
      { dealValue: deal.value.toString(), stage: deal.stage }
    );

    // Emit real-time event
    broadcast('deal:created', deal);

    return deal;
  }

  /**
   * Get all deals with filters
   */
  async getDeals(filters: DealFilters) {
    const {
      search,
      stage,
      status,
      ownerId,
      contactId,
      minValue,
      maxValue,
      expectedCloseDateFrom,
      expectedCloseDateTo,
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: Prisma.DealWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (stage) {
      where.stage = stage as any;
    }

    if (status) {
      where.status = status as any;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (minValue !== undefined || maxValue !== undefined) {
      where.value = {};
      if (minValue !== undefined) {
        where.value.gte = minValue;
      }
      if (maxValue !== undefined) {
        where.value.lte = maxValue;
      }
    }

    if (expectedCloseDateFrom || expectedCloseDateTo) {
      where.expectedCloseDate = {};
      if (expectedCloseDateFrom) {
        where.expectedCloseDate.gte = new Date(expectedCloseDateFrom);
      }
      if (expectedCloseDateTo) {
        where.expectedCloseDate.lte = new Date(expectedCloseDateTo);
      }
    }

    // Build orderBy
    const orderBy: Prisma.DealOrderByWithRelationInput = {};
    if (sortBy === 'value') {
      orderBy.value = sortOrder;
    } else if (sortBy === 'expectedCloseDate') {
      orderBy.expectedCloseDate = sortOrder;
    } else if (sortBy === 'probability') {
      orderBy.probability = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              company: true,
            },
          },
          _count: {
            select: {
              tasks: true,
              activities: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.deal.count({ where }),
    ]);

    return {
      deals,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get deals grouped by stage (for Kanban board)
   */
  async getDealsByStage(ownerId?: string) {
    const where: Prisma.DealWhereInput = { status: 'open' };
    if (ownerId) {
      where.ownerId = ownerId;
    }

    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

    const dealsByStage = await Promise.all(
      stages.map(async (stage) => {
        const deals = await prisma.deal.findMany({
          where: { ...where, stage: stage as any },
          include: {
            owner: {
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
                company: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);

        return {
          stage,
          deals,
          count: deals.length,
          totalValue,
        };
      })
    );

    return dealsByStage;
  }

  /**
   * Get deal by ID
   */
  async getDealById(dealId: string, userId?: string) {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            mobile: true,
            company: true,
          },
        },
        tasks: {
          where: { status: { not: 'completed' } },
          orderBy: { dueDate: 'asc' },
          take: 10,
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20,
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
        _count: {
          select: {
            tasks: true,
            activities: true,
          },
        },
      },
    });

    if (!deal) {
      throw new NotFoundError('Deal not found');
    }

    // Log view activity
    if (userId) {
      await activityService.logDealActivity(
        'viewed',
        dealId,
        `Deal viewed: ${deal.name}`,
        undefined,
        userId
      );
    }

    return deal;
  }

  /**
   * Update deal
   */
  async updateDeal(dealId: string, data: UpdateDealData, userId?: string) {
    const existingDeal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!existingDeal) {
      throw new NotFoundError('Deal not found');
    }

    // Prepare update data
    const updateData: any = {
      name: data.name,
      contactId: data.contactId,
      company: data.company,
      value: data.value,
      currency: data.currency,
      stage: data.stage,
      probability: data.probability,
      expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : undefined,
      actualCloseDate: data.actualCloseDate ? new Date(data.actualCloseDate) : undefined,
      ownerId: data.ownerId,
      description: data.description,
      products: data.products,
      status: data.status,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const deal = await prisma.deal.update({
      where: { id: dealId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        },
      },
    });

    // Detect changes and log activity
    const changes: string[] = [];

    if (data.stage && data.stage !== existingDeal.stage) {
      changes.push(`stage changed from ${existingDeal.stage} to ${data.stage}`);

      // Update probability based on stage
      const stageProbabilities: Record<string, number> = {
        prospecting: 10,
        qualification: 25,
        proposal: 50,
        negotiation: 75,
        closed_won: 100,
        closed_lost: 0,
      };

      if (!data.probability && stageProbabilities[data.stage]) {
        await prisma.deal.update({
          where: { id: dealId },
          data: { probability: stageProbabilities[data.stage] },
        });
      }
    }

    if (data.value && Number(data.value) !== Number(existingDeal.value)) {
      changes.push(`value changed from ${existingDeal.value} to ${data.value}`);
    }

    if (data.status && data.status !== existingDeal.status) {
      changes.push(`status changed to ${data.status}`);

      if (data.status === 'won' || data.status === 'lost') {
        await prisma.deal.update({
          where: { id: dealId },
          data: { actualCloseDate: new Date() },
        });
      }
    }

    if (data.ownerId && data.ownerId !== existingDeal.ownerId) {
      changes.push(`owner changed`);
    }

    await activityService.logDealActivity(
      'updated',
      deal.id,
      `Deal updated: ${deal.name}`,
      changes.length > 0 ? changes.join(', ') : 'Deal information updated',
      userId,
      { changes }
    );

    // Emit real-time event
    broadcast('deal:updated', deal);

    return deal;
  }

  /**
   * Update deal stage (for Kanban drag-and-drop)
   */
  async updateDealStage(
    dealId: string,
    stage: string,
    userId?: string
  ) {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      select: { name: true, stage: true },
    });

    if (!deal) {
      throw new NotFoundError('Deal not found');
    }

    const oldStage = deal.stage;

    // Auto-update probability based on stage
    const stageProbabilities: Record<string, number> = {
      prospecting: 10,
      qualification: 25,
      proposal: 50,
      negotiation: 75,
      closed_won: 100,
      closed_lost: 0,
    };

    const updatedDeal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        stage: stage as any,
        probability: stageProbabilities[stage] || 50,
        status: stage === 'closed_won' ? 'won' : stage === 'closed_lost' ? 'lost' : 'open',
        actualCloseDate: (stage === 'closed_won' || stage === 'closed_lost') ? new Date() : null,
      },
      include: {
        owner: {
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
            company: true,
          },
        },
      },
    });

    await activityService.logDealActivity(
      'status_changed',
      dealId,
      `Deal moved: ${deal.name}`,
      `Stage changed from ${oldStage} to ${stage}`,
      userId,
      { oldStage, newStage: stage }
    );

    // Emit real-time event for Kanban update
    broadcast('deal:stage-changed', {
      dealId,
      oldStage,
      newStage: stage,
      deal: updatedDeal,
    });

    return updatedDeal;
  }

  /**
   * Delete deal
   */
  async deleteDeal(dealId: string, userId?: string) {
    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      select: { name: true },
    });

    if (!deal) {
      throw new NotFoundError('Deal not found');
    }

    await prisma.deal.delete({
      where: { id: dealId },
    });

    await activityService.createActivity({
      type: 'deleted',
      title: `Deal deleted: ${deal.name}`,
      description: 'Deal permanently removed from the system',
      userId,
    });

    // Emit real-time event
    broadcast('deal:deleted', { dealId });

    return { message: 'Deal deleted successfully' };
  }

  /**
   * Get deal statistics
   */
  async getDealStats(userId?: string) {
    const where: Prisma.DealWhereInput = userId ? { ownerId: userId } : {};

    const [
      total,
      open,
      won,
      lost,
      totalValue,
      wonValue,
      byStage,
    ] = await Promise.all([
      prisma.deal.count({ where }),
      prisma.deal.count({ where: { ...where, status: 'open' } }),
      prisma.deal.count({ where: { ...where, status: 'won' } }),
      prisma.deal.count({ where: { ...where, status: 'lost' } }),
      prisma.deal.aggregate({
        where,
        _sum: { value: true },
      }),
      prisma.deal.aggregate({
        where: { ...where, status: 'won' },
        _sum: { value: true },
      }),
      prisma.deal.groupBy({
        by: ['stage'],
        where,
        _count: true,
        _sum: { value: true },
      }),
    ]);

    return {
      total,
      byStatus: {
        open,
        won,
        lost,
      },
      totalValue: totalValue._sum.value?.toString() || '0',
      wonValue: wonValue._sum.value?.toString() || '0',
      winRate: total > 0 ? ((won / total) * 100).toFixed(2) : '0',
      byStage: byStage.reduce((acc: any, item) => {
        acc[item.stage] = {
          count: item._count,
          totalValue: item._sum.value?.toString() || '0',
        };
        return acc;
      }, {}),
    };
  }

  /**
   * Get deal forecast (expected revenue)
   */
  async getDealForecast(userId?: string) {
    const where: Prisma.DealWhereInput = {
      status: 'open',
    };

    if (userId) {
      where.ownerId = userId;
    }

    const deals = await prisma.deal.findMany({
      where,
      select: {
        value: true,
        probability: true,
        expectedCloseDate: true,
      },
    });

    const weightedValue = deals.reduce((sum, deal) => {
      return sum + (Number(deal.value) * (deal.probability / 100));
    }, 0);

    const totalPipeline = deals.reduce((sum, deal) => sum + Number(deal.value), 0);

    return {
      totalPipeline,
      weightedForecast: weightedValue,
      dealCount: deals.length,
    };
  }
}

export default new DealService();
