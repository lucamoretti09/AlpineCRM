import { Request, Response, NextFunction } from 'express';
import invoiceService from '../services/invoiceService';

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.createInvoice(req.body, req.user?.id);
    res.status(201).json({ success: true, data: invoice });
  } catch (error) { next(error); }
};

export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      contactId: req.query.contactId as string,
      dealId: req.query.dealId as string,
      dueDateFrom: req.query.dueDateFrom as string,
      dueDateTo: req.query.dueDateTo as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };
    const result = await invoiceService.getInvoices(filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    res.status(200).json({ success: true, data: invoice });
  } catch (error) { next(error); }
};

export const updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body, req.user?.id);
    res.status(200).json({ success: true, data: invoice });
  } catch (error) { next(error); }
};

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await invoiceService.deleteInvoice(req.params.id, req.user?.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getInvoiceStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await invoiceService.getInvoiceStats(req.user?.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) { next(error); }
};
