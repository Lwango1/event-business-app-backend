import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
  },
  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: Date,
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Invoice = mongoose.model('Invoice', invoiceSchema);
