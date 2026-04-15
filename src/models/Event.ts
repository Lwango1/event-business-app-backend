import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: ['conference', 'wedding', 'corporate', 'social', 'other'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  location: String,
  capacity: Number,
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'planning',
  },
  budget: Number,
  spent: {
    type: Number,
    default: 0,
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  }],
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: Number,
    price: Number,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Event = mongoose.model('Event', eventSchema);
