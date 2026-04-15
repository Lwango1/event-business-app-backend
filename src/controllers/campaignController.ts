import { Campaign } from '../models/Campaign.js';

export const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('recipients', 'name email')
      .sort({ startDate: -1 });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des campagnes' });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const { name, description, type, startDate, endDate, targetAudience, budget, recipients } = req.body;

    const campaign = new Campaign({
      name,
      description,
      type,
      startDate,
      endDate,
      targetAudience,
      budget,
      recipients,
    });

    await campaign.save();
    await campaign.populate('recipients', 'name email');
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de la campagne' });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('recipients', 'name email');

    if (!campaign) {
      return res.status(404).json({ message: 'Campagne non trouvée' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour de la campagne' });
  }
};

export const updateCampaignMetrics = async (req, res) => {
  try {
    const { metrics } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { metrics },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ message: 'Campagne non trouvée' });
    }
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour des métriques' });
  }
};
