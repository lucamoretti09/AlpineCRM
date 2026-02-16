import { Request, Response, NextFunction } from 'express';
import appointmentService from '../services/appointmentService';

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await appointmentService.createAppointment(req.body, req.user?.id);
    res.status(201).json({ success: true, data: appointment });
  } catch (error) { next(error); }
};

export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      contactId: req.query.contactId as string,
      dealId: req.query.dealId as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      createdById: req.query.createdById as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      sortBy: req.query.sortBy as string || 'startTime',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
    };
    const result = await appointmentService.getAppointments(filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getAppointmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) { next(error); }
};

export const updateAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body, req.user?.id);
    res.status(200).json({ success: true, data: appointment });
  } catch (error) { next(error); }
};

export const deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await appointmentService.deleteAppointment(req.params.id, req.user?.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};
