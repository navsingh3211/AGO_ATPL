/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
// eslint-disable-next-line max-len

import express from 'express';
import {
  createInventorySubCat,
  editInventorySubCat,
  deleteInventorySubCat,
  getSubCatList
} from '../controllers/inventorySubCategoryMaster.controller.js';
import {
  inventoryCreateSubCatSchema,
  inventoryUpdateSubCatSchema
} from '../validators/inventory.validator.js';
import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create', [validateToken,isAdmin,inventoryCreateSubCatSchema], createInventorySubCat);
router.post('/update', [validateToken,isAdmin,inventoryUpdateSubCatSchema], editInventorySubCat);
router.get('/deleteSubCat/:id',[validateToken,isAdmin], deleteInventorySubCat);
router.get('/getSubCatList',[validateToken], getSubCatList);

export default router;
