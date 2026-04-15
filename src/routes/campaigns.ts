import express from 'express';
import * as campaignController from '../controllers/campaignController.js';

const router = express.Router();

router.get('/', campaignController.getAllCampaigns);
router.post('/', campaignController.createCampaign);
router.put('/:id', campaignController.updateCampaign);
router.put('/:id/metrics', campaignController.updateCampaignMetrics);

export default router;
