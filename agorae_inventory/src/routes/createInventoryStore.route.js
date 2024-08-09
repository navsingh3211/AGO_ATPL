/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import express from 'express';

import {
  createInventoryStore,
  editInventoryStore,
  deleteInventoryStore,
  getInventoryStoreListing
} from '../controllers/inventoryStoreMaster.controller.js';
import {
  inventoryCreateStoreSchema
} from '../validators/inventory.validator.js';

import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', [validateToken,isAdmin,inventoryCreateStoreSchema], createInventoryStore);
router.post('/edit',[validateToken,isAdmin], editInventoryStore);
router.get('/delete/:storeId',[validateToken,isAdmin], deleteInventoryStore);
router.get('/store_listing',[validateToken], getInventoryStoreListing);

export default router;
