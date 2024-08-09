/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import inventoryStoreMaster from '../models/inventoryStoreMaster.model.js';
import paginationSearchHandler from '../utils/paginationSearchHandler.util.js';
import {hasSpecialCharacters} from '../utils/commonFunction.util.js';
import CONSTANTS from '../utils/constants.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';

const createInventoryStoreService = async (req, res) => {
  const instituteId = req.authData.data.instituteId;
  let body = req.body;
  let storeListing = await inventoryStoreMaster.findOne({
    instituteId: instituteId,
    storeName: body.storeName.trim(),
    status: true
  });
  if (storeListing) {
    return {
      success: false,
      message: 'Store name  already exists.',
      code: 401,
      data: {}
    };
  }

  try {
    let response = await inventoryStoreMaster.create({
      instituteId,
      ...req.body
    });
    return {
      success: true,
      message: 'Store is created successfully.',
      code: 201,
      data: response
    };
  } catch (err) {
    console.log(err);
  }
};

const editInventoryStoreService = async (req, res) => {
  const instituteId = req.authData.data.instituteId;

  let body = req.body;
  let storelisting = await inventoryStoreMaster.findOne({
    _id: { $ne: body.storeId },
    instituteId: instituteId,
    storeName: body.storeName.trim(),
    status: true
  });
  if (storelisting) {
    return {
      success: false,
      message: 'Store name  already exists.',
      code: 201,
      data: {}
    };
  }
  try {
    let response = await inventoryStoreMaster.updateOne(
      { _id: body.storeId },
      {
        $set: {
          storeName: body.storeName,
          storeDesc: body.storeDesc,
          editedAt: new Date()
        }
      }
    );
    return {
      success: true,
      message: 'Store updated successfully.',
      code: 201,
      data: response
    };
  } catch (error) {
    console.log(error);
  }
};

const deleteInventoryStoreService = async (req, res) => {
  try {
    let { storeId } = req.params;
    // console.log(req.params);
    let response = await inventoryStoreMaster.updateOne(
      { _id: storeId },
      {
        $set: { status: null, updatedAt: new Date() }
      }
    );

    return {
      success: true,
      message: 'Store deleted successfully.',
      code: 201,
      data: response
    };
  } catch (err) {
    console.log(err);
  }
};

const getInventoryStoreListingService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const sortBy = req.query.sortBy;
    const orderBy = req.query.orderBy;
    const searchKeyWord = req.query
        ? req.query.searchKey
            ? req.query.searchKey
            : ''
        : '';
    let sortOrder = {};
    if (sortBy && orderBy) {
      sortOrder[`${sortBy}`] = orderBy === 'asc' ? 1 : -1;
    }else {
      sortOrder['createdAt'] = -1;
    }
     /* Checking for special charater in serch keyword*/
    if(searchKeyWord && hasSpecialCharacters(searchKeyWord)){
      return await apiresponse(false, 'No data found !', 201, '');
    }
    let queryArray = [
      {
          $match: {
              status:true,
              $or:[
                  {instituteId:instituteId},
                  {instituteId:null}
              ]
          }
      },
      {
          $match: {
              $or: [
                  { 'storeName': { $regex: searchKeyWord, $options: 'i' } }
              ]
          }
      },
      {
          $project: {
              _id: 1,
              storeName: 1,
              storeDesc: 1,
              status:1,
              createdAt:1,
              updatedAt:'$editedAt'
          }
      },
      { $sort: sortOrder }
    ];

    if (req.query.pageSize && req.query.pageNo) {
      queryArray.push(
        {
            $facet: {
                total: [
                    { $group: { _id: null, count: { $sum: 1 } } }
                ],
                data: [
                    {
                        $skip: (Number(req.query.pageNo) - 1) * Number(req.query.pageSize)
                    },
                    {
                        $limit: Number(req.query.pageSize)
                    }
                ]
            }
        }
      );
      let aggregationResult = await inventoryStoreMaster.aggregate(queryArray);
      let total = aggregationResult[0].total[0] ? aggregationResult[0].total[0].count : 0;
      let dataListing = aggregationResult[0].data;

      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
      let result = {
          rows: dataListing,
          total: total,
      };
      return await apiresponse(true, msg, 201, result);
    } else {
      let aggregationResult = await inventoryStoreMaster.aggregate(queryArray);
      let total=aggregationResult.length;
      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
      return await apiresponse(true, msg, 201, aggregationResult);
    }
  } catch (error) {
    console.log(error);
  }
};

export default {
  createInventoryStoreService,
  editInventoryStoreService,
  deleteInventoryStoreService,
  getInventoryStoreListingService
};
