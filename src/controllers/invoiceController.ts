import { Invoice } from '../models/Invoice.js';

export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('client', 'name email')
      .populate('sale', 'saleNumber total')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des factures' });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('client', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Facture non trouvée' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour de la facture' });
  }
};

export const getInvoicesByClient = async (req, res) => {
  try {
    const invoices = await Invoice.find({ client: req.params.clientId })
      .populate('sale', 'saleNumber total');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des factures' });
  }
};
