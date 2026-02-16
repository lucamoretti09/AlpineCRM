import { Request, Response, NextFunction } from 'express';
import emailService from '../services/emailService';

export const sendEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = await emailService.sendEmail(req.body, req.user?.id);
    res.status(201).json({ success: true, data: email });
  } catch (error) { next(error); }
};

export const getEmails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      direction: req.query.direction as string,
      contactId: req.query.contactId as string,
      dealId: req.query.dealId as string,
      userId: req.query.userId as string || req.user?.id,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };
    const result = await emailService.getEmails(filters);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getEmailById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = await emailService.getEmailById(req.params.id);
    res.status(200).json({ success: true, data: email });
  } catch (error) { next(error); }
};

export const getEmailThread = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const emails = await emailService.getEmailThread(req.params.threadId);
    res.status(200).json({ success: true, data: emails });
  } catch (error) { next(error); }
};

export const trackEmailOpen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await emailService.trackEmailOpen(req.params.id);
    // Return a 1x1 transparent pixel for email tracking
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, { 'Content-Type': 'image/gif', 'Content-Length': pixel.length });
    res.end(pixel);
  } catch (error) { next(error); }
};

export const trackEmailClick = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await emailService.trackEmailClick(req.params.id);
    res.redirect(req.query.url as string || '/');
  } catch (error) { next(error); }
};

export const deleteEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await emailService.deleteEmail(req.params.id, req.user?.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getEmailTemplates = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await emailService.getEmailTemplates();
    res.status(200).json({ success: true, data: templates });
  } catch (error) { next(error); }
};

export const createEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await emailService.createEmailTemplate(req.body);
    res.status(201).json({ success: true, data: template });
  } catch (error) { next(error); }
};

export const updateEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await emailService.updateEmailTemplate(req.params.id, req.body);
    res.status(200).json({ success: true, data: template });
  } catch (error) { next(error); }
};

export const deleteEmailTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await emailService.deleteEmailTemplate(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};
