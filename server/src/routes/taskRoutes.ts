import { Router } from 'express';
import {
  createTask, getTasks, getTaskById, updateTask,
  completeTask, deleteTask, getTaskStats,
} from '../controllers/taskController';
import { protect } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { createTaskSchema, updateTaskSchema } from '../validators/taskValidator';

const router = Router();
router.use(protect);

router.get('/stats', getTaskStats);
router.post('/', validateRequest(createTaskSchema), createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', validateRequest(updateTaskSchema), updateTask);
router.patch('/:id/complete', completeTask);
router.delete('/:id', deleteTask);

export default router;
