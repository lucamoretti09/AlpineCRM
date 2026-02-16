import { Router } from 'express';
import {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  updateLeadScore,
  assignContact,
  addTags,
  removeTags,
  getContactStats,
  bulkImportContacts,
} from '../controllers/contactController';
import { protect } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import {
  createContactSchema,
  updateContactSchema,
  updateLeadScoreSchema,
  assignContactSchema,
  addTagsSchema,
  removeTagsSchema,
  bulkImportSchema,
} from '../validators/contactValidator';

const router = Router();

// All routes require authentication
router.use(protect);

// Statistics route (must be before /:id routes)
router.get('/stats', getContactStats);

// Bulk import
router.post('/bulk-import', validateRequest(bulkImportSchema), bulkImportContacts);

// CRUD routes
router.post('/', validateRequest(createContactSchema), createContact);
router.get('/', getContacts);
router.get('/:id', getContactById);
router.put('/:id', validateRequest(updateContactSchema), updateContact);
router.delete('/:id', deleteContact);

// Additional actions
router.patch('/:id/lead-score', validateRequest(updateLeadScoreSchema), updateLeadScore);
router.patch('/:id/assign', validateRequest(assignContactSchema), assignContact);
router.post('/:id/tags', validateRequest(addTagsSchema), addTags);
router.delete('/:id/tags', validateRequest(removeTagsSchema), removeTags);

export default router;
