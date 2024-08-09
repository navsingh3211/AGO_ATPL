/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import mongoose from 'mongoose';
import locationMaster from '../models/locationMaster.model.js';
import assignItemToLocation from '../models/assignItemToLocation.model.js';
import inventoryItemMaster from '../models/inventoryItemMaster.model.js';
import {
  createLocationVal,
  editLocationVal
} from '../validators/zod.validator.js';
import { hasSpecialCharacters } from '../utils/commonFunction.util.js';
import CONSTANTS from '../utils/constants.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';

const createLocationMasterService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;

    let body = req.body;
    const parsePayload = createLocationVal.safeParse(body);
    if (!parsePayload.success) {
      return await apiresponse(
        false,
        parsePayload.error.errors[0].message,
        201,
        null
      );
    }

    let locationCount = await locationMaster.countDocuments({
      instituteId: instituteId,
      locationName: body.locationName.trim(),
      status: true
    });
    if (locationCount) {
      return await apiresponse(
        false,
        MESSAGES.LOCATION.ALREADY_EXIST,
        201,
        null
      );
    }
    await locationMaster.create({
      instituteId,
      ...req.body
    });
    return await apiresponse(true, MESSAGES.LOCATION.CREATED, 201, null);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const getLocationListService = async (req, res) => {
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
            { locationName: { $regex: searchKeyWord, $options: 'i' } } // Search in category names
          ]
        }
      },
      {
        $project: {
          _id: 1,
          locationId: 1,
          locationName: 1,
          locationCapacity: 1,
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
      let aggregationResult = await locationMaster.aggregate(queryArray);
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
      let aggregationResult = await locationMaster.aggregate(queryArray);
      let total = aggregationResult.length;
      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;

      return await apiresponse(true, msg, 201, aggregationResult);
    }
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const editLocationMasterService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;

    let body = req.body;
    const parsePayload = editLocationVal.safeParse(body);
    if (!parsePayload.success) {
      return await apiresponse(
        false,
        parsePayload.error.errors[0].message,
        201,
        null
      );
    }

    const locationDetails = await locationMaster.countDocuments({
      _id: body.locationId,
      status: true
    });
    if (!locationDetails) {
      return await apiresponse(
        false,
        MESSAGES.LOCATION.INVALID_LOCATION_ID,
        201,
        null
      );
    }

    let locationCount = await locationMaster.countDocuments({
      _id: { $ne: body.locationId },
      instituteId: instituteId,
      locationName: body.locationName.trim(),
      status: true
    });
    if (locationCount) {
      return await apiresponse(
        false,
        MESSAGES.LOCATION.ALREADY_EXIST,
        201,
        null
      );
    }
    await locationMaster.updateOne(
      {
        _id: body.locationId
      },
      {
        $set: {
          locationName: body.locationName,
          locationCapacity: body.locationCapacity ? body.locationCapacity : null
        }
      }
    );
    return await apiresponse(true, MESSAGES.LOCATION.EDITED, 201, null);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, MESSAGES.GENERAL_ERROR, 401, error);
  }
};

const deleteLocationMasterService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const { locationId } = req.params;

    const locationCount = await locationMaster.countDocuments({
      _id: locationId,
      status: true
    });

    if (!locationCount) {
      return await apiresponse(
        false,
        MESSAGES.LOCATION.INVALID_LOCATION_ID,
        201,
        null
      );
    }

    await locationMaster.updateOne(
      {
        _id: locationId
      },
      {
        $set: {
          status: false
        }
      }
    );
    return await apiresponse(
      true,
      MESSAGES.LOCATION.DELETED_LOCATION,
      201,
      null
    );
  } catch (error) {
    console.log(error);
    return await apiresponse(false, MESSAGES.GENERAL_ERROR, 401, error);
  }
};

const assignItemToLocationService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;
    const locationId = body.locationId;
    const itemMasterId = body.itemMasterId;
    const itemToAssign = body.assignedItem;
    let sizesToAssign = itemToAssign.map((item) => {
      return item.size;
    });

    const assignedItemToLoc = await assignItemToLocation.find(
      {
        locationId: locationId,
        itemMasterId: itemMasterId
      },
      { assignedItem: 1 }
    );

    if (assignedItemToLoc) {
      let assignedItemSizes = [];
      for (let item of assignedItemToLoc) {
        item.assignedItem.map((data) => {
          assignedItemSizes.push(data.size);
        });
      }

      for (let size of sizesToAssign) {
        if (assignedItemSizes.includes(size)) {
          return await apiresponse(
            false,
            `You can't reassign ${size} size because it is already assigned to the same location master.`,
            201,
            null
          );
        }
      }
    }

    let response = await assignItemToLocation.create({
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
    return await apiresponse(true, MESSAGES.LOCATION.ITEM_ASSIGNED, 201, null);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, MESSAGES.GENERAL_ERROR, 401, error);
  }
};

const assignedItemToLocationListingService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const searchKey = req.query
      ? req.query.searchKey
        ? req.query.searchKey
        : ''
      : '';
    const doa = req.query ? (req.query.doa ? req.query.doa : '') : '';

    const locationId = req.query
      ? req.query.locationId
        ? req.query.locationId
        : ''
      : '';

    if (req.query.searchKey && hasSpecialCharacters(req.query.searchKey)) {
      return await apiresponse(false, 'No data found !', 201, '');
    }

    let conditionObj = { status: true, instituteId: instituteId };
    if (locationId) {
      conditionObj.locationId = new mongoose.Types.ObjectId(locationId);
    }
    // console.log(conditionObj);
    // process.exit(0);
    let queryArray = [
      {
        $match: conditionObj
      },
      {
        $lookup: {
          from: 'locationmasters',
          localField: 'locationId',
          foreignField: '_id',
          as: 'locationDetails'
        }
      },
      {
        $unwind: '$locationDetails'
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
              'locationDetails.locationName': {
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
          loc_Id: '$locationDetails._id',
          locationId: '$locationDetails.locationId',
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
          locationName: '$locationDetails.locationName',
          locationCapacity: '$locationDetails.locationCapacity',
          description: 1,
          assignedDate: 1
        }
      },
      { $unwind: '$assignedItem' }
    ];

    if (doa) {
      queryArray.push({
        $match: {
          $expr: {
            $eq: [
              {
                $dateToString: { format: '%Y-%m-%d', date: '$assignedDate' }
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
      let aggregationResult = await assignItemToLocation.aggregate(queryArray);
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
      let aggregationResult = await assignItemToLocation.aggregate(queryArray);
      let total = aggregationResult.length;
      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;

      return await apiresponse(true, msg, 201, aggregationResult);
    }
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const editAssignItemToLocationService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;
    const itemSizesToassign = body.assignedItem[0];
    // console.log(body);
    // process.exit(0);

    let assignedItemDetails = await assignItemToLocation.findOne({
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

    const updateData = await assignItemToLocation.updateOne(
      {
        _id: new mongoose.Types.ObjectId(body.assignedItemId),
        'assignedItem.size': itemSizesToassign.size
      },
      {
        $set: {
          'assignedItem.$.quantity': itemSizesToassign.quantity,
          'assignedItem.$.sellingPrice': itemSizesToassign.sellingPrice,
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

const deleteAssignItemToLocationService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const { assignedItemLocId } = req.params;
    // console.log(assignedItemLocId, 'assignedItemLocId');
    // process.exit(0);

    let assignedItemDetails = await assignItemToLocation.findOne({
      _id: assignedItemLocId
    });
    if (!assignedItemDetails) {
      return await apiresponse(
        false,
        MESSAGES.COMMUNITY.INVALID_ASSIGNED_ID,
        201,
        null
      );
    }
    // console.log(assignedItemDetails);
    // process.exit(0);
    let assignedItem = assignedItemDetails.assignedItem;
    let itemMasterId = assignedItemDetails.itemMasterId;

    const updateData = await assignItemToLocation.updateOne(
      { _id: new mongoose.Types.ObjectId(assignedItemLocId) },
      {
        $set: {
          status: false
        }
      }
    );

    let itemDetails = await inventoryItemMaster.findOne(
      { _id: itemMasterId },
      { itemSizes: 1 }
    );

    //release all the prevous stock first
    if (updateData && itemDetails) {
      let assignedSizes = assignedItem;

      for (let assignedItem of assignedSizes) {
        let indexOfSize = itemDetails.itemSizes.findIndex(
          (obj) => obj.size === assignedItem.size
        );

        await inventoryItemMaster.findOneAndUpdate(
          { _id: itemMasterId },
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

    return await apiresponse(
      true,
      MESSAGES.LOCATION.DELETE_ASSIGNED_LOC,
      201,
      null
    );
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

export default {
  createLocationMasterService,
  getLocationListService,
  editLocationMasterService,
  deleteLocationMasterService,
  assignItemToLocationService,
  assignedItemToLocationListingService,
  editAssignItemToLocationService,
  deleteAssignItemToLocationService
};
