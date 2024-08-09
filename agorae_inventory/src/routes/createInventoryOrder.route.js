/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// eslint-disable-next-line max-len
import express from 'express';
import {
  getStudentOrdersListing,
  conformPickupForStudentAfterPayment,
  rejectStudentOrder,
  getItemOrderDetails,
  markAnItemAsDamageItemForStudent,
  assignItemToStudentManually,
  receiptPdfOfItemForStudent,
  getStatusListingOfStudentForFilteration,
  getStaffOrdersListing,
  conformPickupForStaffAfterPayment,
  rejectStaffOrder,
  getItemOrderDetailsForStaff,
  markAnItemAsDamageItemForStaff,
  assignItemToStaffManually,
  receiptPdfOfItemForStaff,
  getStatusListingOfStaffForFilteration,
  getStudentOrdersListingForDropDown,
  getStaffOrdersListingForDropDown
} from '../controllers/inventoryItemOrders.controller.js';

import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin, isApplication } from '../middlewares/auth.middleware.js';
import { orderedItemDamageMarkingValidation } from '../validators/inventory.validator.js';
import { getInstituteDetails } from '../utils/helperFunction.util.js';

const router = express.Router();

/*
 *student order section
 */
router.get(
  '/get-student-orders-listing',
  [validateToken, isAdmin],
  getStudentOrdersListing
);

router.get(
  '/get-student-orders-listing-for-dropdown',
  [validateToken, isAdmin],
  getStudentOrdersListingForDropDown
);

router.post(
  '/conform-pickup-for-student-after-payment',
  [validateToken, isAdmin],
  conformPickupForStudentAfterPayment
);

router.post(
  '/reject-student-order',
  [validateToken, isAdmin],
  rejectStudentOrder
);

router.get('/get-item-details', [validateToken], getItemOrderDetails);

router.post(
  '/mark-an-item-as-damage-item-for-student',
  [validateToken, isAdmin],
  markAnItemAsDamageItemForStudent
);

router.post(
  '/assign-item-to-student-manually',
  [validateToken, isAdmin],
  assignItemToStudentManually
);

router.get(
  '/receipt-pdf-of-item-order-for-student/:orderId/:itemFrom',
  [validateToken, getInstituteDetails, isAdmin],
  receiptPdfOfItemForStudent
);

router.get(
  '/receipt-pdf-of-item-order-for-studentApp/:orderId/:itemFrom',
  [validateToken, getInstituteDetails, isApplication],
  receiptPdfOfItemForStudent
);

router.get(
  '/get-status-listing-of-student-for-filteration',
  [validateToken, isAdmin],
  getStatusListingOfStudentForFilteration
);

/*
 *staff order section
 */
router.get(
  '/get-staff-orders-listing',
  [validateToken, isAdmin],
  getStaffOrdersListing
);

router.get(
  '/get-staff-orders-listing-for-dropdown',
  [validateToken, isAdmin],
  getStaffOrdersListingForDropDown
);

router.post(
  '/conform-pickup-for-staff-after-payment',
  [validateToken, isAdmin],
  conformPickupForStaffAfterPayment
);

router.post('/reject-staff-order', [validateToken, isAdmin], rejectStaffOrder);

router.get(
  '/get-item-order-details-for-staff/:orderId',
  [validateToken],
  getItemOrderDetailsForStaff
);

router.post(
  '/mark-an-item-as-damage-item-for-staff',
  [validateToken, isAdmin],
  markAnItemAsDamageItemForStaff
);

router.post(
  '/assign-item-to-staff-manually',
  [validateToken, isAdmin],
  assignItemToStaffManually
);

router.get(
  '/receipt-pdf-of-item-order-for-staff/:orderId',
  [validateToken, getInstituteDetails, isAdmin],
  receiptPdfOfItemForStaff
);

router.get(
  '/receipt-pdf-of-item-order-for-staffApp/:orderId',
  [validateToken, getInstituteDetails, isApplication],
  receiptPdfOfItemForStaff
);

router.get(
  '/get-status-listing-of-staff-for-filteration',
  [validateToken, isAdmin],
  getStatusListingOfStaffForFilteration
);

export default router;
