import { Router } from 'express';
import { sendEmail, getEmails, getEmailById, getEmailThread, trackEmailOpen, trackEmailClick, deleteEmail, getEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from '../controllers/emailController';
import { protect, optionalAuth } from '../middleware/auth';

const router = Router();

// Public tracking endpoints (no auth required)
router.get('/track/open/:id', trackEmailOpen);
router.get('/track/click/:id', trackEmailClick);

// Protected routes
router.use(protect);
router.post('/send', sendEmail);
router.get('/', getEmails);
router.get('/templates', getEmailTemplates);
router.post('/templates', createEmailTemplate);
router.put('/templates/:id', updateEmailTemplate);
router.delete('/templates/:id', deleteEmailTemplate);
router.get('/thread/:threadId', getEmailThread);
router.get('/:id', getEmailById);
router.delete('/:id', deleteEmail);

export default router;
