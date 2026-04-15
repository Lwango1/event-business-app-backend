import { Client } from '../models/Client.js';

export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des clients' });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du client' });
  }
};

export const createClient = async (req, res) => {
  try {
    const { name, email, phone, company, address, city, postalCode, country, type, notes } = req.body;

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const client = new Client({
      name,
      email,
      phone,
      company,
      address,
      city,
      postalCode,
      country,
      type,
      notes,
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création du client' });
  }
};

export const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    res.json(client);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour du client' });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du client' });
  }
};
