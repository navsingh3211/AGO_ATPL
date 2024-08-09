/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import mongoose from 'mongoose';
import inventoryDamagedItemMaster from '../models/inventoryDamagedItemMaster.model.js';
import {
  getCategoryNameById,
  getSubcategoryNameById,
  getVendorNameById,
  getUnitNameById,
  getCategoryNameAndIdById,
  getSubcategoryNameAndIdById,
  getImageFullPathById,
  getCategoriesNameByIds,
  getSubCategoryNameByIds,
  getItemNameById,
  getItemNameAndImagesById
} from '../utils/commonFunction.util.js';

import { getStudentNameClassNameByStudentIdClassIdBatchId } from '../utils/helperFunction.util.js';

import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';

const getDamageItemMasterListingService = async (req, res) => {
  const instituteId = req.authData.data.instituteId;

  const issueType = req.query
    ? req.query.issueType
      ? req.query.issueType
      : ''
    : '';
  const orderBy = req.query ? (req.query.orderBy ? req.query.orderBy : '') : '';
  const classId = req.query ? (req.query.classId ? req.query.classId : '') : '';
  const batch = req.query ? (req.query.batch ? req.query.batch : '') : '';
  const itemFrom = req.query
    ? req.query.itemFrom
      ? req.query.itemFrom
      : ''
    : '';

  const staffId = req.query ? (req.query.staffId ? req.query.staffId : '') : '';
  const searchKey = req.query
    ? req.query.searchKey
      ? req.query.searchKey
      : ''
    : '';

  let conditionObj = {
    status: true,
    instituteId: instituteId
  };
  if (issueType) {
    conditionObj.issueType = issueType;
  }
  if (orderBy) {
    conditionObj.damageRaisedByUserType = orderBy;
  }
  if (classId) {
    conditionObj['orderByStudentDetails.class'] = Number(classId);
  }
  if (batch) {
    conditionObj['orderByStudentDetails.batch'] = Number(batch);
  }

  if (itemFrom) {
    conditionObj.itemFrom = itemFrom;
  }

  if (staffId) {
    conditionObj.damageRaisedByUserId = Number(staffId);
  }

  // console.log(conditionObj);
  // process.exit(0);
  try {
    let queryArray = [
      {
        $match: conditionObj
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
        $match: {
          $or: [
            { itemName: { $regex: searchKey, $options: 'i' } } // Search in itemName
          ]
        }
      },
      {
        $project: {
          _id: 1,
          itemMasterId: 1,
          itemKitMasterId: 1,
          itemName: 1,
          itemFrom: 1,
          damagedQuantity: 1,
          damageRaisedByUserId: 1,
          orderByStudentDetails: 1,
          orderByStaffDetails: 1,
          reasonForDamage: 1,
          status: 1,
          updatedAt: 1,
          categoryId: 1,
          subCategoryId: 1,
          fixedVendorId: 1,
          damageRaisedByUserType: 1
          // itemDetails: 1,
          // categoryId: '$itemDetails.categoryId',
          // subCategoryId: '$itemDetails.subCategoryId',
          // fixedVendorId: '$itemDetails.fixedVendorId'
        }
      },
      { $unwind: '$damagedQuantity' },
      {
        $match: {
          'damagedQuantity.status': true // Add the condition for the status field here
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

      let aggregationResult = await inventoryDamagedItemMaster.aggregate(
        queryArray
      );

      let total = aggregationResult[0].total[0]
        ? aggregationResult[0].total[0].count
        : 0;
      let dataListing = aggregationResult[0].data;

      let finalDataListing = [];
      for (let data of dataListing) {
        data.category =
          data.itemFrom === 'ITEM_MASTER'
            ? data.categoryId
              ? await getCategoryNameById(data.categoryId)
              : 'NA'
            : { categoryName: 'Multiple' };

        data.subCategory =
          data.itemFrom === 'ITEM_MASTER'
            ? data.subCategoryId
              ? await getSubcategoryNameById(data.subCategoryId)
              : 'NA'
            : { subCategoryName: 'Multiple' };
        data.vendor =
          data.itemFrom === 'ITEM_MASTER'
            ? data.fixedVendorId
              ? await getVendorNameById(data.fixedVendorId)
              : 'NA'
            : { vendorName: 'Multiple' };
        data.damagedQuantity = {
          damagedQuantity: data.damagedQuantity.quantity,
          reason: data.damagedQuantity.reason,
          size: data.damagedQuantity.size,
          status: data.damagedQuantity.status
        };

        data.studentDetails = null;
        if (
          data.damageRaisedByUserType === 'STUDENT' &&
          data.orderByStudentDetails
        ) {
          let studentDetails =
            await getStudentNameClassNameByStudentIdClassIdBatchId(
              req.header('Authorization'),
              data['damageRaisedByUserId'],
              data.orderByStudentDetails['class'],
              data.orderByStudentDetails['batch']
            );
          data.studentDetails = {
            studentName:
              studentDetails.studentFullName.firstName +
              ' ' +
              studentDetails.studentFullName.lastName,
            className: studentDetails.studentclassName.className,
            batchName: studentDetails.studentBatchName.batchName
          };
        }
        finalDataListing.push(data);
      }

      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
      if (total) {
        let result = {
          rows: finalDataListing,
          total: total
        };
        return await apiresponse(true, msg, 201, result);
      } else {
        return await apiresponse(false, msg, 201, []);
      }
    } else {
      let aggregationResult = await inventoryDamagedItemMaster.aggregate(
        queryArray
      );

      let finalDataListing = [];
      for (let data of aggregationResult) {
        data.category =
          data.itemFrom === 'ITEM_MASTER'
            ? data.categoryId
              ? await getCategoryNameById(data.categoryId)
              : 'NA'
            : { categoryName: 'Multiple' };

        data.subCategory =
          data.itemFrom === 'ITEM_MASTER'
            ? data.subCategoryId
              ? await getSubcategoryNameById(data.subCategoryId)
              : 'NA'
            : { subCategoryName: 'Multiple' };
        data.vendor =
          data.itemFrom === 'ITEM_MASTER'
            ? data.fixedVendorId
              ? await getVendorNameById(data.fixedVendorId)
              : 'NA'
            : { vendorName: 'Multiple' };
        data.damagedQuantityData = {
          damagedQuantity: data.damagedQuantity.quantity,
          reason: data.damagedQuantity.reason,
          size: data.damagedQuantity.size,
          status: data.damagedQuantity.status
        };

        data.studentDetails = null;
        if (
          data.damageRaisedByUserType === 'STUDENT' &&
          data.orderByStudentDetails
        ) {
          let studentDetails =
            await getStudentNameClassNameByStudentIdClassIdBatchId(
              req.header('Authorization'),
              data['damageRaisedByUserId'],
              data.orderByStudentDetails['class'],
              data.orderByStudentDetails['batch']
            );
          data.studentDetails = {
            studentName:
              studentDetails.studentFullName.firstName +
              ' ' +
              studentDetails.studentFullName.lastName,
            className: studentDetails.studentclassName.className,
            batchName: studentDetails.studentBatchName.batchName
          };
        }
        finalDataListing.push(data);
      }

      let msg =
        finalDataListing.length > 0
          ? MESSAGES.DATA_FOUND
          : MESSAGES.NO_DATA_FOUND;

      if (finalDataListing.length) {
        return await apiresponse(true, msg, 201, finalDataListing);
      } else {
        return await apiresponse(false, msg, 201, []);
      }
    }
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const deleteDamageItemService = async (req, res, next) => {
  try {
    const { damageId, size, itemFrom } = req.query;

    if (itemFrom === 'ITEM_MASTER') {
      const damageItemDetails = await inventoryDamagedItemMaster.findOne(
        { _id: damageId, 'damagedQuantity.size': size },
        { _id: 1 }
      );
      if (!damageItemDetails) {
        return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, {});
      }

      let response = await inventoryDamagedItemMaster.updateOne(
        { _id: damageId, 'damagedQuantity.size': size },
        {
          $set: { 'damagedQuantity.$.status': null, updatedAt: new Date() }
        }
      );
    } else if (itemFrom === 'ITEM_KIT') {
      const damageItemDetails = await inventoryDamagedItemMaster.findOne(
        { _id: damageId },
        { _id: 1 }
      );
      if (!damageItemDetails) {
        return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, {});
      }

      await inventoryDamagedItemMaster.updateOne(
        { _id: damageId },
        {
          $set: {
            'damagedQuantity.$[elem].status': null,
            updatedAt: new Date()
          }
        },
        { arrayFilters: [{ 'elem.status': { $exists: true } }] }
      );
    }

    return await apiresponse(
      true,
      MESSAGES.INVENTORY.DAMAGED_MASTER.DELETE_DAMAGE_ITEM,
      201,
      null
    );
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const damageItemxDetailsService = async (req, res) => {
  try {
    let { itemFrom, damageId } = req.params;

    let finaldata;
    if (itemFrom === 'ITEM_MASTER') {
      let damageDetails = await inventoryDamagedItemMaster.findOne(
        {
          _id: damageId
        },
        {
          itemMasterId: 1,
          _id: 0
        }
      );
      // console.log(damageDetails);
      // process.exit(0);
      let damagedMasterDetails;
      if (damageDetails.itemMasterId) {
        damagedMasterDetails = await inventoryDamagedItemMaster.aggregate([
          {
            $match: { _id: new mongoose.Types.ObjectId(damageId) }
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
            $project: {
              itemMasterId: 1,
              damagedQuantity: 1,
              issueType: 1,
              damageRaisedByUserType: 1,
              itemName: 1,
              itemImages: '$itemDetails.itemImages',
              categoryId: '$itemDetails.categoryId',
              subCategoryId: '$itemDetails.subCategoryId',
              itemId: '$itemDetails.itemId',
              fixedVendorId: '$itemDetails.fixedVendorId'
            }
          }
        ]);
      } else {
        damagedMasterDetails = await inventoryDamagedItemMaster.aggregate([
          {
            $match: { _id: new mongoose.Types.ObjectId(damageId) }
          },
          {
            $project: {
              itemMasterId: 1,
              damagedQuantity: 1,
              issueType: 1,
              damageRaisedByUserType: 1,
              itemName: 1,
              itemImages: 1,
              categoryId: 1,
              subCategoryId: 1,
              itemId: 1,
              fixedVendorId: 1
            }
          }
        ]);
      }

      let damageData = damagedMasterDetails[0];
      // console.log(damageData);
      // process.exit(0);
      if (damageData) {
        let imageArr = damageData.itemImages;
        let imgFinalArray = await Promise.all(
          imageArr.map(async (image) => {
            const { documentID, ...rest } = image;
            return {
              path: await getImageFullPathById(documentID),
              ...rest
            };
          })
        );

        finaldata = {
          images: imgFinalArray,
          category: damageData.categoryId
            ? await getCategoryNameAndIdById(damageData.categoryId)
            : 'NA',
          subCategory: damageData.subCategoryId
            ? await getSubcategoryNameAndIdById(damageData.subCategoryId)
            : 'NA',
          damagedQuantity: damageData.damagedQuantity,
          itemId: damageData.itemId,
          itemName: damageData.itemName,
          fixedVendorId: damageData.fixedVendorId
            ? await getVendorNameById(damageData.fixedVendorId)
            : 'NA',
          reasonForDamage: damageData.reasonForDamage
        };
        // console.log(finaldata);
        // process.exit(0);
      } else {
        return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
      }
    } else if (itemFrom === 'ITEM_KIT') {
      let damageMasterDetails = await inventoryDamagedItemMaster.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(damageId) }
        },
        {
          $lookup: {
            from: 'inventoryitemkitmasters',
            localField: 'itemKitMasterId',
            foreignField: '_id',
            as: 'itemKitDetails'
          }
        },
        {
          $unwind: '$itemKitDetails'
        },
        {
          $project: {
            itemMasterId: 1,
            damagedQuantity: 1,
            issueType: 1,
            damageRaisedByUserType: 1,
            reasonForDamage: 1,
            itemName: 1,
            itemKitId: '$itemKitDetails.itemKitId',
            categoryId: '$itemKitDetails.categoryIds',
            subCategoryId: '$itemKitDetails.subCategoryIds',
            itemListingData: '$itemKitDetails.itemListingData'
          }
        }
      ]);
      let damageData = damageMasterDetails[0];

      let itemListingData = await Promise.all(
        damageData.itemListingData.map(async (item) => {
          const itemDetails = await getItemNameAndImagesById(item.itemMasterId);
          const itemMasterName = itemDetails.itemName;
          let imageArr = itemDetails.itemImages;
          let imgFinalArray = await Promise.all(
            imageArr.map(async (image) => {
              const { documentID, isPrimary } = image;
              return {
                path: await getImageFullPathById(documentID),
                isPrimary
              };
            })
          );

          return { ...item, itemMasterName: itemMasterName, imgFinalArray }; // Create a new object with itemMasterName
        })
      );

      if (damageData) {
        finaldata = {
          category: damageData.categoryId
            ? await getCategoriesNameByIds(damageData.categoryId)
            : 'NA',
          subCategory: damageData.subCategoryId
            ? await getSubCategoryNameByIds(damageData.subCategoryId)
            : 'NA',

          itemKitId: damageData.itemKitId,
          itemName: damageData.itemName,
          damagedQuantity: damageData.damagedQuantity,
          itemName: damageData.itemName,
          fixedVendorId: 'NA',
          reasonForDamage: damageData.reasonForDamage,
          itemListingData: itemListingData
        };
      } else {
        return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
      }
      // console.log(orderDetails,'orderDetails');
    }
    const msg = finaldata ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
    return await apiresponse(true, msg, 201, finaldata);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

export default {
  getDamageItemMasterListingService,
  deleteDamageItemService,
  damageItemxDetailsService
};
