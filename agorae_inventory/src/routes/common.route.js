/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import express from 'express';
import { validateToken } from '../middlewares/jwt.middleware.js';
import {
  getStateListing,
  getCityListing,
  getImageByDocumentId,
  deleteFile
} from '../controllers/common.controller.js';


const router = express.Router();

router.get('/get-state-listing', getStateListing);
router.get('/get-city-listing-for-a-state',getCityListing);
router.get('/get-image-by-documentId/:documentId',getImageByDocumentId);
router.get('/delete-file/:documentId',[validateToken],deleteFile);

export default router;
