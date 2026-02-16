import { Router } from 'express';
import { getDashboardStats, getSalesPipeline, getRevenueOverTime, getTopPerformers, getUpcomingTasks, getUpcomingAppointments } from '../controllers/dashboardController';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/pipeline', getSalesPipeline);
router.get('/revenue', getRevenueOverTime);
router.get('/top-performers', getTopPerformers);
router.get('/upcoming-tasks', getUpcomingTasks);
router.get('/upcoming-appointments', getUpcomingAppointments);

export default router;
