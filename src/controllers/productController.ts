import { Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find()
      .populate('sellerId', 'firstName lastName email company')
      .sort({ category: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des produits' });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ category: req.params.category })
      .populate('sellerId', 'firstName lastName email company');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des produits' });
  }
};

export const getProductsBySeller = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ sellerId: req.params.sellerId })
      .populate('sellerId', 'firstName lastName email company');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des produits du vendeur' });
  }
};

export const createProduct = async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const { name, description, category, price, quantity, sku } = req.body;

    // Validation
    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Les champs obligatoires manquent' });
    }

    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return res.status(400).json({ message: 'SKU déjà utilisé' });
    }

    const product = new Product({
      name,
      description,
      category,
      price,
      quantity,
      sku,
      sellerId: req.user.id,
    });

    await product.save();
    await product.populate('sellerId', 'firstName lastName email company');
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Erreur création produit:', error);
    res.status(400).json({ message: 'Erreur lors de la création du produit' });
  }
};

export const updateProduct = async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    // Vérifier que c'est le vendeur propriétaire du produit ou l'owner
    if (!product.sellerId || (product.sellerId.toString() !== req.user.id && currentUser.role !== 'owner')) {
      return res.status(403).json({ message: 'Vous ne pouvez pas modifier ce produit' });
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('sellerId', 'firstName lastName email company');

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour du produit' });
  }
};

export const deleteProduct = async (req: Request & { user?: { id: string } }, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    // Vérifier que c'est le vendeur propriétaire du produit ou l'owner
    if (!product.sellerId || (product.sellerId.toString() !== req.user.id && currentUser.role !== 'owner')) {
      return res.status(403).json({ message: 'Vous ne pouvez pas supprimer ce produit' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du produit' });
  }
};
