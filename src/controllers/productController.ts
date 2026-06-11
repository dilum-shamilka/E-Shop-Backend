import { Request, Response } from 'express';
import Product from '../models/Product';

interface AuthRequest extends Request {
  user?: {
    id?: string;
    sub?: string;
    roles?: string[];
  };
  file?: any;
}

// 1. CREATE PRODUCT
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, price, stock, category } = req.body;
    if (!name || !description || !price || !category) {
      res.status(400).json({ message: 'Required fields missing' });
      return;
    }

    // Auth Middleware එකෙන් එන User ID එක හරියටම තෝරාගැනීම
    const sellerId = req.user?.sub || req.user?.id;
    if (!sellerId) {
      res.status(401).json({ message: 'Unauthorized. Seller ID missing.' });
      return;
    }

    const imageUrl = req.file ? req.file.path : '';
    
    const product = new Product({
      name,
      description,
      price: Number(price),
      stock: Number(stock || 0),
      category,
      image: imageUrl,
      seller: sellerId,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// 2. GET ALL PRODUCTS (Homepage එකට දත්ත යවන්නේ මෙතනින්)
export const getProducts = async (_req: Request, res: Response) => {
  try {
    // 💡 මෙතන populate('seller', 'name email') කරද්දී DB එකේ seller කෙනෙක් නැතිනම් හිස්ව එන්න පුළුවන්
    const products = await Product.find().populate('seller', 'name email').sort({ createdAt: -1 });
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 3. GET SINGLE PRODUCT BY ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 4. UPDATE PRODUCT
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user?.sub || req.user?.id;
    const product = await Product.findOne({ _id: req.params.id, seller: sellerId });
    
    if (!product) {
      res.status(404).json({ message: 'Product not found or unauthorized' });
      return;
    }
    
    const { name, description, price, stock, category } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (category) product.category = category;
    if (req.file) product.image = req.file.path;

    await product.save();
    res.json(product);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// 5. DELETE PRODUCT
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sellerId = req.user?.sub || req.user?.id;
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: sellerId });
    
    if (!product) {
      res.status(404).json({ message: 'Product not found or unauthorized' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};