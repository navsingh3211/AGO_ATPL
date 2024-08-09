/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line no-unused-vars
import inventorySubCategoryMaster from '../models/inventorySubCategoryMaster.model.js';
import InventoryCategoryMaster from '../models/InventoryCategoryMaster.model.js';
import paginationSearchHandler from '../utils/paginationSearchHandler.util.js';
import {hasSpecialCharacters} from '../utils/commonFunction.util.js';
import mongoose from 'mongoose';
// import commonResponse from '../utils/commonResponse.util';
import CONSTANTS from '../utils/constants.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';



const createInventorySubCategoryService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;

    let body = req.body;
    let subCategorylisting = await inventorySubCategoryMaster.findOne({
        instituteId:instituteId, subCategoryName: body.subCategoryName.trim(), status: true,categoryId:body.categoryId
    });
    if (subCategorylisting){
        return {
            success:false,
            message: 'Sub-category name already exists in given category.',
            code: 401,
            data: {}
          };
    }

    try{
        let response = await inventorySubCategoryMaster.create({ instituteId, ...req.body });
        if(response){
          //updating isAlreadyUsed field for disable already used field deletion
          await InventoryCategoryMaster.updateOne(
            {
              _id:body.categoryId,
              isStatic:false
            },
            {
              $set:{
                isAlreadyUsed:true
              }
            }
          )
        }
        return {
            success:true,
            message: 'Sub-category created successfully.',
            code: 201,
            data: response
        };
    }catch(err){
        console.log(err);
    }

};

const updateInventorySubCatService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;

    let body = req.body;
    let subCategorylisting = await inventorySubCategoryMaster.findOne({
        instituteId:instituteId, subCategoryName: body.subCategoryName.trim(), status: true,categoryId:body.categoryId
    });
    if (subCategorylisting){
        return {
            success:false,
            message: 'Sub-category name already exists in given category.',
            code: 201,
            data: {}
          };
    }
    try {
      let response = await inventorySubCategoryMaster.updateOne(
        { _id: body.subCatId },
        {
          $set: {
            categoryId: body.categoryId,
            subCategoryName: body.subCategoryName,
            editedAt: new Date()
          }
        }
      );

      if(response){
        let getSubcatCat = await inventorySubCategoryMaster.findOne(
          {_id:body.subCatId},
          {
            categoryId:1,_id:0
          }
        );


        if(getSubcatCat.categoryId !== new mongoose.Types.ObjectId(body.categoryId)){

          await InventoryCategoryMaster.updateOne(
            { _id: getSubcatCat.categoryId },
            { $set: { isAlreadyUsed: false } }
          );
          await InventoryCategoryMaster.updateOne(
            { _id: new mongoose.Types.ObjectId(body.categoryId) },
            { $set: { isAlreadyUsed: true } }
          );

        }
      }
      return {
        success: true,
        message: 'Sub-category updated successfully.',
        code: 201,
        data: response
      };
    } catch (error) {
      console.log(error);
    }
};

const deleteInventorySubCatService = async (req, res) => {
  try {
    let { id } = req.params;
    // console.log(req.params);
    let response = await inventorySubCategoryMaster.updateOne(
      { _id: id },
      {
        $set: { status: null, updatedAt: new Date() }
      }
    );

    return {
      success: true,
      message: 'Sub-category deleted successfully.',
      code: 201,
      data: response
    };
  } catch (err) {
    console.log(err);
  }
};

const getInventorySubCatService = async(req,res)=>{
    try{
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
        if(req.query.searchKey && hasSpecialCharacters(req.query.searchKey)){
          return await apiresponse(false, 'No data found !', 201, '');
        }
        const categoryId = req.query ? (req.query.categoryId ? req.query.categoryId : '') : '';
        const subCatId = req.query ? (req.query.subCatId ? req.query.subCatId : '') : '';
        let conditionObj = { status:true,instituteId:instituteId };
        if(categoryId){
            conditionObj.categoryId = new mongoose.Types.ObjectId(categoryId);
        }
        if(subCatId){
            conditionObj._id = new mongoose.Types.ObjectId(subCatId);
        }
        //  console.log(conditionObj,'conditionObj');
        // process.exit(0);
        let queryArray = [
          {
              $match: conditionObj
          },
          {
            $lookup: {
                from: 'inventorycategorymasters',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'Category'
            }
          },
          {
            $unwind: {
                path: '$Category',
                preserveNullAndEmptyArrays: true // Preserve documents without matches
            }
          },
          {
              $match: {
                  $or: [
                      { 'subCategoryName': { $regex: searchKeyWord, $options: 'i' } }
                  ]
              }
          },
          {
              $project: {
                  _id: 1,
                  // categoryId: 1,
                  categoryId:{
                    _id:'$Category._id',
                    categoryName:'$Category.categoryName'
                  },
                  subCategoryName: 1,
                  isAlreadyUsed:1,
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
          let aggregationResult = await inventorySubCategoryMaster.aggregate(queryArray);
          let total = aggregationResult[0].total[0] ? aggregationResult[0].total[0].count : 0;
          let dataListing = aggregationResult[0].data;

          let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
          let result = {
              rows: dataListing,
              total: total
          };
          return await apiresponse(true, msg, 201, result);

        } else {
          let aggregationResult = await inventorySubCategoryMaster.aggregate(queryArray);
          let total=aggregationResult.length;
          let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
          return await apiresponse(true, msg, 201, aggregationResult);
        }
    }catch(error){
        console.log(error);
    }
};


export default {
    createInventorySubCategoryService,
    updateInventorySubCatService,
    deleteInventorySubCatService,
    getInventorySubCatService
        };
