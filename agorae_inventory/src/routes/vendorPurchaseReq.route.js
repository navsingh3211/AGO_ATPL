/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import express from 'express';
import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

import {
  editVendorPurchaseReq,
  getVendorReqListing,
  viewVendorRequest,
  downloadVendorPurchaseReceipt
} from '../controllers/vendorPurchaseReq.controller.js';

const router = express.Router();

router.post(
  '/edit-vendor-purchase-request',
  [validateToken,isAdmin],
  editVendorPurchaseReq
);

router.get('/get-vendor-req-listing',[validateToken,isAdmin],getVendorReqListing);
router.get('/view-vendor-request/:vendorPurchaseId',[validateToken,isAdmin],viewVendorRequest);
router.get('/download-vendor-purchase-receipt/:vendorPurchaseId',[validateToken,isAdmin],downloadVendorPurchaseReceipt);



export default router;
