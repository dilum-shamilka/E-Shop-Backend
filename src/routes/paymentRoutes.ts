import { Router } from 'express';
import { initiatePayment, paymentNotify } from '../controllers/paymentController';

const router = Router();

router.post('/initiate', initiatePayment);
router.post('/notify', paymentNotify);

export default router;