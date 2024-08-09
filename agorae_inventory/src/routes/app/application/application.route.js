import express from 'express';

import { createAnOrder,createRequestForExchange } from '../../../controllers/app/student/studentOrder.controller.js';

import { validateToken } from '../../../middlewares/jwt.middleware.js';

import { getStudentDetails } from '../../../middlewares/student.middleware.js';

import {isApplication} from '../../../middlewares/auth.middleware.js'
import { addOrRemoveWishlist, addToCart, cancelOrder, createExchange, createOrder, deleteOrderOnOrderCancel, filterOrder, filterSubCategory, filteredListItems, getAdminOrders, getCartList, getCategories, getItemDetails, getKitsAssigned, getMyOrders, getOrderDetails, getReasonForExchange, getSearchedItems, getSearchedList, getSubCategories, getWishlist, notifyItemStock, removeFromCart, searchSuggestions, updateCart, updatePaymentStatusOrder } from '../../../controllers/app/application/application.controller.js';
import { addOrRemoveWishlistValidation, addToCartValidation } from '../../../validators/inventory.validator.js';
import { receiptPdfOfItemForStaff, receiptPdfOfItemForStudent } from '../../../controllers/inventoryItemOrders.controller.js';
import { getInstituteDetails } from '../../../utils/helperFunction.util.js';

const router = express.Router();

router.get('/testMiddleware', [validateToken, isApplication], (req,res) => {
    res.status(200).json({
        success: "Success",
        code: 200,
        data: {},
        message: "MIDDLEWARE TEST SUCCESSFUL"
      });
});
router.get('/getCategories', [validateToken, isApplication],getCategories);
router.post('/getSubCategories', [validateToken, isApplication],getSubCategories);
router.get('/getSearchedList', [validateToken, isApplication],getSearchedList);
router.post('/searchSuggestions', [validateToken, isApplication],searchSuggestions);
router.post('/getSearchedItems', [validateToken, isApplication],getSearchedItems);
router.post('/getItemDetails', [validateToken, isApplication],getItemDetails);
router.post('/notifyItemStock', [validateToken, isApplication],notifyItemStock);
router.post('/addOrRemoveWishlist', [validateToken, isApplication,addOrRemoveWishlistValidation],addOrRemoveWishlist);
router.get('/getWishlist', [validateToken, isApplication],getWishlist);
router.post('/createOrder', [validateToken, isApplication],createOrder);
router.post('/getMyOrders', [validateToken, isApplication],getMyOrders);
router.post('/getOrderDetails', [validateToken, isApplication],getOrderDetails);
router.post('/getAdminOrders', [validateToken, isApplication],getAdminOrders);
router.post('/getKitsAssigned', [validateToken, isApplication],getKitsAssigned);
router.post('/addToCart', [validateToken, isApplication , addToCartValidation],addToCart);
router.post('/removeFromCart', [validateToken, isApplication],removeFromCart);
router.get('/getCartList', [validateToken, isApplication],getCartList);
router.post('/updateCart', [validateToken, isApplication],updateCart);
router.post('/updatePaymentStatusOrder', [validateToken, isApplication],updatePaymentStatusOrder);
router.post('/cancelOrder', [validateToken, isApplication],cancelOrder);
router.get('/getReasonForExchange', [validateToken, isApplication],getReasonForExchange);
router.post('/createExchange', [validateToken, isApplication],createExchange);
router.post('/filterSubCategory', [validateToken, isApplication],filterSubCategory);
router.post('/filteredListItems', [validateToken, isApplication],filteredListItems);
router.post('/filterOrder', [validateToken, isApplication],filterOrder);
router.post('/deleteOrderOnOrderCancel', [validateToken, isApplication],deleteOrderOnOrderCancel);
// router.get('/receiptPdfOfItemForStudent/:orderId/:itemFrom', [validateToken,getInstituteDetails, isApplication],receiptPdfOfItemForStudent);
// router.get('/receiptPdfOfItemForStaff/:orderId', [validateToken,getInstituteDetails, isApplication],receiptPdfOfItemForStaff);
// router.post(
//   '/requestExchange',
//   [validateToken],
//   createRequestForExchange
// );

export default router;