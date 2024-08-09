/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import express from 'express';
import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

import {
  addItemToOldStockMaster,
  getOldStockListing,
  editItemToOldStockMaster,
  viewOldStockDetails,
  downloadReceiptForOldStock
} from '../controllers/oldStockSellOut.controller.js';

const router = express.Router();

router.post(
  '/add-item-to-old-stock-master',
  [validateToken, isAdmin],
  addItemToOldStockMaster
);
router.post('/edit-item-to-old-stock-master', [validateToken, isAdmin], editItemToOldStockMaster);
router.get('/get-old-stock-listing', [validateToken, isAdmin], getOldStockListing);
router.get('/view-old-stock-details/:oldStockId', [validateToken, isAdmin], viewOldStockDetails);
router.get('/download-receipt-of-old-stock/:oldStockId', [validateToken, isAdmin], downloadReceiptForOldStock);

export default router;
