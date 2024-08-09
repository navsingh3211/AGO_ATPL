/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import express from 'express';
import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

import {
  createInventoryCategory,
  editInventoryCategory,
  deleteInventoryCategory,
  getCategoryList
} from '../controllers/InventoryCategoryMaster.controller.js';
import {
  inventoryCategoryCreateSchemavalidator,
  inventoryCategoryUpdateSchema
} from '../validators/inventory.validator.js';

const router = express.Router();

router.post(
  '/create',
  [validateToken, isAdmin, inventoryCategoryCreateSchemavalidator],
  createInventoryCategory
);
router.post('/update', [validateToken, isAdmin,inventoryCategoryUpdateSchema], editInventoryCategory);
router.get('/deleteCategory/:id',[validateToken, isAdmin], deleteInventoryCategory);
router.get('/getCategoryList', [validateToken, isAdmin], getCategoryList);

export default router;
