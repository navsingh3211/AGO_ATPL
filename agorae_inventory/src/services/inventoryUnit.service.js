/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import InventoryUnitMaster from '../models/inventoryUnitMaster.model.js';
import paginationSearchHandler from '../utils/paginationSearchHandler.util.js';
import {hasSpecialCharacters} from '../utils/commonFunction.util.js';
import CONSTANTS from '../utils/constants.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';

const createInventoryUnitService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;
    let unitlisting = await InventoryUnitMaster.findOne({
        $or: [{ instituteId: instituteId }, { instituteId: null }],
        unitName: body.unitName.trim(),
        status: true
    });
    if (unitlisting) {
        return {
            success: false,
            message: 'Unit name  already exists.',
            code: 401,
            data: {}
        };
    }

    try {
        let response = await InventoryUnitMaster.create({
        instituteId,
        ...req.body
        });
        return {
            success: true,
            message: 'Unit created successfully.',
            code: 201,
            data: response
        };
    } catch (err) {
        console.log(err);
    }
};

const updateInventoryUnitService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;

    let body = req.body;

    let unitlisting = await InventoryUnitMaster.findOne({
        $or: [{ instituteId: instituteId }, { instituteId: null }],
        unitName: body.unitName.trim(),
        status: true
    });
    if (unitlisting) {
        return {
            success: false,
            message: 'Unit name  already exists.',
            code: 401,
            data: {}
        };
    }
    try {
        let response = await InventoryUnitMaster.updateOne(
        { _id: body.id },
        {
            $set: { unitName: body.unitName, editedAt: new Date() }
        }
        );
        return {
            success: true,
            message: 'Unit updated successfully.',
            code: 201,
            data: response
        };
    } catch (error) {
        console.log(error);
    }
};

const deleteInventoryUnitService = async (req, res) => {
  try {
    let { id } = req.params;
    // console.log(req.params);
    let response = await InventoryUnitMaster.updateOne(
      { _id: id },
      {
        $set: { status: null, updatedAt: new Date() }
      }
    );

    return {
      success: true,
      message: 'Unit deleted successfully.',
      code: 201,
      data: response
    };
  } catch (err) {
    console.log(err);
  }
};

const getInventoryUnitService = async (req, res) => {
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
      sortOrder['updatedAt'] = -1;
    }
    /* Checking for special charater in serch keyword*/
    if(req.query.searchKey && hasSpecialCharacters(req.query.searchKey)){
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
                  { 'unitName': { $regex: searchKeyWord, $options: 'i' } },
              ]
          }
      },
      {
          $project: {
              _id: 1,
              unitName: 1,
              isAlreadyUsed: 1,
              isStatic: 1,
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
      let aggregationResult = await InventoryUnitMaster.aggregate(queryArray);
      let total = aggregationResult[0].total[0] ? aggregationResult[0].total[0].count : 0;
      let dataListing = aggregationResult[0].data;

      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
      let result = {
          rows: dataListing,
          total: total,
      };
      return await apiresponse(true, msg, 201, result);

    } else {
      let aggregationResult = await InventoryUnitMaster.aggregate(queryArray);
      let total=aggregationResult.length;
      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;

      return await apiresponse(true, msg, 201, aggregationResult);
    }
  } catch (error) {
    console.log(error);
  }
};

export default {
  createInventoryUnitService,
  updateInventoryUnitService,
  deleteInventoryUnitService,
  getInventoryUnitService
};
