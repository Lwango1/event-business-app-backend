import { Event } from '../models/Event.js';

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email')
      .populate('attendees', 'name email')
      .populate('products.productId', 'name price')
      .sort({ startDate: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { name, description, type, startDate, endDate, location, capacity, organizer, budget } = req.body;

    const event = new Event({
      name,
      description,
      type,
      startDate,
      endDate,
      location,
      capacity,
      organizer,
      budget,
    });

    await event.save();
    await event.populate('organizer', 'name email');
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de l\'événement' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour de l\'événement' });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Événement non trouvé' });
    }
    res.json({ message: 'Événement supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'événement' });
  }
};
