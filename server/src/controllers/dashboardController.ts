import { Request, Response, NextFunction } from 'express';
import analyticsService from '../services/analyticsService';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await analyticsService.getDashboardStats(req.user?.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) { next(error); }
};

export const getSalesPipeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getSalesPipelineData(req.user?.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getRevenueOverTime = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as 'week' | 'month' | 'quarter' | 'year') || 'month';
    const data = await analyticsService.getRevenueOverTime(period);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getTopPerformers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const data = await analyticsService.getTopPerformers(limit);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getUpcomingTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await analyticsService.getUpcomingTasks(req.user?.id);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) { next(error); }
};

export const getUpcomingAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointments = await analyticsService.getUpcomingAppointments(req.user?.id);
    res.status(200).json({ success: true, data: appointments });
  } catch (error) { next(error); }
};
