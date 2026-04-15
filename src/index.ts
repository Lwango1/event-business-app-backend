import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import eventRoutes from './routes/events.js';
import productRoutes from './routes/products.js';
import saleRoutes from './routes/sales.js';
import invoiceRoutes from './routes/invoices.js';
import campaignRoutes from './routes/campaigns.js';
import subscriptionRoutes from './routes/subscriptions.js';
import liveSessionRoutes from './routes/liveSessions.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/event-business';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch((err) => console.error('Erreur MongoDB:', err));

// Routes publiques
app.use('/auth', authRoutes);
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur API actif' });
});

// Toutes les routes suivantes nécessitent une authentification
app.use(authMiddleware);
app.use('/clients', clientRoutes);
app.use('/events', eventRoutes);
app.use('/products', productRoutes);
app.use('/sales', saleRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/live-sessions', liveSessionRoutes);

const server = app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});

server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Le port ${PORT} est déjà utilisé`);
    setTimeout(() => {
      server.close();
      process.exit(1);
    }, 1000);
  } else {
    console.error('Erreur serveur:', error);
  }
});

export default app;
