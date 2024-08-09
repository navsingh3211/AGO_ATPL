/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// eslint-disable-next-line max-len

import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import fs from 'fs';

import {
  createInventoryItemItemMaster,
  editInventoryItemItemMaster,
  deleteInventoryItemItemMaster,
  getItemDetails,
  getItemListing,
  updateHighestSellingPriceForOldData
} from '../controllers/InventoryItemMaster.controller.js';

import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';
import { addItemInItemMasterValidation } from '../validators/inventory.validator.js';
// import { awsS3Handler } from '../utils/awsS3Handler.util';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirnamee = dirname(__filename);
const directoryPath = join(__dirnamee, './../public/itemRequirement/');

// console.log('this is my dir', directoryPath1);

//if folder for storing is not exit,create it
if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

//multer configuration for files
const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, directoryPath);
  },
  filename: function (request, file, callback) {
    callback(null, file.originalname);
  }
});

var upload = multer({ storage: storage });

router.post('/create', [validateToken, isAdmin,addItemInItemMasterValidation], createInventoryItemItemMaster);
router.post('/edit', [validateToken, isAdmin,addItemInItemMasterValidation], editInventoryItemItemMaster);
router.get('/temporaryUpdate', updateHighestSellingPriceForOldData);

router.get(
  '/delete/:itemId',
  [validateToken, isAdmin],
  deleteInventoryItemItemMaster
);
router.get('/get-item-details/:itemId', [validateToken], getItemDetails);
router.get('/get-item-listing-in-item-master', [validateToken], getItemListing);

export default router;
