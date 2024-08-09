/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
// eslint-disable-next-line max-len

import express from 'express';
import {
  createInventoryVendor,
  editInventoryVendor,
  vendorDetails,
  editVendorStatus,
  getVendorListing,
  getVendorDetailsPdf,
  getVendorListingForDropDown
} from '../controllers/inventoryVendorMaster.controller.js';
import {
  inventoryVendorCreateSchema,
  inventoryVendorEditSchema
} from '../validators/inventory.validator.js';

import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', [validateToken,isAdmin,inventoryVendorCreateSchema], createInventoryVendor);
router.post('/edit', [validateToken,isAdmin,inventoryVendorEditSchema], editInventoryVendor);
router.get('/details/:vendorId',[validateToken,isAdmin], vendorDetails);
router.get('/edit_status/:vendorId',[validateToken,isAdmin], editVendorStatus);
router.get('/vendor_listing',[validateToken], getVendorListing);
router.get('/vendor_details_pdf/:vendorId',[validateToken], getVendorDetailsPdf);
router.get('/vendor_listing_for_dropdown',[validateToken], getVendorListingForDropDown);

export default router;
