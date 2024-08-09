/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import mongoose from 'mongoose';
import vendorPurchaseRequest from '../models/vendorPurchaseRequest.model.js';
import { hasSpecialCharacters } from '../utils/commonFunction.util.js';
import paginationSearchHandler from '../utils/paginationSearchHandler.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';
import {
  getUnitNameAndIdById,
  getImageFullPathById,
  getDateFormate
} from '../utils/commonFunction.util.js';

const editVendorPurchaseReqService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;

    await vendorPurchaseRequest.updateOne(
      { _id: new mongoose.Types.ObjectId(body.vendorPurchaseId) },
      {
        $set: {
          uploadedDocumentID: body.uploadedDocumentID
        }
      }
    );
    return await apiresponse(
      true,
      MESSAGES.VENDOR_PURCHASE_REQ.EDIT,
      201,
      null
    );
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const getVendorReqListingService = async (req, res) => {
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
            $ifNull: ['$Category', {}]
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
            $ifNull: ['$SubCategory', {}]
          }
        }
      },
      {
        $lookup: {
          from: 'inventoryvendormasters',
          localField: 'fixedVendorId',
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
            { itemName: { $regex: searchKey, $options: 'i' } }, // Search in itemName
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
          catId: '$Category._id',
          categoryName: '$Category.categoryName',
          subCatId: '$SubCategory._id',
          subCategoryName: '$SubCategory.subCategoryName',
          modifiedAt: '$editedAt',
          itemName: 1,
          proposedQty: 1,
          receivedQty: 1,
          vendorPurchaseStatus: 1,
          fixedVendorId: 1,
          vendorName: '$fixVendorMaster.vendorName',
          uploadedDocumentID: 1
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
      let aggregationResult = await vendorPurchaseRequest.aggregate(queryArray);
      let total = aggregationResult[0].total[0]
        ? aggregationResult[0].total[0].count
        : 0;
      let dataListing = aggregationResult[0].data;
      dataListing = await Promise.all(
        dataListing.map(async (data) => {
          return {
            _id: data._id,
            catId: data.catId,
            categoryName: data.categoryName,
            subCatId: data.subCatId,
            subCategoryName: data.subCategoryName,
            modifiedAt: data.modifiedAt,
            itemName: data.itemName,
            proposedQty: {
              quantity: data.proposedQty ? data.proposedQty.quantity : 0,
              unit:
                data.proposedQty && data.proposedQty.unit
                  ? await getUnitNameAndIdById(data.proposedQty.unit)
                  : null
            },
            receivedQty: {
              quantity: data.receivedQty ? data.receivedQty.quantity : 0,
              unit:
                data.receivedQty && data.receivedQty.unit
                  ? await getUnitNameAndIdById(data.receivedQty.unit)
                  : null
            },
            vendorPurchaseStatus: data.vendorPurchaseStatus,
            vendorId: data.fixedVendorId,
            vendorName: data.vendorName,
            uploadedDocumentDetails: {
              documentID: data.uploadedDocumentID,
              path: data.uploadedDocumentID
                ? await getImageFullPathById(data.uploadedDocumentID)
                : null
            }
          };
        })
      );

      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
      let result = {
        rows: dataListing,
        total: total
      };
      return await apiresponse(true, msg, 201, result);
    } else {
      let aggregationResult = await vendorPurchaseRequest.aggregate(queryArray);
      let total = aggregationResult.length;
      let dataListing = aggregationResult;
      dataListing = await Promise.all(
        dataListing.map(async (data) => {
          return {
            _id: data._id,
            catId: data.catId,
            categoryName: data.categoryName,
            subCatId: data.subCatId,
            subCategoryName: data.subCategoryName,
            modifiedAt: data.modifiedAt,
            itemName: data.itemName,
            proposedQty: {
              quantity: data.proposedQty ? data.proposedQty.quantity : 0,
              unit:
                data.proposedQty && data.proposedQty.unit
                  ? await getUnitNameAndIdById(data.proposedQty.unit)
                  : null
            },
            receivedQty: {
              quantity: data.receivedQty ? data.receivedQty.quantity : 0,
              unit:
                data.receivedQty && data.receivedQty.unit
                  ? await getUnitNameAndIdById(data.receivedQty.unit)
                  : null
            },
            vendorPurchaseStatus: data.vendorPurchaseStatus,
            vendorId: data.fixedVendorId,
            vendorName: data.vendorName,
            uploadedDocumentDetails: {
              documentID: data.uploadedDocumentID,
              path: data.uploadedDocumentID
                ? await getImageFullPathById(data.uploadedDocumentID)
                : null
            }
          };
        })
      );
      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;

      return await apiresponse(true, msg, 201, dataListing);
    }
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const viewVendorRequestService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const { vendorPurchaseId } = req.params;
    // console.log(vendorPurchaseId, 'vendorPurchaseId');
    const viewData = await vendorPurchaseRequest.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(vendorPurchaseId)
        }
      },
      {
        $lookup: {
          from: 'inventorycategorymasters',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
        $addFields: {
          category: {
            $ifNull: ['$category', {}]
          }
        }
      },
      {
        $lookup: {
          from: 'inventorysubcategorymasters',
          localField: 'subCategoryId',
          foreignField: '_id',
          as: 'subcategory'
        }
      },
      {
        $unwind: {
          path: '$subcategory',
          preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
        $addFields: {
          subcategory: {
            $ifNull: ['$subcategory', {}]
          }
        }
      },
      {
        $lookup: {
          from: 'inventoryvendormasters',
          localField: 'fixedVendorId',
          foreignField: '_id',
          as: 'vendorData'
        }
      },
      {
        $unwind: {
          path: '$vendorData',
          preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
        $addFields: {
          vendorData: {
            $ifNull: ['$vendorData', {}]
          }
        }
      },
      {
        $lookup: {
          from: 'inventorytaxratemasters',
          localField: 'taxRate',
          foreignField: '_id',
          as: 'taxData'
        }
      },
      {
        $unwind: {
          path: '$taxData',
          preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
        $addFields: {
          taxData: {
            $ifNull: ['$taxData', {}]
          }
        }
      },
      {
        $lookup: {
          from: 'inventoryvendormasters',
          localField: 'preferredVendor',
          foreignField: '_id',
          as: 'preferredVendorData'
        }
      },
      {
        $unwind: {
          path: '$preferredVendorData',
          preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
        $addFields: {
          preferredVendorData: {
            $ifNull: ['$preferredVendorData', {}]
          }
        }
      },
      {
        $project: {
          itemImages: 1,
          categoryName: '$category.categoryName',
          subcategoryName: '$subcategory.subCategoryName',
          itemId: 1,
          purchaseDate: '$createdAt',
          itemName: 1,
          vendorName: '$vendorData.vendorName',
          proposedQty: 1,
          receivedQty: 1,
          vendorPurchaseStatus: 1,
          taxRate: 1,
          itemSizes: 1,
          weightData: 1,
          materialType: 1,
          otherDetails: 1,
          enableTracking: 1,
          quantityInHand: 1,
          reorderPointData: 1,
          preferredVendorData: 1
        }
      }
    ]);
    const resultData = viewData[0];
    const itemImages = resultData.itemImages;
    let imgFinalArray = await Promise.all(
      itemImages.map(async (image) => {
        const { documentID, ...rest } = image;
        return {
          path: await getImageFullPathById(documentID),
          ...rest
        };
      })
    );
    const finalData = {
      itemImages: imgFinalArray,
      categoryName: resultData.categoryName,
      subcategoryName: resultData.subcategoryName,
      itemId: resultData.itemId,
      purchaseDate: resultData.purchaseDate,
      itemName: resultData.itemName,
      vendorName: resultData.vendorName,
      proposedQty: {
        quantity: resultData.proposedQty ? resultData.proposedQty.quantity : 0,
        unit:
          resultData.proposedQty && resultData.proposedQty.unit
            ? await getUnitNameAndIdById(resultData.proposedQty.unit)
            : 'NA'
      },
      receivedQty: {
        quantity: resultData.receivedQty ? resultData.receivedQty.quantity : 0,
        unit:
          resultData.receivedQty && resultData.receivedQty.unit
            ? await getUnitNameAndIdById(resultData.receivedQty.unit)
            : 'NA'
      },
      vendorPurchaseStatus: resultData.vendorPurchaseStatus,
      taxRate: resultData.taxRate,
      itemSizes: resultData.itemSizes,
      weightData: resultData.weightData
        ? {
            weight: resultData.weightData.weight,
            unit: resultData.weightData.unit
              ? await getUnitNameAndIdById(resultData.weightData.unit)
              : 'NA'
          }
        : 'NA',
      materialType: resultData.materialType,
      otherDetails: resultData.otherDetails,
      enableTracking: resultData.enableTracking,
      quantityInHand: resultData.quantityInHand,
      reorderPointData: resultData.reorderPointData,
      preferredVendorData:
        Object.keys(resultData.preferredVendorData).length !== 0
          ? resultData.preferredVendorData.vendorName
          : 'NA'
    };

    let msg = finalData ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
    return await apiresponse(true, msg, 201, finalData);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const downloadVendorPurchaseReceiptService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const { vendorPurchaseId } = req.params;
    const viewData = await vendorPurchaseRequest.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(vendorPurchaseId)
        }
      },
      {
        $lookup: {
          from: 'inventorycategorymasters',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
        $addFields: {
          category: {
            $ifNull: ['$category', {}]
          }
        }
      },
      {
        $lookup: {
          from: 'inventorysubcategorymasters',
          localField: 'subCategoryId',
          foreignField: '_id',
          as: 'subcategory'
        }
      },
      {
        $unwind: {
          path: '$subcategory',
          preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
        $addFields: {
          subcategory: {
            $ifNull: ['$subcategory', {}]
          }
        }
      },
      {
        $lookup: {
          from: 'inventoryvendormasters',
          localField: 'fixedVendorId',
          foreignField: '_id',
          as: 'vendorData'
        }
      },
      {
        $unwind: {
          path: '$vendorData',
          preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
        $addFields: {
          vendorData: {
            $ifNull: ['$vendorData', {}]
          }
        }
      },
      {
        $lookup: {
          from: 'inventorytaxratemasters',
          localField: 'taxRate',
          foreignField: '_id',
          as: 'taxData'
        }
      },
      {
        $unwind: {
          path: '$taxData',
          preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
        $addFields: {
          taxData: {
            $ifNull: ['$taxData', {}]
          }
        }
      },
      {
        $lookup: {
          from: 'inventoryvendormasters',
          localField: 'preferredVendor',
          foreignField: '_id',
          as: 'preferredVendorData'
        }
      },
      {
        $unwind: {
          path: '$preferredVendorData',
          preserveNullAndEmptyArrays: true // Preserve documents without matches
        }
      },
      {
        $addFields: {
          preferredVendorData: {
            $ifNull: ['$preferredVendorData', {}]
          }
        }
      },
      {
        $project: {
          categoryName: '$category.categoryName',
          subcategoryName: '$subcategory.subCategoryName',
          itemId: 1,
          purchaseDate: '$createdAt',
          itemName: 1,
          vendorName: '$vendorData.vendorName',
          proposedQty: 1,
          receivedQty: 1,
          vendorPurchaseStatus: 1,
          taxRate: 1,
          itemSizes: 1,
          weightData: 1,
          materialType: 1,
          otherDetails: 1,
          enableTracking: 1,
          quantityInHand: 1,
          reorderPointData: 1,
          preferredVendorData: 1
        }
      }
    ]);
    const resultData = viewData[0];

    const finalData = {
      categoryName: resultData.categoryName,
      subcategoryName: resultData.subcategoryName,
      itemId: resultData.itemId,
      purchaseDate: getDateFormate(resultData.purchaseDate),
      itemName: resultData.itemName,
      vendorName: resultData.vendorName,
      proposedQty: {
        quantity: resultData.proposedQty.quantity,
        unit: resultData.proposedQty.unit
          ? await getUnitNameAndIdById(resultData.proposedQty.unit)
          : 'NA'
      },
      receivedQty: {
        quantity: resultData.receivedQty ? resultData.receivedQty.quantity : 0,
        unit: resultData.receivedQty.unit
          ? await getUnitNameAndIdById(resultData.receivedQty.unit)
          : 'NA'
      },
      vendorPurchaseStatus: resultData.vendorPurchaseStatus,
      taxRate: resultData.taxRate,
      itemSizes: resultData.itemSizes,
      weightData: resultData.weightData,
      materialType: resultData.materialType,
      otherDetails: resultData.otherDetails,
      enableTracking: resultData.enableTracking,
      quantityInHand: resultData.quantityInHand,
      reorderPointData: resultData.reorderPointData,
      preferredVendorData:
        Object.keys(resultData.preferredVendorData).length !== 0
          ? resultData.preferredVendorData.vendorName
          : 'NA'
    };

    let msg = finalData ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
    return await apiresponse(true, msg, 201, finalData);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

export default {
  editVendorPurchaseReqService,
  getVendorReqListingService,
  viewVendorRequestService,
  downloadVendorPurchaseReceiptService
};
