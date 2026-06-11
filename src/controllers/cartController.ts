import { Response } from 'express';
import Cart from '../models/Cart';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Add item to cart
 * POST /api/cart
 */
export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity } = req.body;
    // Fix: Cast to any to bypass strict TypeScript checking for 'sub'
    const userId = req.user?.id || (req.user as any)?.sub;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized. User identification missing.' });
      return;
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity }],
      });
    } else {
      const itemIndex = cart.products.findIndex(
        (p: any) => p.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.products[itemIndex].quantity += quantity || 1;
      } else {
        cart.products.push({ product: productId, quantity });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
};

/**
 * Get cart
 * GET /api/cart
 */
export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.user as any)?.sub;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const cart = await Cart.findOne({ user: userId }).populate('products.product');
    res.json(cart || { products: [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

/**
 * Clear cart
 */
export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.user as any)?.sub;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await Cart.findOneAndDelete({ user: userId });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};