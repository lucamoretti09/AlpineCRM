import { Request, Response, NextFunction } from 'express';
import notificationService from '../services/notificationService';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.getNotifications(req.user!.id, {
      read: req.query.read,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.getUnreadCount(req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.id);
    res.status(200).json({ success: true, data: notification });
  } catch (error) { next(error); }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.markAllAsRead(req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.deleteNotification(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};
