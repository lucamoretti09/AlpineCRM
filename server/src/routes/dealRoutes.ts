import { Router } from 'express';
import {
  createDeal,
  getDeals,
  getDealsByStage,
  getDealById,
  updateDeal,
  updateDealStage,
  deleteDeal,
  getDealStats,
  getDealForecast,
} from '../controllers/dealController';
import { protect } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  createDealSchema,
  updateDealSchema,
  updateDealStageSchema,
} from '../validators/dealValidator';

const router = Router();

// All routes require authentication
router.use(protect);

// Statistics and forecast routes (must be before /:id routes)
router.get('/stats', getDealStats);
router.get('/forecast', getDealForecast);
router.get('/kanban', getDealsByStage);

// CRUD routes
router.post('/', validateRequest(createDealSchema), createDeal);
router.get('/', getDeals);
router.get('/:id', getDealById);
router.put('/:id', validateRequest(updateDealSchema), updateDeal);
router.delete('/:id', deleteDeal);

// Stage update (for Kanban drag-and-drop)
router.patch('/:id/stage', validateRequest(updateDealStageSchema), updateDealStage);

export default router;
