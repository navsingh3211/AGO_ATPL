/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import express from 'express';
import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

import {
  vendorPurchaseReqCount,
  vendorPurchaseReqGraphData
} from '../controllers/vendorPurchaseReqDashboard.controller.js';

const router = express.Router();

router.get('/vendor-purchase-req-count',[validateToken, isAdmin],vendorPurchaseReqCount);
router.get('/vendor-purchase-req-graph-data',[validateToken, isAdmin],vendorPurchaseReqGraphData);




export default router;
