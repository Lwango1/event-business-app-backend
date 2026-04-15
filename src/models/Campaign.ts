import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    enum: ['email', 'social', 'discount', 'seasonal', 'other'],
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
  targetAudience: String,
  budget: Number,
  status: {
    type: String,
    enum: ['planning', 'active', 'paused', 'completed'],
    default: 'planning',
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  }],
  metrics: {
    sent: {
      type: Number,
      default: 0,
    },
    opened: {
      type: Number,
      default: 0,
    },
    clicked: {
      type: Number,
      default: 0,
    },
    converted: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Campaign = mongoose.model('Campaign', campaignSchema);
