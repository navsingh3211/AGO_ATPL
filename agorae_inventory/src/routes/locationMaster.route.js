/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import express from 'express';
import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

import {
  createLocationMaster,
  getLocationList,
  editLocationMaster,
  deleteLocationMaster,
  assignItemToLocation,
  assignedItemToLocationListing,
  editAssignItemToLocation,
  deleteAssignItemToLocation
} from '../controllers/locationMaster.controller.js';

const router = express.Router();

router.post(
  '/create-location-master',
  [validateToken, isAdmin],
  createLocationMaster
);
router.post('/edit-location-master', [validateToken, isAdmin], editLocationMaster);
router.get('/get-location-list', [validateToken, isAdmin], getLocationList);
router.get('/delete-location-master/:locationId', [validateToken, isAdmin], deleteLocationMaster);
router.post('/assign-item-to-location-master', [validateToken, isAdmin], assignItemToLocation);
router.get('/assigned-item-to-location-master-listing', [validateToken, isAdmin], assignedItemToLocationListing);
router.post('/edit-assign-item-to-location', [validateToken, isAdmin], editAssignItemToLocation);
router.get('/delete-assign-item-to-location/:assignedItemLocId', [validateToken, isAdmin], deleteAssignItemToLocation);



export default router;
