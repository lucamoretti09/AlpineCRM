import { Router } from 'express';
import { createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice, getInvoiceStats } from '../controllers/invoiceController';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/stats', getInvoiceStats);
router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
