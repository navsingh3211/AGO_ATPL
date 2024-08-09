/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import express from 'express';

// eslint-disable-next-line max-len
import { createInventoryItemKitMaster, getSubCategoryByCategoriesId,getItemListingByCategoriesAndSubCats,getItemKitListing ,getItemKitDetailsById,editInventoryItemKitMaster} from '../controllers/InventoryItemKitMaster.controller.js';

import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', [validateToken, isAdmin], createInventoryItemKitMaster);
router.post('/get-subCategory-by-categoriesId', [validateToken], getSubCategoryByCategoriesId);
router.post('/get-item-listing-by-cats-and-subcats', [validateToken], getItemListingByCategoriesAndSubCats);
router.get('/get-item-kit-listing', [validateToken], getItemKitListing);
router.get('/get-item-kit-details-by-kitId/:kitId',[validateToken,isAdmin],getItemKitDetailsById);
router.post('/edit', [validateToken, isAdmin], editInventoryItemKitMaster);

export default router;
