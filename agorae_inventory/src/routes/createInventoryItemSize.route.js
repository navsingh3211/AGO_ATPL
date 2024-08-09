/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
// eslint-disable-next-line max-len

import express from 'express';
import {
  createInventoryItemSize,
  editInventoryItemSize,
  deleteInventoryItemSize,
  getItemSizetList,
  getSizetList
} from '../controllers/inventoryItemSizeMaster.controller.js';
import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/create',[validateToken,isAdmin], createInventoryItemSize);
router.post('/update',[validateToken,isAdmin], editInventoryItemSize);
router.get('/delete/:id',[validateToken,isAdmin], deleteInventoryItemSize);
router.get('/getItemSizetList',[validateToken], getItemSizetList);
router.get('/getSizetList',[validateToken], getSizetList);

export default router;
