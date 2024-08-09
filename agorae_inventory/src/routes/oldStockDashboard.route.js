/* eslint-disable prettier/prettier */
/* eslint-disable max-len */

import express from 'express';
import {
  oldStockSellCount,
  oldStockGraphData
} from '../controllers/oldStockDashboard.controller.js';

import { validateToken } from '../middlewares/jwt.middleware.js';


const router = express.Router();

router.get('/old-stock-sell-count',[validateToken], oldStockSellCount);
router.get('/old-stock-purchase-graph-data',[validateToken], oldStockGraphData);




export default router;
