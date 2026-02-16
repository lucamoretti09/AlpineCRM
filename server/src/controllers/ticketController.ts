import { Request, Response, NextFunction } from 'express';
import ticketService from '../services/ticketService';

export const createTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await ticketService.createTicket(req.body, req.user?.id);
    res.status(201).json({ success: true, data: ticket });
  } catch (error) { next(error); }
};

export const getTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      priority: req.query.priority as string,
      category: req.query.category as string,
      assignedToId: req.query.assignedToId as string,
      contactId: req.query.contactId as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };
    const result = await ticketService.getTickets(filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getTicketById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id, req.user?.id);
    res.status(200).json({ success: true, data: ticket });
  } catch (error) { next(error); }
};

export const updateTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.body, req.user?.id);
    res.status(200).json({ success: true, data: ticket });
  } catch (error) { next(error); }
};

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comment = await ticketService.addComment(req.params.id, req.body, req.user!.id);
    res.status(201).json({ success: true, data: comment });
  } catch (error) { next(error); }
};

export const deleteTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ticketService.deleteTicket(req.params.id, req.user?.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getTicketStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await ticketService.getTicketStats(req.query.assignedToId as string || req.user?.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) { next(error); }
};
