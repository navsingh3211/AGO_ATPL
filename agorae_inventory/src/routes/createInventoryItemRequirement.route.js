/* eslint-disable max-len */
import express from 'express';
import multer from 'multer';
// import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { join } from 'path';
import fs from 'fs';

// eslint-disable-next-line max-len
import {
  createInventoryItemRequirement,
  editInventoryItemRequirement,
  deleteInventoryItemRequirement,
  getItemRequirementDetails,
  getItemRequirementList,
  getApprovalToItemRequirement,
  uploadImage,
  transferDataFromItemMReqToItemMaster,
  createInventoryItemRequirementTemplateForSheetInBulkUpload,
  downloadItemRequirementTemplateForBulkUpload,
  validationOfitemRequirementAddedByExcel,
  uploadExcelSheetForBulkUploadOfItemRequirement,
  getItemRequirementListingForBulkEmptyUpload,
  giveApprovalToItemrequirementRequest
} from '../controllers/inventoryItemRequirement.controller.js';

// import {
//   inventoryCreateItemRequirementSchema,
//   inventoryEditItemRequirementSchema
// } from '../validators/inventory.validator.js';

import { checkSeekerHaveApprovalRight } from '../middlewares/auth.middleware.js';
import { awsS3Handler } from '../utils/awsS3Handler.util.js';

import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirnamee = dirname(__filename);
const directoryPath = join(__dirnamee, './../public/itemRequirement/');

// console.log('this is my dir', directoryPath);

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

router.post('/create', createInventoryItemRequirement);
router.post('/edit', editInventoryItemRequirement);
router.get('/delete/:itemReqId', deleteInventoryItemRequirement);
router.get('/getItemRequirementDetails/:itemReqId', getItemRequirementDetails);
router.get('/getItemRequirementList', [validateToken], getItemRequirementList);
router.post(
  '/give-approval-to-item-requirement',
  checkSeekerHaveApprovalRight,
  getApprovalToItemRequirement
);
router.post(
  '/upload-image',
  [
    awsS3Handler().fields([
      {
        name: 'file',
        maxCount: 5
      }
    ])
  ],
  (req, res, next) => {
    // Access the fileFilter function from the awsS3Handler middleware
    awsS3Handler().fileFilter(req, res, function (err) {
      if (err) {
        // Handle the error
        return res.status(201).json({
          success: false,
          message: err.message,
          code: 201,
          data: null
        });
      }
      // Continue with the next middleware or route handler
      next();
    });
  },
  uploadImage
);

router.post(
  '/transfer-data-from-itemRequirement-to-itemMaster',
  [validateToken, isAdmin],
  transferDataFromItemMReqToItemMaster
);

// upload item-requirement in bulk start -->
router.post(
  '/create-itemRequirement-template-for-sheet-in-bulkUpload',
  createInventoryItemRequirementTemplateForSheetInBulkUpload
);

router.get(
  '/download-item-requirement-template-for-bulkUpload/:itemReqId',
  downloadItemRequirementTemplateForBulkUpload
);

router.post(
  '/validation-while-item-requirement-added-by-excel',
  upload.fields([
    {
      name: 'itemRequirementExcel',
      maxCount: 1
    }
  ]),
  validationOfitemRequirementAddedByExcel
);

router.post(
  '/upload-excel-sheet-for-bulkUpload-of-itemRequirement',
  upload.fields([
    {
      name: 'itemRequirementExcel',
      maxCount: 1
    }
  ]),
  uploadExcelSheetForBulkUploadOfItemRequirement
);

router.get(
  '/get-item-requirement-listing-for-bulk-empty-upload',
  getItemRequirementListingForBulkEmptyUpload
);
// upload item-requirement in bulk end <--

router.post(
  '/give-approval-to-itemrequirement-request',
  giveApprovalToItemrequirementRequest
);

export default router;
