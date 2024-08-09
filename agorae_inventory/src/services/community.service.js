/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import mongoose from 'mongoose';
import communityMaster from '../models/communityMaster.model.js';
import assignItemToCommunity from '../models/assignItemToCommunity.model.js';
import inventoryItemMaster from '../models/inventoryItemMaster.model.js';
import { hasSpecialCharacters } from '../utils/commonFunction.util.js';
import CONSTANTS from '../utils/constants.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';

const createCommunityMasterService = async (req, res) => {
  const instituteId = req.authData.data.instituteId;
  let body = req.body;
  let communitylisting = await communityMaster.countDocuments({
    instituteId: instituteId,
    communityName: body.communityName.trim(),
    status: true
  });
  if (communitylisting) {
    return await apiresponse(
      false,
      MESSAGES.COMMUNITY.ALREADY_EXISTS,
      201,
      null
    );
  }

  try {
    let response = await communityMaster.create({
      instituteId,
      ...req.body
    });
    return await apiresponse(true, MESSAGES.COMMUNITY.CREATE, 201, null);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const editCommunityMasterService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;

    let body = req.body;

    const communityDetails = await communityMaster.countDocuments({
      _id: body.communityId,
      status: true
    });
    if (!communityDetails) {
      return await apiresponse(
        false,
        MESSAGES.COMMUNITY.INVALID_COMMUNITY_ID,
        201,
        null
      );
    }

    let communityCount = await communityMaster.countDocuments({
      _id: { $ne: body.communityId },
      instituteId: instituteId,
      communityName: body.communityName.trim(),
      status: true
    });
    if (communityCount) {
      return await apiresponse(
        false,
        MESSAGES.COMMUNITY.ALREADY_EXISTS,
        201,
        null
      );
    }
    await communityMaster.updateOne(
      {
        _id: body.communityId
      },
      {
        $set: {
          communityName: body.communityName
        }
      }
    );
    return await apiresponse(
      true,
      MESSAGES.COMMUNITY.COMMUNITY_EDITED,
      201,
      null
    );
  } catch (error) {
    console.log(error);
    return await apiresponse(false, MESSAGES.GENERAL_ERROR, 401, error);
  }
};

const deleteCommunityMasterService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const { communityId } = req.params;

    const communityCount = await communityMaster.countDocuments({
      _id: communityId,
      status: true
    });

    if (!communityCount) {
      return await apiresponse(
        false,
        MESSAGES.COMMUNITY.INVALID_COMMUNITY_ID,
        201,
        null
      );
    }

    await communityMaster.updateOne(
      {
        _id: communityId
      },
      {
        $set: {
          status: false
        }
      }
    );
    return await apiresponse(
      true,
      MESSAGES.COMMUNITY.COMMUNITY_DELETE,
      201,
      null
    );
  } catch (error) {
    console.log(error);
    return await apiresponse(false, MESSAGES.GENERAL_ERROR, 401, error);
  }
};

const getCommunityListService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const searchKeyWord = req.query
      ? req.query.searchKey
        ? req.query.searchKey
        : ''
      : '';

    if (req.query.searchKey && hasSpecialCharacters(req.query.searchKey)) {
      return await apiresponse(false, 'No data found !', 201, '');
    }
    let queryArray = [
      {
        $match: {
          status: true,
          instituteId: instituteId
        }
      },
      {
        $match: {
          $or: [
            { communityName: { $regex: searchKeyWord, $options: 'i' } } // Search in category names
          ]
        }
      },
      {
        $project: {
          _id: 1,
          communityName: 1,
          isAlreadyUsed: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ];
    if (req.query.pageSize && req.query.pageNo) {
      queryArray.push({
        $facet: {
          total: [{ $group: { _id: null, count: { $sum: 1 } } }],
          data: [
            {
              $skip: (Number(req.query.pageNo) - 1) * Number(req.query.pageSize)
            },
            {
              $limit: Number(req.query.pageSize)
            }
          ]
        }
      });
      let aggregationResult = await communityMaster.aggregate(queryArray);
      let total = aggregationResult[0].total[0]
        ? aggregationResult[0].total[0].count
        : 0;
      let dataListing = aggregationResult[0].data;

      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
      let result = {
        rows: dataListing,
        total: total
      };
      return await apiresponse(true, msg, 201, result);
    } else {
      let aggregationResult = await communityMaster.aggregate(queryArray);
      let total = aggregationResult.length;
      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;

      return await apiresponse(true, msg, 201, aggregationResult);
    }
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const assignItemToCommunityService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;

    const communityId = body.communityId;
    const itemMasterId = body.itemMasterId;
    const itemToAssign = body.assignedItem;
    let sizesToAssign = itemToAssign.map((item) => {
      return item.size;
    });

    const assignedItemToComm = await assignItemToCommunity.find(
      {
        communityId: communityId,
        itemMasterId: itemMasterId
      },
      { assignedItem: 1 }
    );

    if (assignedItemToComm) {
      let assignedItemSizes = [];
      for (let item of assignedItemToComm) {
        item.assignedItem.map((data) => {
          if (data.useStatus === 'IN_USE') {
            assignedItemSizes.push(data.size);
          }
        });
      }
      for (let size of sizesToAssign) {
        if (assignedItemSizes.includes(size)) {
          return await apiresponse(
            false,
            `You can't reassign ${size} size because it is already assigned to the same community.`,
            201,
            null
          );
        }
      }
    }

    let response = await assignItemToCommunity.create({
      instituteId,
      ...body
    });
    if (response) {
      let itemDetails = await inventoryItemMaster.findOne(
        {
          _id: body.itemMasterId
        },
        {
          itemSizes: 1
        }
      );

      if (itemDetails) {
        let assignedSizes = body.assignedItem;
        for (let assignedItem of assignedSizes) {
          let indexOfSize = itemDetails.itemSizes.findIndex(
            (obj) => obj.size === assignedItem.size
          );

          let updateItemCount = await inventoryItemMaster.findOneAndUpdate(
            { _id: body.itemMasterId },
            {
              $inc: {
                [`itemSizes.${indexOfSize}.itemQuantity.quantity`]:
                  -assignedItem.quantity,
                'quantityInHand.quantityInHand': -assignedItem.quantity,
                [`itemSizes.${indexOfSize}.totalSellingPrice`]:
                  -assignedItem.quantity * assignedItem.sellingPrice
              }
            },
            { new: true }
          );
        }
      }
    }
    return await apiresponse(true, MESSAGES.COMMUNITY.ITEM_ASSIGNED, 201, null);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const getAssignedItemCommunityListService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const searchKey = req.query
      ? req.query.searchKey
        ? req.query.searchKey
        : ''
      : '';
    const doa = req.query ? (req.query.doa ? req.query.doa : '') : '';

    const communityId = req.query
      ? req.query.communityId
        ? req.query.communityId
        : ''
      : '';
    const assignStatus = req.query
      ? req.query.status
        ? req.query.status
        : ''
      : '';

    if (req.query.searchKey && hasSpecialCharacters(req.query.searchKey)) {
      return await apiresponse(false, 'No data found !', 201, '');
    }

    let conditionObj = { status: true, instituteId: instituteId };
    if (communityId) {
      conditionObj.communityId = new mongoose.Types.ObjectId(communityId);
    }
    // console.log(conditionObj);
    // process.exit(0);
    let queryArray = [
      {
        $match: conditionObj
      },
      {
        $lookup: {
          from: 'communitymasters',
          localField: 'communityId',
          foreignField: '_id',
          as: 'communityDetails'
        }
      },
      {
        $unwind: '$communityDetails'
      },
      {
        $lookup: {
          from: 'inventoryitemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $unwind: '$itemDetails'
      },
      {
        $match: {
          $or: [
            { 'itemDetails.itemName': { $regex: searchKey, $options: 'i' } }, // Search in itemName
            {
              'communityDetails.communityName': {
                $regex: searchKey,
                $options: 'i'
              }
            }
          ]
        }
      },
      {
        $project: {
          _id: 1,
          assignedItem: 1,
          itemId: '$itemDetails._id',
          communityId: '$communityDetails._id',
          itemName: '$itemDetails.itemName',
          itemSizesAvaliable: {
            $map: {
              input: '$itemDetails.itemSizes',
              as: 'itemSize',
              in: {
                size: '$$itemSize.size',
                quantity: '$$itemSize.itemQuantity.quantity'
              }
            }
          },
          communityName: '$communityDetails.communityName',
          description: 1,
          expectedReleaseDate: 1,
          createdAt: 1,
          assignedDate: 1,
          releasedDate: 1
        }
      },
      { $unwind: '$assignedItem' }
    ];
    if (assignStatus === 'IN_USE' || assignStatus === 'RELEASED_ON') {
      queryArray.push({
        $match: {
          'assignedItem.useStatus': assignStatus
        }
      });
    }
    if (assignStatus === 'PENDING_RELEASE') {
      queryArray.push({
        $match: {
          $expr: {
            $gt: [
              new Date(), // Current date
              '$expectedReleaseDate'
            ]
          }
        }
      });
    }

    if (doa) {
      queryArray.push({
        $match: {
          $expr: {
            $eq: [
              {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
              },
              {
                $dateToString: { format: '%Y-%m-%d', date: new Date(doa) }
              }
            ]
          }
        }
      });
    }
    // console.log(queryArray);
    // process.exit(0);
    if (req.query.pageSize && req.query.pageNo) {
      queryArray.push({
        $facet: {
          total: [{ $group: { _id: null, count: { $sum: 1 } } }],
          data: [
            {
              $skip: (Number(req.query.pageNo) - 1) * Number(req.query.pageSize)
            },
            {
              $limit: Number(req.query.pageSize)
            }
          ]
        }
      });
      let aggregationResult = await assignItemToCommunity.aggregate(queryArray);
      let total = aggregationResult[0].total[0]
        ? aggregationResult[0].total[0].count
        : 0;
      let dataListing = aggregationResult[0].data;

      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
      let result = {
        rows: dataListing,
        total: total
      };
      return await apiresponse(true, msg, 201, result);
    } else {
      let aggregationResult = await assignItemToCommunity.aggregate(queryArray);
      let total = aggregationResult.length;
      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;

      return await apiresponse(true, msg, 201, aggregationResult);
    }
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const editAssignItemToCommunityService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;
    const itemSizesToassign = body.assignedItem[0];

    let assignedItemDetails = await assignItemToCommunity.findOne({
      _id: body.assignedItemId
    });
    if (!assignedItemDetails) {
      return await apiresponse(
        false,
        MESSAGES.COMMUNITY.INVALID_ASSIGNED_ID,
        201,
        null
      );
    }
    let assignedItem = assignedItemDetails.assignedItem;
    let itemMasterId = body.itemMasterId;

    let itemDetails = await inventoryItemMaster.findOne(
      { _id: itemMasterId },
      { itemSizes: 1 }
    );

    //release all the prevous stock first
    if (itemDetails) {
      let assignedSizes = assignedItem;

      for (let assignedItem of assignedSizes) {
        let indexOfSize = itemDetails.itemSizes.findIndex(
          (obj) => obj.size === assignedItem.size
        );

        await inventoryItemMaster.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(body.itemMasterId) },
          {
            $inc: {
              [`itemSizes.${indexOfSize}.itemQuantity.quantity`]:
                assignedItem.quantity,
              'quantityInHand.quantityInHand': assignedItem.quantity,
              [`itemSizes.${indexOfSize}.totalSellingPrice`]:
                assignedItem.quantity * assignedItem.sellingPrice
            }
          },
          { new: true }
        );
      }
    } else {
      return await apiresponse(
        false,
        MESSAGES.COMMUNITY.INVALID_ITEM_ID,
        201,
        null
      );
    }

    const updateData = await assignItemToCommunity.updateOne(
      {
        _id: new mongoose.Types.ObjectId(body.assignedItemId),
        'assignedItem.size': itemSizesToassign.size
      },
      {
        $set: {
          'assignedItem.$.quantity': itemSizesToassign.quantity,
          'assignedItem.$.sellingPrice': itemSizesToassign.sellingPrice,
          expectedReleaseDate: body.expectedReleaseDate
            ? body.expectedReleaseDate
            : '',
          description: body.description ? body.description : ''
        }
      },
      {
        arrayFilters: [{ 'assignedItem.size': itemSizesToassign.size }], // Specify the filter to target the correct element in the array
        new: true // If using findOneAndUpdate, set this to true to return the modified document
      }
    );

    // reduce the item stock or update the stock
    if (updateData && itemDetails) {
      let assignedSizes = body.assignedItem;
      for (let assignedItem of assignedSizes) {
        let indexOfSize = itemDetails.itemSizes.findIndex(
          (obj) => obj.size === assignedItem.size
        );
        let updateItemCount = await inventoryItemMaster.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(body.itemMasterId) },
          {
            $inc: {
              [`itemSizes.${indexOfSize}.itemQuantity.quantity`]:
                -assignedItem.quantity,
              'quantityInHand.quantityInHand': -assignedItem.quantity,
              [`itemSizes.${indexOfSize}.totalSellingPrice`]:
                -assignedItem.quantity * assignedItem.sellingPrice
            }
          },
          { new: true }
        );
      }
    }

    return await apiresponse(
      true,
      MESSAGES.COMMUNITY.EDIT_ASSIGN_ITEM,
      201,
      null
    );
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const releaseAssignItemToCommunityService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;

    let assignedItemDetails = await assignItemToCommunity.findOne(
      {
        _id: body.assignedItemId
      },
      { _id: 1 }
    );
    if (!assignedItemDetails) {
      return await apiresponse(
        false,
        MESSAGES.COMMUNITY.INVALID_ASSIGNED_ID,
        201,
        null
      );
    }
    let assignedItemSize = body.size;
    let quantityToRelease = body.quantityToRelease;
    let remainingqunatity = body.remainingqunatity;
    let itemMasterId = body.itemMasterId;

    let itemDetails = await inventoryItemMaster.findOne(
      { _id: itemMasterId },
      { itemSizes: 1 }
    );

    /*Query to assign item to community*/
    let updateData;
    if (remainingqunatity === 0) {
      updateData = await assignItemToCommunity.updateOne(
        {
          _id: new mongoose.Types.ObjectId(body.assignedItemId),
          'assignedItem.size': assignedItemSize
        },
        {
          $set: {
            'assignedItem.$.quantity': remainingqunatity,
            'assignedItem.$.useStatus': 'RELEASED_ON',
            releasedDate: new Date()
          }
        }
      );
    } else {
      updateData = await assignItemToCommunity.updateOne(
        {
          _id: new mongoose.Types.ObjectId(body.assignedItemId),
          'assignedItem.size': assignedItemSize
        },
        {
          $set: {
            'assignedItem.$.quantity': remainingqunatity
          }
        }
      );
    }

    /* release all the prevous stock first */
    if (itemDetails && updateData) {
      let indexOfSize = itemDetails.itemSizes.findIndex(
        (obj) => obj.size === assignedItemSize
      );
      const itemSellingPrice = itemDetails.itemSizes[indexOfSize].sellingPrice;
      await inventoryItemMaster.findOneAndUpdate(
        { _id: body.itemMasterId },
        {
          $inc: {
            [`itemSizes.${indexOfSize}.itemQuantity.quantity`]:
              quantityToRelease,
            'quantityInHand.quantityInHand': quantityToRelease,
            [`itemSizes.${indexOfSize}.totalSellingPrice`]:
              quantityToRelease * itemSellingPrice
          }
        },
        { new: true }
      );
    } else {
      return await apiresponse(
        false,
        MESSAGES.COMMUNITY.INVALID_ITEM_ID,
        201,
        null
      );
    }

    return await apiresponse(
      true,
      MESSAGES.COMMUNITY.RELEASE_SUCCESS,
      201,
      null
    );
  } catch (error) {
    console.log(error);
    return await apiresponse(false, MESSAGES.GENERAL_ERROR, 401, error);
  }
};

export default {
  createCommunityMasterService,
  getCommunityListService,
  assignItemToCommunityService,
  getAssignedItemCommunityListService,
  editAssignItemToCommunityService,
  releaseAssignItemToCommunityService,
  editCommunityMasterService,
  deleteCommunityMasterService
};
