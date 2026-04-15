import { Request, Response } from 'express';
import { LiveSession } from '../models/LiveSession.js';
import { Subscription } from '../models/Subscription.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Placeholder for Zoom API call - in production, use axios to call Zoom API
const createZoomMeeting = async (topic: string, startTime: Date, duration: number) => {
  // Mock Zoom meeting creation
  // In real implementation: call Zoom API with JWT token
  const meetingId = Math.random().toString(36).substring(7);
  const joinUrl = `https://zoom.us/j/${meetingId}`;
  const startUrl = `https://zoom.us/s/${meetingId}`;

  return {
    meetingId,
    joinUrl,
    startUrl,
  };
};

export const createLiveSession = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, title, description, startTime, endTime } = req.body;
    const sellerId = req.user?.id;

    if (!sellerId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const user = await User.findById(sellerId);
    if (!user || user.role !== 'seller') {
      return res.status(403).json({ message: 'Seuls les vendeurs peuvent créer des sessions live' });
    }

    // Check if seller has active subscription
    const subscription = await Subscription.findOne({ userId: sellerId, status: 'active' });
    if (!subscription || subscription.plan !== 'premium') {
      return res.status(403).json({ message: 'Abonnement premium requis pour les sessions live' });
    }

    if (productId) {
      const product = await Product.findById(productId);
      if (!product || !product.sellerId || product.sellerId.toString() !== sellerId) {
        return res.status(403).json({ message: 'Produit non trouvé ou accès refusé' });
      }
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60)); // minutes

    // Create Zoom meeting
    const zoomData = await createZoomMeeting(title, start, duration);

    const liveSession = new LiveSession({
      sellerId,
      productId,
      title,
      description,
      zoomMeetingId: zoomData.meetingId,
      zoomJoinUrl: zoomData.joinUrl,
      zoomStartUrl: zoomData.startUrl,
      startTime: start,
      endTime: end,
    });

    await liveSession.save();

    res.status(201).json({
      message: 'Session live créée avec succès',
      liveSession,
    });
  } catch (error) {
    console.error('Erreur lors de la création de la session live:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la session live' });
  }
};

export const getLiveSessions = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user?.id;
    const { seller } = req.query; // if admin wants to see all

    let query = {};
    if (sellerId && !seller) {
      const user = await User.findById(sellerId);
      if (user?.role === 'seller') {
        query = { sellerId };
      }
    }

    const liveSessions = await LiveSession.find(query)
      .populate('sellerId', 'firstName lastName email')
      .populate('productId', 'name price')
      .sort({ startTime: -1 });

    res.json(liveSessions);
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions live:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des sessions live' });
  }
};

export const joinLiveSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }

    const liveSession = await LiveSession.findById(id);
    if (!liveSession) {
      return res.status(404).json({ message: 'Session live non trouvée' });
    }

    // Add user to participants if not already
    if (!liveSession.participants.some(p => p.toString() === userId)) {
      liveSession.participants.push(new mongoose.Types.ObjectId(userId));
      await liveSession.save();
    }

    res.json({
      message: 'Rejoint la session live',
      joinUrl: liveSession.zoomJoinUrl,
    });
  } catch (error) {
    console.error('Erreur lors de la participation à la session live:', error);
    res.status(500).json({ message: 'Erreur lors de la participation à la session live' });
  }
};

export const updateLiveSessionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.user?.id;

    const liveSession = await LiveSession.findById(id);
    if (!liveSession || liveSession.sellerId.toString() !== sellerId) {
      return res.status(403).json({ message: 'Session non trouvée ou accès refusé' });
    }

    liveSession.status = status;
    liveSession.updatedAt = new Date();
    await liveSession.save();

    res.json({
      message: 'Statut de la session mis à jour',
      liveSession,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
  }
};