import { Router } from 'express';
import { createTicket, getTickets, getTicketById, updateTicket, addComment, deleteTicket, getTicketStats } from '../controllers/ticketController';
import { protect } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createTicketSchema, updateTicketSchema, addCommentSchema } from '../validators/ticketValidator';

const router = Router();
router.use(protect);

router.get('/stats', getTicketStats);
router.post('/', validateRequest(createTicketSchema), createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.put('/:id', validateRequest(updateTicketSchema), updateTicket);
router.post('/:id/comments', validateRequest(addCommentSchema), addComment);
router.delete('/:id', deleteTicket);

export default router;
