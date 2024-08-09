/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import express from 'express';

import { createAnOrder,createRequestForExchange,markAsDamageItem } from '../../../controllers/app/student/studentOrder.controller.js';

import { validateToken } from '../../../middlewares/jwt.middleware.js';

import { getStudentDetails } from '../../../middlewares/student.middleware.js';

const router = express.Router();

router.post('/createOrder', [validateToken, getStudentDetails], createAnOrder);
router.post(
  '/requestExchange',
  [validateToken],
  createRequestForExchange
);

router.post(
  '/mark-as-damage-item',
  [validateToken],
  markAsDamageItem
);

export default router;
