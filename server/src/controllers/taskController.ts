import { Request, Response, NextFunction } from 'express';
import taskService from '../services/taskService';

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.createTask(req.body, req.user?.id);
    res.status(201).json({ success: true, data: task });
  } catch (error) { next(error); }
};

export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      search: req.query.search as string,
      type: req.query.type as string,
      priority: req.query.priority as string,
      status: req.query.status as string,
      assignedToId: req.query.assignedToId as string,
      contactId: req.query.contactId as string,
      dealId: req.query.dealId as string,
      dueDateFrom: req.query.dueDateFrom as string,
      dueDateTo: req.query.dueDateTo as string,
      overdue: req.query.overdue === 'true',
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
    };
    const result = await taskService.getTasks(filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user?.id);
    res.status(200).json({ success: true, data: task });
  } catch (error) { next(error); }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user?.id);
    res.status(200).json({ success: true, data: task });
  } catch (error) { next(error); }
};

export const completeTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await taskService.completeTask(req.params.id, req.user?.id);
    res.status(200).json({ success: true, data: task });
  } catch (error) { next(error); }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.user?.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getTaskStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.query.assignedToId as string || req.user?.id;
    const stats = await taskService.getTaskStats(userId);
    res.status(200).json({ success: true, data: stats });
  } catch (error) { next(error); }
};
