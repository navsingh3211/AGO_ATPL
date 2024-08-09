/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import express from 'express';
const router = express.Router();
import { getTaxListing } from '../utils/helperFunction.util.js';
import categoryRoute from './createInventoryCategory.route.js';
import unitRoute from './createInventoryUnit.route.js';
import vendorRoute from './createInventoryVendor.route.js';
import storeRoute from './createInventoryStore.route.js';
import subCategoryRoute from './createInventorySubCategory.route.js';
import itemSizeRoute from './createInventoryItemSize.route.js';
import itemRequirementRoute from './createInventoryItemRequirement.route.js';
import itemMasterRoute from './createInventoryItemMaster.route.js';
import itemKitMasterRoute from './createInventoryItemKitMaster.route.js';
import orderMasterRoute from './createInventoryOrder.route.js';
import receiptSettingRoute from './createInventoryReceiptSetting.route.js';
import exchangeMasterRoute from './createInventoryExchange.route.js';
import manualPayment from './inventoryManualPayment.route.js';
import damageMasterRoute from './createInventoryDamageMaster.route.js';
import dashboardRoute from './dashboard.route.js';
import communityRoute from './community.route.js';
import locationMasterRoute from './locationMaster.route.js';
import oldStockSellOutRoute from './oldStockSellOut.route.js';
import oldStockDashboardRoute from './oldStockDashboard.route.js';
import vendorPurchaseRoute from './vendorPurchaseReq.route.js';
import vendorPurchaseDashboardRoute from './vendorPurchaseReqDashboard.route.js';

//app side routes
import studentOrder from './app/student/studentOrder.route.js';
import staffOrder from './app/staff/staffOrder.route.js';
import application from './app/application/application.route.js';

import common from './common.route.js';

/**
 * Function contains Application routes
 *
 * @returns router
 */
const routes = () => {
  router.get('/', (req, res) => {
    res.json(
      'Welcome to Inventory,Now You can buy or assign some items to other'
    );
  });
  router.get('/admin/inventory/get-tax-listing', getTaxListing);
  router.use('/admin/inventory/dashboard', dashboardRoute);
  router.use('/admin/inventory/category', categoryRoute);
  router.use('/admin/inventory/unit', unitRoute);
  router.use('/admin/inventory/vendor', vendorRoute);
  router.use('/admin/inventory/store', storeRoute);
  router.use('/admin/inventory/subcategory', subCategoryRoute);
  router.use('/admin/inventory/itemsize', itemSizeRoute);
  router.use('/admin/inventory/itemRequirement', itemRequirementRoute);
  router.use('/admin/inventory/itemMaster', itemMasterRoute);
  router.use('/admin/inventory/itemKitMaster', itemKitMasterRoute);
  router.use('/admin/inventory/orderMaster', orderMasterRoute);
  router.use('/admin/inventory/receiptSetting', receiptSettingRoute);
  router.use('/admin/inventory/exchangeMaster', exchangeMasterRoute);
  router.use('/admin/inventory/manualPayment', manualPayment);
  router.use('/admin/inventory/damageMaster', damageMasterRoute);
  router.use('/admin/inventory/communityMaster', communityRoute);
  router.use('/admin/inventory/locationMaster', locationMasterRoute);
  router.use('/admin/inventory/oldStockSellOut', oldStockSellOutRoute);
  router.use('/admin/inventory/oldStockDashboard', oldStockDashboardRoute);
  router.use('/admin/inventory/vendorPurchaseReq', vendorPurchaseRoute);
  router.use('/admin/inventory/vendorPurchaseDashboard', vendorPurchaseDashboardRoute);


  //app side student routes
  router.use('/app/inventory/student', studentOrder);
  router.use('/app/inventory/staff', staffOrder);
  router.use('/app/inventory/application', application);

  router.use('/common', common);

  return router;
};

export default routes;
