import { Sale } from '../models/Sale.js';
import { Invoice } from '../models/Invoice.js';

export const getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('client', 'name email')
      .populate('event', 'name startDate')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des ventes' });
  }
};

export const createSale = async (req, res) => {
  try {
    const { client, event, items } = req.body;

    let subtotal = 0;
    items.forEach(item => {
      item.total = item.quantity * item.unitPrice;
      subtotal += item.total;
    });

    const tax = subtotal * 0.19; // 19% VAT
    const total = subtotal + tax;
    const saleNumber = `SALE-${Date.now()}`;

    const sale = new Sale({
      saleNumber,
      client,
      event,
      items,
      subtotal,
      tax,
      total,
    });

    await sale.save();

    // Create and save invoice
    const invoiceNumber = `INV-${Date.now()}`;
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const invoice = new Invoice({
      invoiceNumber,
      sale: sale._id,
      client,
      dueDate,
      amount: total,
    });

    await invoice.save();

    await sale.populate('client', 'name email');
    await sale.populate('items.product', 'name');

    res.status(201).json({ sale, invoice });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de la vente' });
  }
};

export const updateSaleStatus = async (req, res) => {
  try {
    const { status, paymentStatus, paymentDate } = req.body;
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus, paymentDate, updatedAt: new Date() },
      { new: true }
    ).populate('client', 'name email');

    if (!sale) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }
    res.json(sale);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour de la vente' });
  }
};
