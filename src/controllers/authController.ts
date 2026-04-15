import { Request, Response } from 'express';
import * as bcryptjs from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, company, phone } = req.body;
    const role = 'buyer';

    // Validation basique
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Créer l'utilisateur
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      company,
      phone,
    });

    await user.save();

    // Générer un token
    const token = generateToken(user._id.toString(), user.email);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement:', error);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement' });
  }
};

export const registerSeller = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, company, phone } = req.body;
    const role = 'seller';

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      company,
      phone,
      status: 'active',
    });

    await user.save();

    res.status(201).json({
      message: 'Vendeur créé avec succès',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du vendeur:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du vendeur' });
  }
};

export const registerOwner = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, password, company, phone } = req.body;
    const role = 'owner';

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const ownerExists = await User.exists({ role: 'owner' });
    if (ownerExists) {
      if (!req.user || !req.user.id) {
        return res.status(403).json({ message: 'Un owner existe déjà, authentification requise' });
      }

      const currentUser = await User.findById(req.user.id);
      if (!currentUser || currentUser.role !== 'owner') {
        return res.status(403).json({ message: 'Accès refusé. Rôle owner requis' });
      }
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      company,
      phone,
      status: 'active',
    });

    await user.save();

    res.status(201).json({
      message: 'Owner créé avec succès',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du owner:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du owner' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { role, status, firstName, lastName, company, phone } = req.body;

    const allowedRoles = ['owner', 'buyer', 'seller'];
    const allowedStatuses = ['active', 'inactive', 'suspended'];

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        ...(company ? { company } : {}),
        ...(phone ? { phone } : {}),
        updatedAt: new Date(),
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur mis à jour', user });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    // Chercher l'utilisateur
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si l'utilisateur est actif
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Compte désactivé ou suspendu' });
    }

    // Générer un token
    const token = generateToken(user._id.toString(), user.email);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const { firstName, lastName, phone, company, address, city, postalCode, country, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        phone,
        company,
        address,
        city,
        postalCode,
        country,
        avatar,
        updatedAt: new Date(),
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profil mis à jour',
      user,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
};
