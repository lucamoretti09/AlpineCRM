import { Router } from 'express';
import { chat } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(protect);

// AI Chat
router.post('/chat', chat);

export default router;
