import express from 'express';
import {
  cancelManualPayment,
  createManualPayment,
  getChecqueStatus,
  getManualPayment,
  getManualPaymentHistoryList,
  getPaymentMode,
  updateManualPayment
} from '../controllers/inventoryManualPayment.controller.js';
import { isAdmin } from '../middlewares/auth.middleware.js';
import { validateToken } from '../middlewares/jwt.middleware.js';

const router = express.Router();

router.get('/getPaymentMode', [validateToken, isAdmin], getPaymentMode);
router.get('/getChequeStatus', [validateToken, isAdmin], getChecqueStatus);
router.post(
  '/createManualPayment',
  [validateToken, isAdmin],
  createManualPayment
);
router.post('/getManualPayment', [validateToken, isAdmin], getManualPayment);
router.post(
  '/updateManualPayment',
  [validateToken, isAdmin],
  updateManualPayment
);
router.post(
  '/cancelManualPayment',
  [validateToken, isAdmin],
  cancelManualPayment
);
router.post(
  '/getManualPaymentHistoryList',
  [validateToken, isAdmin],
  getManualPaymentHistoryList
);

export default router;
