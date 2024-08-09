/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// eslint-disable-next-line max-len

import express from 'express';

import {
  createInventoryReceiptSetting,
  getWhoHasLastEditedReceipt,
  editInventoryReceiptSetting,
  getReceiptDetails,
  checkInstitutionCodeExit
} from '../controllers/InventoryReceiptSetting.controller.js';

import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';
import { inventoryReceiptSettingValidation,inventoryEditReceiptSettingValidation } from '../validators/inventory.validator.js';

const router = express.Router();

router.post('/create', [validateToken, isAdmin,inventoryReceiptSettingValidation], createInventoryReceiptSetting);
router.get('/get-who-has-last-edited-receipt',[validateToken],getWhoHasLastEditedReceipt);
router.post('/edit', [validateToken, isAdmin,inventoryEditReceiptSettingValidation], editInventoryReceiptSetting);
router.get('/get-receipt-details',[validateToken],getReceiptDetails);
router.get('/check-institution-code-exit/:institutionCode',[validateToken],checkInstitutionCodeExit)


export default router;
