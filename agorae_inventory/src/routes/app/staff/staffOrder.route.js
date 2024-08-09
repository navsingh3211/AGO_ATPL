/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import express from 'express';

import { createAnOrder,createRequestForExchange } from '../../../controllers/app/staff/staffOrder.controller.js';

import { validateToken } from '../../../middlewares/jwt.middleware.js';

// import { getStudentDetails } from '../../../middlewares/student.middleware.js';
import { isStaff } from '../../../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/createOrder', [validateToken, isStaff], createAnOrder);
router.post('/requestExchange', [validateToken,isStaff], createRequestForExchange);

export default router;
