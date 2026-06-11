import { Router } from 'express';
import { 
    createOrder, 
    getOrders, 
    getOrderById, 
    cancelOrder,
    deleteOrder,
    getSellerOrders, 
    updateOrderStatus 
} from '../controllers/orderController';
import { authenticate, isSeller } from '../middleware/authMiddleware';

const router = Router();

// සියලුම Order routes සඳහා ලොගින් වීම අනිවාර්ය වේ
router.use(authenticate);

// --- විකුණුම්කරු (Seller) සඳහා Routes ---
router.get('/seller/all', isSeller, getSellerOrders); 
router.patch('/:id/status', isSeller, updateOrderStatus); 

// --- පොදු පාරිභෝගිකයා සඳහා Routes ---
router.post('/', createOrder); 
router.get('/', getOrders); 

// --- ID එක අනුව සිදුකරන ක්‍රියාවන් ---
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.delete('/:id', deleteOrder);

export default router;