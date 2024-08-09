/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import express from 'express';
import { validateToken } from '../middlewares/jwt.middleware.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

import {
  createCommunityMaster,
  getCommunityList,
  assignItemToCommunity,
  getAssignedItemCommunityList,
  editAssignItemToCommunity,
  releaseAssignItemToCommunity,
  editCommunityMaster,
  deleteCommunityMaster
} from '../controllers/community.controller.js';

const router = express.Router();

router.post(
  '/create',
  [validateToken, isAdmin],
  createCommunityMaster
);

router.post(
  '/edit',
  [validateToken, isAdmin],
  editCommunityMaster
);

router.get(
  '/delete/:communityId',
  [validateToken, isAdmin],
  deleteCommunityMaster
);
router.post('/assign-item-to-community', [validateToken, isAdmin], assignItemToCommunity);
router.get('/getCommunityList', [validateToken, isAdmin], getCommunityList);
router.get('/getAssignedItemCommunityList', [validateToken, isAdmin], getAssignedItemCommunityList);
router.post('/edit-assign-item-to-community', [validateToken, isAdmin], editAssignItemToCommunity);
router.post('/release-assign-item-to-community', [validateToken, isAdmin], releaseAssignItemToCommunity);



export default router;
