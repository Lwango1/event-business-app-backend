import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: String,
  company: String,
  address: String,
  city: String,
  postalCode: String,
  country: String,
  type: {
    type: String,
    enum: ['individual', 'company'],
    default: 'individual',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect'],
    default: 'prospect',
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Client = mongoose.model('Client', clientSchema);
