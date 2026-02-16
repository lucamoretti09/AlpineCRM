import { PrismaClient, Prisma } from '@prisma/client';
import activityService from './activityService';
import { NotFoundError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface CreateContactData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  jobTitle?: string;
  website?: string;
  linkedinUrl?: string;
  address?: Record<string, any>;
  status?: 'active' | 'inactive' | 'churned';
  source?: 'website' | 'referral' | 'social' | 'email' | 'event' | 'other';
  leadScore?: number;
  tags?: string[];
  ownerId?: string;
  customFields?: Record<string, any>;
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface ContactFilters {
  search?: string;
  status?: string;
  source?: string;
  ownerId?: string;
  tags?: string[];
  company?: string;
  leadScoreMin?: number;
  leadScoreMax?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ContactService {
  /**
   * Create a new contact
   */
  async createContact(data: CreateContactData, userId?: string) {
    const contact = await prisma.contact.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        mobile: data.mobile,
        company: data.company,
        jobTitle: data.jobTitle,
        website: data.website,
        linkedinUrl: data.linkedinUrl,
        address: data.address || {},
        status: data.status || 'active',
        source: data.source,
        leadScore: data.leadScore || 0,
        tags: data.tags || [],
        ownerId: data.ownerId || userId,
        customFields: data.customFields || {},
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
      },
    });

    // Log activity
    await activityService.logContactActivity(
      'created',
      contact.id,
      `Contact created: ${contact.firstName} ${contact.lastName}`,
      `New contact added to the system${contact.company ? ` from ${contact.company}` : ''}`,
      userId,
      { contactEmail: contact.email, company: contact.company }
    );

    return contact;
  }

  /**
   * Get all contacts with filters
   */
  async getContacts(filters: ContactFilters) {
    const {
      search,
      status,
      source,
      ownerId,
      tags,
      company,
      leadScoreMin,
      leadScoreMax,
      limit = 50,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    // Build where clause
    const where: Prisma.ContactWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status as any;
    }

    if (source) {
      where.source = source as any;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (leadScoreMin !== undefined || leadScoreMax !== undefined) {
      where.leadScore = {};
      if (leadScoreMin !== undefined) {
        where.leadScore.gte = leadScoreMin;
      }
      if (leadScoreMax !== undefined) {
        where.leadScore.lte = leadScoreMax;
      }
    }

    // Build orderBy
    const orderBy: Prisma.ContactOrderByWithRelationInput = {};
    if (sortBy === 'name') {
      orderBy.firstName = sortOrder;
    } else if (sortBy === 'company') {
      orderBy.company = sortOrder;
    } else if (sortBy === 'leadScore') {
      orderBy.leadScore = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
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
          _count: {
            select: {
              deals: true,
              tasks: true,
              activities: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.contact.count({ where }),
    ]);

    return {
      contacts,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get contact by ID
   */
  async getContactById(contactId: string, userId?: string) {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
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
        lead: true,
        deals: {
          orderBy: { createdAt: 'desc' },
          take: 5,
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
            deals: true,
            tasks: true,
            tickets: true,
            appointments: true,
            invoices: true,
            emails: true,
            activities: true,
          },
        },
      },
    });

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    // Log view activity
    if (userId) {
      await activityService.logContactActivity(
        'viewed',
        contactId,
        `Contact viewed: ${contact.firstName} ${contact.lastName}`,
        undefined,
        userId
      );
    }

    return contact;
  }

  /**
   * Update contact
   */
  async updateContact(contactId: string, data: UpdateContactData, userId?: string) {
    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact) {
      throw new NotFoundError('Contact not found');
    }

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        mobile: data.mobile,
        company: data.company,
        jobTitle: data.jobTitle,
        website: data.website,
        linkedinUrl: data.linkedinUrl,
        address: data.address,
        status: data.status,
        source: data.source,
        leadScore: data.leadScore,
        tags: data.tags,
        ownerId: data.ownerId,
        customFields: data.customFields,
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
      },
    });

    // Detect changes and log activity
    const changes: string[] = [];
    if (data.status && data.status !== existingContact.status) {
      changes.push(`status changed from ${existingContact.status} to ${data.status}`);
    }
    if (data.ownerId && data.ownerId !== existingContact.ownerId) {
      changes.push(`owner changed`);
    }
    if (data.leadScore !== undefined && data.leadScore !== existingContact.leadScore) {
      changes.push(`lead score updated to ${data.leadScore}`);
    }

    await activityService.logContactActivity(
      'updated',
      contact.id,
      `Contact updated: ${contact.firstName} ${contact.lastName}`,
      changes.length > 0 ? changes.join(', ') : 'Contact information updated',
      userId,
      { changes }
    );

    return contact;
  }

  /**
   * Delete contact
   */
  async deleteContact(contactId: string, userId?: string) {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      select: { firstName: true, lastName: true },
    });

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    await prisma.contact.delete({
      where: { id: contactId },
    });

    // Log activity
    await activityService.createActivity({
      type: 'deleted',
      title: `Contact deleted: ${contact.firstName} ${contact.lastName}`,
      description: 'Contact permanently removed from the system',
      userId,
    });

    return { message: 'Contact deleted successfully' };
  }

  /**
   * Update contact lead score
   */
  async updateLeadScore(contactId: string, leadScore: number, userId?: string) {
    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: { leadScore },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        leadScore: true,
      },
    });

    await activityService.logContactActivity(
      'updated',
      contactId,
      `Lead score updated to ${leadScore}`,
      `Lead scoring updated for ${contact.firstName} ${contact.lastName}`,
      userId,
      { leadScore }
    );

    return contact;
  }

  /**
   * Assign contact to owner
   */
  async assignContact(contactId: string, ownerId: string, userId?: string) {
    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await activityService.logContactActivity(
      'assigned',
      contactId,
      `Contact assigned to ${contact.owner?.firstName} ${contact.owner?.lastName}`,
      undefined,
      userId,
      { ownerId, ownerName: `${contact.owner?.firstName} ${contact.owner?.lastName}` }
    );

    return contact;
  }

  /**
   * Add tags to contact
   */
  async addTags(contactId: string, tags: string[], userId?: string) {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      select: { tags: true, firstName: true, lastName: true },
    });

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    const existingTags = contact.tags || [];
    const newTags = Array.from(new Set([...existingTags, ...tags]));

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: { tags: newTags },
    });

    await activityService.logContactActivity(
      'updated',
      contactId,
      `Tags added to ${contact.firstName} ${contact.lastName}`,
      `Tags: ${tags.join(', ')}`,
      userId,
      { tagsAdded: tags }
    );

    return updatedContact;
  }

  /**
   * Remove tags from contact
   */
  async removeTags(contactId: string, tags: string[], userId?: string) {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      select: { tags: true, firstName: true, lastName: true },
    });

    if (!contact) {
      throw new NotFoundError('Contact not found');
    }

    const existingTags = contact.tags || [];
    const newTags = existingTags.filter((tag) => !tags.includes(tag));

    const updatedContact = await prisma.contact.update({
      where: { id: contactId },
      data: { tags: newTags },
    });

    await activityService.logContactActivity(
      'updated',
      contactId,
      `Tags removed from ${contact.firstName} ${contact.lastName}`,
      `Tags: ${tags.join(', ')}`,
      userId,
      { tagsRemoved: tags }
    );

    return updatedContact;
  }

  /**
   * Get contact statistics
   */
  async getContactStats(userId?: string) {
    const where: Prisma.ContactWhereInput = userId ? { ownerId: userId } : {};

    const [total, active, inactive, churned, bySource] = await Promise.all([
      prisma.contact.count({ where }),
      prisma.contact.count({ where: { ...where, status: 'active' } }),
      prisma.contact.count({ where: { ...where, status: 'inactive' } }),
      prisma.contact.count({ where: { ...where, status: 'churned' } }),
      prisma.contact.groupBy({
        by: ['source'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: {
        active,
        inactive,
        churned,
      },
      bySource: bySource.reduce((acc: any, item) => {
        acc[item.source || 'unknown'] = item._count;
        return acc;
      }, {}),
    };
  }

  /**
   * Bulk import contacts
   */
  async bulkImportContacts(contacts: CreateContactData[], userId?: string) {
    const created = [];
    const errors = [];

    for (const contactData of contacts) {
      try {
        const contact = await this.createContact(contactData, userId);
        created.push(contact);
      } catch (error: any) {
        errors.push({
          contact: contactData,
          error: error.message,
        });
      }
    }

    if (created.length > 0) {
      await activityService.createActivity({
        type: 'created',
        title: `Bulk import: ${created.length} contacts added`,
        description: `${created.length} contacts successfully imported`,
        userId,
        metadata: { importedCount: created.length, errorCount: errors.length },
      });
    }

    return {
      success: created.length,
      failed: errors.length,
      contacts: created,
      errors,
    };
  }
}

export default new ContactService();
