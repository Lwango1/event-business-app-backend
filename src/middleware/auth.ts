import * as jwt from 'jwt-simple';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export interface IAuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.decode(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

export const generateToken = (userId: string, email: string) => {
  return jwt.encode(
    { id: userId, email },
    JWT_SECRET
  );
};

export const requireRole = (allowedRoles: string[]) => {
  return async (req: IAuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Non authentifié' });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Accès refusé. Rôle insuffisant' });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la vérification du rôle' });
    }
  };
};
