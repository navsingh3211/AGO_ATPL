/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
// eslint-disable-next-line max-len

import express from 'express';
import {
  getTotalCountForDashboard,
  getItemDetailsChart,
  getViewDataForLowStockItem,
  orderLifeCycle,
  orderDetailsTimewise
} from '../controllers/dashboard.controller.js';

import { validateToken } from '../middlewares/jwt.middleware.js';


const router = express.Router();

router.get('/get-total-count-for-dashboard',[validateToken], getTotalCountForDashboard);

router.get('/get-item-details-chart',[validateToken], getItemDetailsChart);

router.get('/view-low-stock-item-details',[validateToken], getViewDataForLowStockItem);

router.get('/orderLifeCycle',[validateToken], orderLifeCycle);

router.post('/orderDetailsTimewise',[validateToken], orderDetailsTimewise);


export default router;
