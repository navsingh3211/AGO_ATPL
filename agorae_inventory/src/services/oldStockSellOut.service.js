/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
import mongoose from 'mongoose';
import oldStockSellOut from '../models/oldStockSellOut.model.js';
import inventoryItemMaster from '../models/inventoryItemMaster.model.js';
import { hasSpecialCharacters } from '../utils/commonFunction.util.js';
import paginationSearchHandler from '../utils/paginationSearchHandler.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';
import {
  getUnitNameAndIdById,
  getImageFullPathById,
  getDateFormate
} from '../utils/commonFunction.util.js';

const addItemToOldStockMasterService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;
    const oldStockCreatedId = await oldStockSellOut.create({
      instituteId,
      ...req.body
    });
    if(oldStockCreatedId){
      await inventoryItemMaster.updateOne(
        {_id:body.itemMasterId,'itemSizes.size':body.size},
        {
            $inc: {
                'itemSizes.$.itemQuantity.quantity': - (body.quantityToBeSold.quantity),
                'itemSizes.$.totalSellingPrice': - (body.totalSellingPrice)
            }
        }
      );
    }
    return await apiresponse(true, MESSAGES.OLD_STOCK.CREATE, 201, null);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const getOldStockListingService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const searchKey = req.query
      ? req.query.searchKey
        ? req.query.searchKey
        : ''
      : '';

    const categoryId = req.query
      ? req.query.categoryId
        ? req.query.categoryId
        : ''
      : '';
    const subCategoryId = req.query
    ? req.query.subCategoryId
      ? req.query.subCategoryId
      : ''
    : '';

    if (req.query.searchKey && hasSpecialCharacters(req.query.searchKey)) {
      return await apiresponse(false, 'No data found !', 201, '');
    }

    let conditionObj = { status: true, instituteId: instituteId };
    if (categoryId) {
      conditionObj.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (subCategoryId) {
      conditionObj.subCategoryId = new mongoose.Types.ObjectId(subCategoryId);
    }
    // console.log(conditionObj);
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
          $addFields: {
              Category: {
                  $ifNull: ['$Category', {}] // Replace null values with an empty object
              }
          }
      },
      {
          $lookup: {
              from: 'inventorysubcategorymasters',
              localField: 'subCategoryId',
              foreignField: '_id',
              as: 'SubCategory'
          }
      },
      {
          $unwind: {
              path: '$SubCategory',
              preserveNullAndEmptyArrays: true // Preserve documents without matches
          }
      },
      {
          $addFields: {
              SubCategory: {
                  $ifNull: ['$SubCategory', {}] // Replace null values with an empty object
              }
          }
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
        $unwind: {
            path: '$itemDetails',
            preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
          $addFields: {
              itemDetails: {
                  $ifNull: ['$itemDetails', {}] // Replace null values with an empty object
              }
          }
      },
      // {
      //   $unwind: '$itemDetails'
      // },
      {
        $lookup: {
            from: 'inventoryvendormasters',
            localField: 'vendorId',
            foreignField: '_id',
            as: 'fixVendorMaster'
        }
      },
      {
        $unwind: {
            path: '$fixVendorMaster',
            preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
          $addFields: {
              fixVendorMaster: {
                  $ifNull: ['$fixVendorMaster', {}] // Replace null values with an empty object
              }
          }
      },
      {
        $match: {
          $or: [
            { 'itemDetails.itemName': { $regex: searchKey, $options: 'i' } }, // Search in itemName
            {
              'fixVendorMaster.vendorName': {
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
          catId:'$Category._id',
          categoryName:'$Category.categoryName',
          subCatId:'$SubCategory._id',
          subCategoryName:'$SubCategory.subCategoryName',
          modifiedAt:'$editedAt',
          itemId:{
            $cond:{
              if:{$eq:['$itemDetails',{}]},
              then:'NA',
              else:'$itemDetails._id'
            }
          },
          itemName:{
            $cond:{
              if:{$eq:['$itemDetails',{}]},
              then:'NA',
              else:'$itemDetails.itemName'
            }
          },
          avaliableQuantity:1,
          size:1,
          quantityToBeSold:1,
          purchasePricePerUnit:1,
          totalPurchasePrice:1,
          totalSellingPrice:1,
          vendorId:1,
          vendorName: '$fixVendorMaster.vendorName',
          note:1,
          uploadedDocumentID:1
        }
      }
    ];

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
      let aggregationResult = await oldStockSellOut.aggregate(queryArray);
      let total = aggregationResult[0].total[0]
        ? aggregationResult[0].total[0].count
        : 0;
      let dataListing = aggregationResult[0].data;
      dataListing = await Promise.all(dataListing.map(async(data)=>{
        return {
          _id:data._id,
          size:data.size,
          avaliableQuantity:{
            quantity:data.avaliableQuantity.quantity,
            unit:data.avaliableQuantity.unit ? await getUnitNameAndIdById(data.avaliableQuantity.unit) : null
          },
          quantityToBeSold:{
            quantity:data.quantityToBeSold.quantity,
            unit:data.quantityToBeSold.unit ? await getUnitNameAndIdById(data.quantityToBeSold.unit) : null
          },
          purchasePricePerUnit:data.purchasePricePerUnit,
          totalPurchasePrice:data.totalPurchasePrice,
          totalSellingPrice:data.totalSellingPrice,
          catId:data.catId,
          categoryName:data.categoryName,
          subCatId:data.subCatId,
          subCategoryName:data.subCategoryName,
          modifiedAt:data.modifiedAt,
          itemId:data.itemId,
          itemName:data.itemName,
          vendorId:data.vendorId,
          vendorName:data.vendorName,
          note:data.note,
          uploadedDocumentDetails:{
            documentID:data.uploadedDocumentID,
            path:await getImageFullPathById(data.uploadedDocumentID)
          }
        }
      }));

      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
      let result = {
        rows: dataListing,
        total: total
      };
      return await apiresponse(true, msg, 201, result);
    } else {
      let aggregationResult = await oldStockSellOut.aggregate(queryArray);
      let total = aggregationResult.length;
      let dataListing = aggregationResult;
      dataListing = await Promise.all(dataListing.map(async(data)=>{
        return {
          _id:data._id,
          size:data.size,
          avaliableQuantity:{
            quantity:data.avaliableQuantity.quantity,
            unit:data.avaliableQuantity.unit ? await getUnitNameAndIdById(data.avaliableQuantity.unit) : null
          },
          quantityToBeSold:{
            quantity:data.quantityToBeSold.quantity,
            unit:data.quantityToBeSold.unit ? await getUnitNameAndIdById(data.quantityToBeSold.unit) : null
          },
          purchasePricePerUnit:data.purchasePricePerUnit,
          totalPurchasePrice:data.totalPurchasePrice,
          totalSellingPrice:data.totalSellingPrice,
          catId:data.catId,
          categoryName:data.categoryName,
          subCatId:data.subCatId,
          subCategoryName:data.subCategoryName,
          modifiedAt:data.modifiedAt,
          itemId:data.itemId,
          itemName:data.itemName,
          vendorId:data.vendorId,
          vendorName:data.vendorName,
          note:data.note,
          uploadedDocumentDetails:{
            documentID:data.uploadedDocumentID,
            path:data.uploadedDocumentID ? await getImageFullPathById(data.uploadedDocumentID) : null
          }
        }
      }));
      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;

      return await apiresponse(true, msg, 201, dataListing);
    }
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const editItemToOldStockMasterService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;
    let {oldStockId,...bodyToUpdate} = body;

    const oldStockDetails = await oldStockSellOut.findOne({_id:body.oldStockId});
    if(!oldStockDetails){
      return await apiresponse(false, MESSAGES.OLD_STOCK.INVALID_OLD_STACKID, 201, null);
    }

    /*Update the stock of item master first or update back*/
    if(oldStockDetails){
      await inventoryItemMaster.updateOne(
        {_id:oldStockDetails.itemMasterId,'itemSizes.size':oldStockDetails.size},
        {
            $inc: {
                'itemSizes.$.itemQuantity.quantity':  (oldStockDetails.quantityToBeSold.quantity),
                'itemSizes.$.totalSellingPrice':  (oldStockDetails.totalSellingPrice)
            }
        }
      );
    }

    const updateData = await oldStockSellOut.updateOne(
      { _id: new mongoose.Types.ObjectId(body.oldStockId) },
      {
        $set: {
          instituteId,
          ...bodyToUpdate
        }
      }
    );

    /*decrease the stock of item master first or update back*/
    if(updateData){
      await inventoryItemMaster.updateOne(
        {_id:body.itemMasterId,'itemSizes.size':body.size},
        {
            $inc: {
                'itemSizes.$.itemQuantity.quantity': - (body.quantityToBeSold.quantity),
                'itemSizes.$.totalSellingPrice': - (body.totalSellingPrice)
            }
        }
      );
    }
    return await apiresponse(true, MESSAGES.OLD_STOCK.CREATE, 201, null);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const viewOldStockDetailsService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const {oldStockId} = req.params;
    let conditionObj = { _id:new mongoose.Types.ObjectId(oldStockId),status: true, instituteId: instituteId };

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
          $addFields: {
              Category: {
                  $ifNull: ['$Category', {}] // Replace null values with an empty object
              }
          }
      },
      {
          $lookup: {
              from: 'inventorysubcategorymasters',
              localField: 'subCategoryId',
              foreignField: '_id',
              as: 'SubCategory'
          }
      },
      {
          $unwind: {
              path: '$SubCategory',
              preserveNullAndEmptyArrays: true // Preserve documents without matches
          }
      },
      {
          $addFields: {
              SubCategory: {
                  $ifNull: ['$SubCategory', {}] // Replace null values with an empty object
              }
          }
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
        $lookup: {
            from: 'inventoryvendormasters',
            localField: 'vendorId',
            foreignField: '_id',
            as: 'fixVendorMaster'
        }
      },
      {
        $unwind: {
            path: '$fixVendorMaster',
            preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
          $addFields: {
              fixVendorMaster: {
                  $ifNull: ['$fixVendorMaster', {}] // Replace null values with an empty object
              }
          }
      },
      {
        $project: {
          _id: 1,
          categoryName:'$Category.categoryName',
          subCategoryName:'$SubCategory.subCategoryName',
          modifiedAt:'$editedAt',
          itemName: '$itemDetails.itemName',
          itemImages:'$itemDetails.itemImages',
          avaliableQuantity:1,
          size:1,
          quantityToBeSold:1,
          purchasePricePerUnit:1,
          totalPurchasePrice:1,
          sellingPricePerUnit:1,
          totalSellingPrice:1,
          vendorName: '$fixVendorMaster.vendorName',
          note:1
        }
      }
    ];

    let aggregationResult = await oldStockSellOut.aggregate(queryArray);
    let data = aggregationResult[0];

    let imageArr=data.itemImages;
    let imgFinalArray = await Promise.all(imageArr.map(async(image) => {
        const { documentID, ...rest } = image;
        return {
          path:await getImageFullPathById(documentID),
          ...rest
        };
    }));

    data = {
      _id:data._id,
      size:data.size,
      avaliableQuantity:{
        quantity:data.avaliableQuantity.quantity,
        unit:data.avaliableQuantity.unit ? await getUnitNameAndIdById(data.avaliableQuantity.unit) : null
      },
      quantityToBeSold:{
        quantity:data.quantityToBeSold.quantity,
        unit:data.quantityToBeSold.unit ? await getUnitNameAndIdById(data.quantityToBeSold.unit) : null
      },
      purchasePricePerUnit:data.purchasePricePerUnit,
      totalPurchasePrice:data.totalPurchasePrice,
      sellingPricePerUnit:data.sellingPricePerUnit,
      totalSellingPrice:data.totalSellingPrice,
      categoryName:data.categoryName,
      subCategoryName:data.subCategoryName,
      modifiedAt:data.modifiedAt,
      itemName:data.itemName,
      itemImages:imgFinalArray,
      vendorName:data.vendorName,
      note:data.note
    }

    let msg = data ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;

    return await apiresponse(true, msg, 201, data);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const getReceiptDataForOldStockPdfService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const {oldStockId} = req.params;
    let conditionObj = { _id:new mongoose.Types.ObjectId(oldStockId),status: true, instituteId: instituteId };

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
          $addFields: {
              Category: {
                  $ifNull: ['$Category', {}] // Replace null values with an empty object
              }
          }
      },
      {
          $lookup: {
              from: 'inventorysubcategorymasters',
              localField: 'subCategoryId',
              foreignField: '_id',
              as: 'SubCategory'
          }
      },
      {
          $unwind: {
              path: '$SubCategory',
              preserveNullAndEmptyArrays: true // Preserve documents without matches
          }
      },
      {
          $addFields: {
              SubCategory: {
                  $ifNull: ['$SubCategory', {}] // Replace null values with an empty object
              }
          }
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
        $lookup: {
            from: 'inventoryvendormasters',
            localField: 'vendorId',
            foreignField: '_id',
            as: 'fixVendorMaster'
        }
      },
      {
        $unwind: {
            path: '$fixVendorMaster',
            preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
          $addFields: {
              fixVendorMaster: {
                  $ifNull: ['$fixVendorMaster', {}] // Replace null values with an empty object
              }
          }
      },
      {
        $project: {
          _id: 1,
          categoryName:'$Category.categoryName',
          subCategoryName:'$SubCategory.subCategoryName',
          modifiedAt:'$editedAt',
          itemName: '$itemDetails.itemName',
          avaliableQuantity:1,
          size:1,
          quantityToBeSold:1,
          purchasePricePerUnit:1,
          totalPurchasePrice:1,
          sellingPricePerUnit:1,
          totalSellingPrice:1,
          vendorName: '$fixVendorMaster.vendorName',
          note:1
        }
      }
    ];

    let aggregationResult = await oldStockSellOut.aggregate(queryArray);
    let data = aggregationResult[0];

    data = {
      _id:data._id,
      size:data.size,
      avaliableQuantity:{
        quantity:data.avaliableQuantity.quantity,
        unit:data.avaliableQuantity.unit ? await getUnitNameAndIdById(data.avaliableQuantity.unit) : null
      },
      quantityToBeSold:{
        quantity:data.quantityToBeSold.quantity,
        unit:data.quantityToBeSold.unit ? await getUnitNameAndIdById(data.quantityToBeSold.unit) : null
      },
      purchasePricePerUnit:data.purchasePricePerUnit,
      totalPurchasePrice:data.totalPurchasePrice,
      sellingPricePerUnit:data.sellingPricePerUnit,
      totalSellingPrice:data.totalSellingPrice,
      categoryName:data.categoryName,
      subCategoryName:data.subCategoryName,
      modifiedAt:getDateFormate(data.modifiedAt),
      itemName:data.itemName,
      vendorName:data.vendorName,
      note:data.note
    }

    let msg = data ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;

    return await apiresponse(true, msg, 201, data);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

export default {
  addItemToOldStockMasterService,
  getOldStockListingService,
  editItemToOldStockMasterService,
  viewOldStockDetailsService,
  getReceiptDataForOldStockPdfService
}