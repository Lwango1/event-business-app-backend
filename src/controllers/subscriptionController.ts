import { Request, Response } from 'express';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { plan, paymentMethod } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'seller') {
      return res.status(403).json({ message: 'Seuls les vendeurs peuvent souscrire' });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({ userId, status: 'active' });
    if (existingSubscription) {
      return res.status(400).json({ message: 'Vous avez déjà un abonnement actif' });
    }

    const startDate = new Date();
    const endDate = new Date();
    if (plan === 'premium') {
      endDate.setMonth(endDate.getMonth() + 1); // 1 month for premium
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year for free? Wait, free is default, but perhaps free is limited.
    }

    const subscription = new Subscription({
      userId,
      plan,
      status: 'active',
      startDate,
      endDate,
      paymentMethod,
    });

    await subscription.save();

    res.status(201).json({
      message: 'Abonnement créé avec succès',
      subscription,
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'abonnement:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'abonnement' });
  }
};

export const getSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const subscription = await Subscription.findOne({ userId }).populate('userId', 'firstName lastName email');

    if (!subscription) {
      return res.status(404).json({ message: 'Aucun abonnement trouvé' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'abonnement:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'abonnement' });
  }
};

export const renewSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentMethod } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const subscription = await Subscription.findOne({ userId, status: 'active' });
    if (!subscription) {
      return res.status(404).json({ message: 'Aucun abonnement actif trouvé' });
    }

    const newEndDate = new Date(subscription.endDate);
    if (subscription.plan === 'premium') {
      newEndDate.setMonth(newEndDate.getMonth() + 1);
    } else {
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    }

    subscription.endDate = newEndDate;
    subscription.paymentMethod = paymentMethod;
    subscription.updatedAt = new Date();

    await subscription.save();

    res.json({
      message: 'Abonnement renouvelé avec succès',
      subscription,
    });
  } catch (error) {
    console.error('Erreur lors du renouvellement de l\'abonnement:', error);
    res.status(500).json({ message: 'Erreur lors du renouvellement de l\'abonnement' });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { userId, status: 'active' },
      { status: 'cancelled', updatedAt: new Date() },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ message: 'Aucun abonnement actif trouvé' });
    }

    res.json({
      message: 'Abonnement annulé avec succès',
      subscription,
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation de l\'abonnement' });
  }
};