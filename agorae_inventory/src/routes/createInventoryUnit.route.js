/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
// eslint-disable-next-line max-len

import express from 'express';
import {
  createInventoryUnit,
  editInventoryUnit,
  deleteInventoryUnit,
  getUnitList
} from '../controllers/inventoryUnitMaster.controller.js';
import {
  inventoryUnitCreateSchema,
  inventoryUnitUpdateSchema
} from '../validators/inventory.validator.js';
import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create',[validateToken, isAdmin,inventoryUnitCreateSchema], createInventoryUnit);
router.post('/update', [validateToken, isAdmin,inventoryUnitUpdateSchema], editInventoryUnit);
router.get('/deleteUnit/:id',[validateToken, isAdmin], deleteInventoryUnit);
router.get('/getUnitList',[validateToken], getUnitList);

export default router;
