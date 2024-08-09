/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// eslint-disable-next-line max-len

import express from 'express';

import {
  getDamageItemMasterListing,
  deleteDamageItem,
  damageItemDetails
} from '../controllers/InventoryDamageMaster.controller.js';

import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';



const router = express.Router();


router.get('/get-damage-itemMaster-listing', [validateToken], getDamageItemMasterListing);
router.get('/delete-damage-item', [validateToken,isAdmin], deleteDamageItem);
router.get('/damage-item-details/:damageId/:itemFrom', [validateToken,isAdmin], damageItemDetails);


export default router;
