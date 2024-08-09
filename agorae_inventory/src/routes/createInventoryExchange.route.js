/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

import express from 'express';
import {
  getStudentExchangeOrdersListing,
  getStudentExchangeOrdersDetails,
  getStudentExchangeOrdersDetailsPdf,
  confirmItemForExchangeRequest,
  rejectItemForExchangeRequest,
  assignItemExchangeManuallyToStudent,
  getStaffExchangeOrdersListing,
  getStaffExchangeOrdersDetails,
  confirmItemForExchangeRequestOfStaff,
  rejectItemForExchangeRequestOfStaff,
  assignItemExchangeManuallyToStaff,
  getStaffExchangeOrdersDetailsPdf
} from '../controllers/InventoryExchangeMaster.controller.js';

import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';
import { getInstituteDetails } from '../utils/helperFunction.util.js';

const router = express.Router();

/*
 *student exchange master section
 */
router.get(
  '/get-student-exchange-orders-listing',
  [validateToken],
  getStudentExchangeOrdersListing
);

router.get(
  '/get-student-exchange-orders-details',
  [validateToken],
  getStudentExchangeOrdersDetails
);

router.get(
  '/get-student-exchange-orders-details-pdf/:orderId/:itemFrom',
  [validateToken, getInstituteDetails, isAdmin],
  getStudentExchangeOrdersDetailsPdf
);

router.post(
  '/confirm-item-for-exchange-request',
  [validateToken, isAdmin],
  confirmItemForExchangeRequest
);

router.post(
  '/reject-item-for-exchange-request',
  [validateToken, isAdmin],
  rejectItemForExchangeRequest
);

router.post(
  '/assign-item-exchange-manually-to-student',
  [validateToken, isAdmin],
  assignItemExchangeManuallyToStudent
);

/*
 *staff exchange master section
 */
router.get(
  '/get-staff-exchange-orders-listing',
  [validateToken],
  getStaffExchangeOrdersListing
);

router.get(
  '/get-staff-exchange-orders-details/:orderId',
  [validateToken],
  getStaffExchangeOrdersDetails
);

router.post(
  '/confirm-item-for-exchange-request-of-staff',
  [validateToken, isAdmin],
  confirmItemForExchangeRequestOfStaff
);

router.post(
  '/reject-item-for-exchange-request-of-staff',
  [validateToken, isAdmin],
  rejectItemForExchangeRequestOfStaff
);

router.post(
  '/assign-item-exchange-manually-to-staff',
  [validateToken, isAdmin],
  assignItemExchangeManuallyToStaff
);

router.get(
  '/get-staff-exchange-orders-details-pdf/:orderId',
  [validateToken, getInstituteDetails, isAdmin],
  getStaffExchangeOrdersDetailsPdf
);

export default router;
