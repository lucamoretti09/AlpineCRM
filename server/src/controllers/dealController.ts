import { Request, Response, NextFunction } from 'express';
import dealService from '../services/dealService';

/**
 * Create a new deal
 * @route POST /api/deals
 * @access Private
 */
export const createDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deal = await dealService.createDeal(req.body, req.user?.id);

    res.status(201).json({
      success: true,
      data: deal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all deals
 * @route GET /api/deals
 * @access Private
 */
export const getDeals = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = {
      search: req.query.search as string,
      stage: req.query.stage as string,
      status: req.query.status as string,
      ownerId: req.query.ownerId as string,
      contactId: req.query.contactId as string,
      minValue: req.query.minValue ? parseFloat(req.query.minValue as string) : undefined,
      maxValue: req.query.maxValue ? parseFloat(req.query.maxValue as string) : undefined,
      expectedCloseDateFrom: req.query.expectedCloseDateFrom as string,
      expectedCloseDateTo: req.query.expectedCloseDateTo as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await dealService.getDeals(filters);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get deals grouped by stage (Kanban board)
 * @route GET /api/deals/kanban
 * @access Private
 */
export const getDealsByStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = req.query.ownerId as string || req.user?.id;
    const result = await dealService.getDealsByStage(ownerId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get deal by ID
 * @route GET /api/deals/:id
 * @access Private
 */
export const getDealById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deal = await dealService.getDealById(req.params.id, req.user?.id);

    res.status(200).json({
      success: true,
      data: deal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update deal
 * @route PUT /api/deals/:id
 * @access Private
 */
export const updateDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deal = await dealService.updateDeal(req.params.id, req.body, req.user?.id);

    res.status(200).json({
      success: true,
      data: deal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update deal stage
 * @route PATCH /api/deals/:id/stage
 * @access Private
 */
export const updateDealStage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { stage } = req.body;
    const deal = await dealService.updateDealStage(req.params.id, stage, req.user?.id);

    res.status(200).json({
      success: true,
      data: deal,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete deal
 * @route DELETE /api/deals/:id
 * @access Private
 */
export const deleteDeal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await dealService.deleteDeal(req.params.id, req.user?.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get deal statistics
 * @route GET /api/deals/stats
 * @access Private
 */
export const getDealStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.ownerId as string || req.user?.id;
    const stats = await dealService.getDealStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get deal forecast
 * @route GET /api/deals/forecast
 * @access Private
 */
export const getDealForecast = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.query.ownerId as string || req.user?.id;
    const forecast = await dealService.getDealForecast(userId);

    res.status(200).json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    next(error);
  }
};
