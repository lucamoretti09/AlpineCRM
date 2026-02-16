import { Request, Response, NextFunction } from 'express';
import contactService from '../services/contactService';

/**
 * Create a new contact
 * @route POST /api/contacts
 * @access Private
 */
export const createContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contact = await contactService.createContact(req.body, req.user?.id);

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all contacts
 * @route GET /api/contacts
 * @access Private
 */
export const getContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      source: req.query.source as string,
      ownerId: req.query.ownerId as string,
      company: req.query.company as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      leadScoreMin: req.query.leadScoreMin ? parseInt(req.query.leadScoreMin as string) : undefined,
      leadScoreMax: req.query.leadScoreMax ? parseInt(req.query.leadScoreMax as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await contactService.getContacts(filters);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get contact by ID
 * @route GET /api/contacts/:id
 * @access Private
 */
export const getContactById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contact = await contactService.getContactById(req.params.id, req.user?.id);

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update contact
 * @route PUT /api/contacts/:id
 * @access Private
 */
export const updateContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contact = await contactService.updateContact(
      req.params.id,
      req.body,
      req.user?.id
    );

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete contact
 * @route DELETE /api/contacts/:id
 * @access Private
 */
export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await contactService.deleteContact(req.params.id, req.user?.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update contact lead score
 * @route PATCH /api/contacts/:id/lead-score
 * @access Private
 */
export const updateLeadScore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { leadScore } = req.body;
    const contact = await contactService.updateLeadScore(
      req.params.id,
      leadScore,
      req.user?.id
    );

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign contact to owner
 * @route PATCH /api/contacts/:id/assign
 * @access Private
 */
export const assignContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ownerId } = req.body;
    const contact = await contactService.assignContact(
      req.params.id,
      ownerId,
      req.user?.id
    );

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add tags to contact
 * @route POST /api/contacts/:id/tags
 * @access Private
 */
export const addTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tags } = req.body;
    const contact = await contactService.addTags(req.params.id, tags, req.user?.id);

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove tags from contact
 * @route DELETE /api/contacts/:id/tags
 * @access Private
 */
export const removeTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tags } = req.body;
    const contact = await contactService.removeTags(req.params.id, tags, req.user?.id);

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get contact statistics
 * @route GET /api/contacts/stats
 * @access Private
 */
export const getContactStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.ownerId as string || req.user?.id;
    const stats = await contactService.getContactStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk import contacts
 * @route POST /api/contacts/bulk-import
 * @access Private
 */
export const bulkImportContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { contacts } = req.body;
    const result = await contactService.bulkImportContacts(contacts, req.user?.id);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
