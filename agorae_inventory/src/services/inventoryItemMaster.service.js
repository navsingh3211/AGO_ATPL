/* eslint-disable eqeqeq */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line no-unused-vars
import mongoose from 'mongoose';
import inventoryItemMaster from '../models/inventoryItemMaster.model.js';
import inventoryDamagedItemMaster from '../models/inventoryDamagedItemMaster.model.js';
import inventoryItemBulkUploadSheetMaster from '../models/inventoryItemBulkUploadSheetMaster.model.js';
import InventoryCategoryMaster from '../models/InventoryCategoryMaster.model.js';
import inventorySubCategoryMaster from '../models/inventorySubCategoryMaster.model.js';
import inventoryItemSizeMaster from '../models/inventoryItemSizeMaster.model.js';
import InventoryUnitMaster from '../models/inventoryUnitMaster.model.js';
import inventoryVendorMaster from '../models/inventoryVendorMaster.model.js';
import inventoryStoreMaster from '../models/inventoryStoreMaster.model.js';
import inventoryTaxRateMaster from '../models/inventoryTaxRateMaster.model.js';

import {
    getCategoryIdByName,
    getSubCategoryIdByName,
    getUnitIdByName,
    getVendorIdByName,
    getStoreIdByName,
    getTaxIdByName,
    getUnitNameById,
    hasSpecialCharacters
} from '../utils/commonFunction.util.js';
import { awsS3ServerToServerUpload } from '../utils/awsS3Handler.util.js'

import Excel from 'exceljs';
import fs from 'fs';
// import path from 'path';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import moment from 'moment';
import xlsxFile from 'read-excel-file/node';
import jwt from 'jsonwebtoken';

import CONSTANTS from '../utils/constants.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';

const createInventoryNewItemService = async (req, res) => {

    const instituteId = req.authData.data.instituteId;
    const staffId = req.authData.data.staffId;
    try {
        let { isDamaged, damagedQuantity, ...body } = req.body;
        let response;
        let message;
        let highestSellingPrice = body.itemSizes[0].sellingPrice;
        //get item count by same category,subcategory and item name
        const itemName = (body.itemName).trim();
        const getItemCount = await inventoryItemMaster.countDocuments({ instituteId: instituteId, categoryId: body.categoryId, subCategoryId: body.subCategoryId, itemName: itemName });
        body.itemId = body.itemId + '-' + (getItemCount + 1);
        for (let i = 0; i < body.itemSizes; i++) {
            if (body.itemSizes[i].sellingPrice > highestSellingPrice) {
                highestSellingPrice = body.itemSizes[i].sellingPrice
            }
        }
        if (isDamaged) {

            //moving data in damage master
            const dataToInsert = {
                instituteId,
                damageRaisedByUserId: staffId,
                damagedQuantity:damagedQuantity,
                ...body
            };
            await inventoryDamagedItemMaster.create(dataToInsert);

            let {itemSizes,...bodyForMaster} = body;
            let itemSizesMaster = itemSizes;
            let damagedQuantityForMaster=damagedQuantity;
            damagedQuantityForMaster.forEach(element => {
                itemSizesMaster = itemSizesMaster.map(item => {
                    if (item.size === element.size) {
                      // If the size matches, update the quantity
                      return {
                        ...item,
                        itemQuantity: {
                          ...item.itemQuantity,
                          quantity: item.itemQuantity.quantity - element.quantity
                        }
                      };
                    }
                    return item;
                  });
            });
            
            //creating remaining data in damage master
            response = await inventoryItemMaster.create({ instituteId, ...bodyForMaster,itemSizes:itemSizesMaster, highestSellingPrice: highestSellingPrice });

            message = MESSAGES.INVENTORY.ITEM_MASTER.ITEM_MOVED_TO_DAMAGE_MASTER;
        } else {
            response = await inventoryItemMaster.create({ instituteId, ...body, highestSellingPrice: highestSellingPrice });

            /* updating the isAlreadyUsed from item size master */
            if(response){
                const itemSizeDetails = await inventoryItemSizeMaster.findOne({categoryId:body.categoryId,subCategoryId:body.subCategoryId},{_id:1});
                const itemSizeId = itemSizeDetails._id;
                await inventoryItemSizeMaster.updateOne(
                    { _id: itemSizeId },
                    {
                        $set: { isAlreadyUsed: true, updatedAt: new Date() }
                    }
                );
            }      
            message = MESSAGES.INVENTORY.ITEM_MASTER.ITEM_ADDED_TO_ITEM_MASTER;
        }
        return await apiresponse(true, message, 201, response);

    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const editInventoryNewItemService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    const staffId = req.authData.data.staffId;

    try {
        let { _baseItemId, ...body } = req.body;
        const itemDetails = await inventoryItemMaster.findOne({ _id: _baseItemId }, { _id: 1 });
        if (!itemDetails) {
            return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, []);
        }
        let highestSellingPrice = body.itemSizes[0].sellingPrice;
        for (let i = 0; i < body.itemSizes; i++) {
            if (body.itemSizes[i].sellingPrice > highestSellingPrice) {
                highestSellingPrice = body.itemSizes[i].sellingPrice
            }
        }
        let response = await inventoryItemMaster.updateOne(
            { _id: _baseItemId },
            {
                $set: {
                    instituteId,
                    ...body,
                    highestSellingPrice : highestSellingPrice,
                    editedAt: new Date()
                }
            }
        );
        let message = MESSAGES.INVENTORY.ITEM_MASTER.ITEM_EDITED_SUCCESS
        return await apiresponse(true, message, 201, itemDetails);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const deleteInventoryNewItemService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;

    try {
        let { itemId } = req.params;

        const dataByGivenId = await inventoryItemMaster.findOne({ _id: itemId,status:true, instituteId: instituteId }, { _id: 1,categoryId:1,subCategoryId:1 });
        if (!dataByGivenId) {
            return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
        }

        let response = await inventoryItemMaster.updateOne(
            { _id: itemId },
            {
                $set: { status: null, updatedAt: new Date() }
            }
        );

        /* start --> updating the isAlreadyUsed from item size master */
        const itemSizeDetails = await inventoryItemSizeMaster.findOne({categoryId:dataByGivenId.categoryId,subCategoryId:dataByGivenId.subCategoryId},{_id:1});
        const itemSizeId = itemSizeDetails._id;
        
        await inventoryItemSizeMaster.updateOne(
            { _id: itemSizeId },
            {
                $set: { isAlreadyUsed: false, updatedAt: new Date() }
            }
        );
        /* end <-- updating the isAlreadyUsed from item size master */

        return await apiresponse(true, MESSAGES.INVENTORY.ITEM_MASTER.ITEM_DELETED, 201, response);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const getItemDetailsByIdService = async (req, res) => {
    const userTypeId = req.authData.data.userTypeId;
    try {
        let { itemId } = req.params;

        let dataByGivenId = await inventoryItemMaster.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(itemId) }
            },
            {
                $lookup: {
                    from: 'inventorydocumentmasters',
                    localField: 'itemImages.documentID',
                    foreignField: '_id',
                    as: 'itemImagesDoc'
                }
            },
            {
                $addFields: {
                    itemImages: {
                        $map: {
                            input: '$itemImages',
                            as: 'img',
                            in: {
                                documentID: '$$img.documentID',
                                isPrimary: '$$img.isPrimary',
                                documentDetails: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$itemImagesDoc',
                                                as: 'doc',
                                                cond: { $eq: ['$$doc._id', '$$img.documentID'] }
                                            }
                                        },
                                        0
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            {
                $unset: 'itemImagesDoc' // Remove the 'itemImagesDoc' field
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
                $lookup: {
                    from: 'inventoryunitmasters',
                    localField: 'itemQuantity.unit',
                    foreignField: '_id',
                    as: 'itemQuantity.unit'
                }
            },
            {
                $unwind: {
                    path: '$itemQuantity.unit',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'itemQuantity.unit': {
                        $ifNull: ['$itemQuantity.unit', {}]
                    }
                }
            },
            {
                $lookup: {
                    from: 'inventorystoremasters',
                    localField: 'store',
                    foreignField: '_id',
                    as: 'itemStore'
                }
            },
            {
                $unwind: {
                    path: '$itemStore',
                    preserveNullAndEmptyArrays: true // Preserve documents without matches
                }
            },
            {
                $addFields: {
                    itemStore: {
                        $ifNull: ['$itemStore', {}] // Replace null values with an empty object
                    }
                }
            },
            {
                $lookup: {
                    from: 'inventoryunitmasters',
                    localField: 'weightData.unit',
                    foreignField: '_id',
                    as: 'weightData.unit'
                }
            },
            {
                $unwind: {
                    path: '$weightData.unit',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'weightData.unit': {
                        $ifNull: ['$weightData.unit', {}]
                    }
                }
            },
            {
                $lookup: {
                    from: 'inventorytaxratemasters',
                    localField: 'taxRate',
                    foreignField: '_id',
                    as: 'taxRate'
                }
            },
            {
                $unwind: {
                    path: '$taxRate',
                    preserveNullAndEmptyArrays: true // Preserve documents without matches
                }
            },
            {
                $addFields: {
                    'taxRate': {
                        $ifNull: ['$taxRate', {
                            _id: null,
                            percentage: 0
                        }]
                    }
                }
            },
            {
                $lookup: {
                    from: 'inventoryunitmasters',
                    localField: 'quantityInHand.unit',
                    foreignField: '_id',
                    as: 'quantityInHand.unit'
                }
            },
            {
                $unwind: {
                    path: '$quantityInHand.unit',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'quantityInHand.unit': {
                        $ifNull: ['$quantityInHand.unit', {}]
                    }
                }
            },
            {
                $lookup: {
                    from: 'inventoryunitmasters',
                    localField: 'reorderPointData.unit',
                    foreignField: '_id',
                    as: 'reorderPointData.unit'
                }
            },
            {
                $unwind: {
                    path: '$reorderPointData.unit',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'reorderPointData.unit': {
                        $ifNull: ['$reorderPointData.unit', {}]
                    }
                }
            },
            {
                $lookup: {
                    from: 'inventoryvendormasters',
                    localField: 'preferredVendor',
                    foreignField: '_id',
                    as: 'preferredVendorMaster'
                }
            },
            {
                $unwind: {
                    path: '$preferredVendorMaster',
                    preserveNullAndEmptyArrays: true // Preserve documents without matches
                }
            },
            {
                $addFields: {
                    preferredVendorMaster: {
                        $ifNull: ['$preferredVendorMaster', {}] // Replace null values with an empty object
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    itemImages: {
                        $map: {
                            input: '$itemImages',
                            as: 'img',
                            in: {
                                documentID: '$$img.documentID',
                                isPrimary: '$$img.isPrimary',
                                fullPath: {
                                    $ifNull: ['$$img.documentDetails.fullPath', null] // Check if fullPath exists
                                },
                                size: {
                                    $ifNull: ['$$img.documentDetails.size', null] // Check if fullPath exists
                                },
                            }
                        }
                    },
                    itemId: 1,
                    itemName: 1,
                    itemAvailableTo: 1,
                    priceApplicableToStaff: 1,
                    exchangeableItemFor: 1,
                    exchangePeriodForStudent: 1,
                    exchangePeriodForStaff: 1,
                    pickupPeriodForStaff: 1,
                    itemSizes: 1,
                    weightData: {
                        weight: '$weightData.weight',
                        unitName: {
                            $ifNull: ['$weightData.unit.unitName', null] // Check if weightData.unit.name exists
                        },
                        unitId: {
                            $ifNull: ['$weightData.unit._id', null] // Check if weightData.unit.name exists
                        }
                    },
                    materialType: 1,
                    otherDetails: 1,
                    taxRate: 1,
                    enableTracking: 1,
                    quantityInHand: {
                        quantityInHand: '$quantityInHand.quantityInHand',
                        unitName: {
                            $ifNull: ['$quantityInHand.unit.unitName', null] // Check if quantityInHand.unit.name exists
                        },
                        unitId: {
                            $ifNull: ['$quantityInHand.unit._id', null] // Check if quantityInHand.unit.name exists
                        }
                    },
                    reorderPointData: {
                        reorderPoint: '$reorderPointData.reorderPoint',
                        unitName: {
                            $ifNull: ['$reorderPointData.unit.unitName', null] // Check if reorderPointData.unit.name exists
                        },
                        unitId: {
                            $ifNull: ['$reorderPointData.unit._id', null] // Check if reorderPointData.unit.name exists
                        }
                    },
                    itemTransferStatus: 1,
                    dateOfPurchase: 1,
                    category: {
                        categoryName: {
                            $ifNull: ['$Category.categoryName', null]
                        },
                        categoryId: '$categoryId'
                    },
                    subCategory: {
                        subCategoryName: {
                            $ifNull: ['$SubCategory.subCategoryName', null]
                        },
                        subCategoryId: '$subCategoryId'
                    },
                    fixVendor: {
                        fixVendorName: {
                            $ifNull: ['$fixVendorMaster.contactPersonName', null]
                        },
                        fixVendorId: '$fixedVendorId'

                    },
                    store: {
                        storeName: {
                            $ifNull: ['$itemStore.storeName', null]
                        },
                        storeId: '$store'
                    },
                    preferredVendor: {
                        preferredVendorName: {
                            $ifNull: ['$preferredVendorMaster.contactPersonName', null]
                        },
                        preferredVendorId: '$preferredVendor'
                    },
                    donationStockDetails: {
                        donorName: {
                            $ifNull: ['$donationStockDetails.donorName', 'NA']
                        },
                        donationNote: {
                            $ifNull: ['$donationStockDetails.donationNote', 'NA']
                        }
                    },
                    itemType: 1,
                    pickupPeriodForStudent: 1
                }
            }
        ]);

        let resultData = dataByGivenId[0];
        // if(resultData && resultData.itemSizes.length>0 ){
        //     resultData.itemSizes = await Promise.all(resultData.itemSizes.map(async(itemSize)=>{
        //         itemSize.itemQuantity.unit= await getUnitNameById(itemSize.itemQuantity.unit);
        //         return itemSize;
        //     }));
        // }
        if (dataByGivenId.length < 1) {
            return await apiresponse(true, MESSAGES.NO_DATA_FOUND, 201, []);
        }

        //Updating the view count when any staff or student open the card
        if (userTypeId === 3 || userTypeId === 4) {
            await inventoryItemMaster.updateOne(
                { _id: itemId },
                {
                    $inc: {
                        itemViewCount: 1, // Increment by 1, you can specify a different value
                    },
                    $set: {
                        updatedAt: new Date(),
                    },
                }
            );
        }
        return await apiresponse(true, MESSAGES.DATA_FOUND, 201, resultData);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const getItemListingService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    const sortBy = req.query.sortBy;
    const orderBy = req.query.orderBy;
    let sortOrder = {};
    if (sortBy && orderBy) {
        sortOrder[`${sortBy}`] = orderBy === 'asc' ? 1 : -1;
    } else {
        sortOrder['createdAt'] = -1;
    }

    const categoryId = req.query
        ? req.query.categoryId
            ? req.query.categoryId
            : ''
        : '';
    const subCatId = req.query
        ? req.query.subCatId
            ? req.query.subCatId
            : ''
        : '';

    const itemTransferStatus = req.query
        ? req.query.itemTransferStatus
            ? req.query.itemTransferStatus
            : ''
        : '';
    const itemAvaliableTo = req.query
    ? req.query.itemAvaliableTo
        ? req.query.itemAvaliableTo
        : ''
    : '';

    //Creating condition for search for feild Category,Sub-category,item Id and Vendor name
    const searchKeyWord = req.query
        ? req.query.searchKey
            ? req.query.searchKey
            : ''
        : '';
    /* Checking for special charater in serch keyword*/
    if (searchKeyWord && hasSpecialCharacters(searchKeyWord)) {
        return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 401, '');
    }

    let conditionObj = { status: true, instituteId: instituteId };
    if (categoryId) {
        conditionObj.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (subCatId) {
        conditionObj.subCategoryId = new mongoose.Types.ObjectId(subCatId);
    }
    if (itemTransferStatus) {
        conditionObj.itemTransferStatus = itemTransferStatus;
    }

    if(itemAvaliableTo){
        conditionObj.$or = [
            {itemAvailableTo:itemAvaliableTo},
            {itemAvailableTo:'all'}
        ]
    }
    try {
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
                $lookup: {
                    from: 'inventoryunitmasters',
                    localField: 'itemSizes.itemQuantity.unit',
                    foreignField: '_id',
                    as: 'UnitData'
                }
            },
            {
                $unwind: {
                    path: '$UnitData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'UnitData': {
                        $ifNull: ['$UnitData', {}]
                    }
                }
            },
            {
                $addFields: {
                    categoryName: {
                        $ifNull: ['$Category.categoryName', null]
                    },
                    subCategoryName: {
                        $ifNull: ['$SubCategory.subCategoryName', null]
                    },
                    fixVendorName: {
                        $cond: {
                            if: { $ne: ['$fixVendorMaster', {}] },
                            then: '$fixVendorMaster.vendorName',
                            else: 'NA'
                        }
                    }
                }
            },
            {
                $match: {
                    $or: [
                        { 'categoryName': { $regex: searchKeyWord, $options: 'i' } }, // Search in category names
                        { 'subCategoryName': { $regex: searchKeyWord, $options: 'i' } }, // Search in SubCategory name
                        { 'fixVendorName': { $regex: searchKeyWord, $options: 'i' } },// Search in vendorName
                        { 'itemName': { $regex: searchKeyWord, $options: 'i' } },// Search in itemName
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    categoryName: 1,
                    subCategoryName: 1,
                    fixVendorName: 1,
                    itemId: 1,
                    itemName: 1,
                    materialType: 1,
                    otherDetails: 1,
                    enableTracking: 1,
                    itemTransferStatus: 1,
                    dateOfPurchase: 1,
                    itemViewCount: 1,
                    itemSizes: 1,
                    unitName:'$UnitData.unitName',
                    isAlreadyUsed:1,
                    priceApplicableToStaff:1,
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

            let aggregationResult = await inventoryItemMaster.aggregate(queryArray);
           
            let total = aggregationResult[0].total[0] ? aggregationResult[0].total[0].count : 0;
            let dataListing = aggregationResult[0].data;

            let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
            let result = {
                rows: dataListing,
                total: total,
            };
            return await apiresponse(true, msg, 201, result);
        } else {
            let dataByGivenId = await inventoryItemMaster.aggregate(queryArray);

            let msg = dataByGivenId.length ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
            return await apiresponse(true, msg, 201, dataByGivenId);
        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

//Bulk upload by xlsx sheet 
const generateInventoryItemMasterTemplateForSheetInBulkUploadService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;

    try {
        let { categoryId, noOfItems } = req.body;
        let response = await inventoryItemBulkUploadSheetMaster.create({ instituteId, categoryId: categoryId, noOfItems: noOfItems });
        return await apiresponse(true, MESSAGES.INVENTORY.ITEM_MASTER.GENERATE_EMPTY_SHEET, 201, response);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const downloadItemSheetTemplateForBulkUploadService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;

    try {
        const { itemId } = req.params;

        let templateDetails = await inventoryItemBulkUploadSheetMaster.findOne({
            _id: itemId
        })
            .select('-__v -_id')
            .populate({
                path: 'categoryId',
                select: '_id categoryName',
            });

        if (Object.keys(templateDetails).length === 0) {
            return await apiresponse(true, MESSAGES.INVENTORY.ITEM_MASTER.NO_TEMPLATE_FOUND, 201, null);
        }

        // category listing
        const categoryListing = await InventoryCategoryMaster.find(
            {
                status: true,
                $or: [
                    { instituteId: instituteId },
                    { instituteId: null }
                ]
            },
            {
                _id: 0,
                categoryName: 1
            }
        );

        //subcategory listing 
        const subCategoryListing = await inventorySubCategoryMaster.find({
            status: true,
            instituteId: instituteId
        }, { _id: 0, subCategoryName: 1 });

        //sizelisting
        const sizeListing = await inventoryItemSizeMaster.find(
            {
                instituteId: instituteId,
                status: true
            },
            { itemSize: 1, _id: 0 }
        );

        let mergedItemSize = sizeListing.reduce((merged, current) => {
            return merged.concat(current.itemSize);
        }, []);
        const mergedItemSizeListing = [...new Set(mergedItemSize)];
        const itemSizeListing = mergedItemSizeListing.map((itemSize) => {
            return { itemSize };
        });

        //unit listing
        const unitListing = await InventoryUnitMaster.find({
            status: true,
            $or: [{ instituteId: instituteId }, { instituteId: null }]
        }, { _id: 0, unitName: 1 });

        //vendorlisting
        const vendorListing = await inventoryVendorMaster.find({
            instituteId: instituteId, status: true
        }, { _id: 0, vendorName: 1 });

        const storeListing = await inventoryStoreMaster.find({
            instituteId: instituteId, status: true
        }, { _id: 0, storeName: 1 });

        const taxListing = await inventoryTaxRateMaster.find({
            status: true
        }, { _id: 0, percentage: 1 });

        const itemAvailableTo = [{ itemAvailableTo: 'all' }, { itemAvailableTo: 'student' }, { itemAvailableTo: 'staff' }];

        const priceApplicableToStaff = [{ priceApplicableToStaff: true }, { priceApplicableToStaff: false }];

        const exchangeableItemFor = [{ exchangeableItemFor: 'all' }, { exchangeableItemFor: 'student' }, { exchangeableItemFor: 'staff' }, { exchangeableItemFor: 'none' }];

        const exchangePeriodForStudent = [{ exchangePeriodForStudent: 1 }, { exchangePeriodForStudent: 2 }, { exchangePeriodForStudent: 3 }, { exchangePeriodForStudent: 4 }, { exchangePeriodForStudent: 5 }, { exchangePeriodForStudent: 6 }, { exchangePeriodForStudent: 7 }];
        const exchangePeriodForStaff = [{ exchangePeriodForStaff: 1 }, { exchangePeriodForStaff: 2 }, { exchangePeriodForStaff: 3 }, { exchangePeriodForStaff: 4 }, { exchangePeriodForStaff: 5 }, { exchangePeriodForStaff: 6 }, { exchangePeriodForStaff: 7 }];

        const pickupPeriodForStaff = [{ pickupPeriodForStaff: 1 }, { pickupPeriodForStaff: 2 }, { pickupPeriodForStaff: 3 }, { pickupPeriodForStaff: 4 }, { pickupPeriodForStaff: 5 }, { pickupPeriodForStaff: 6 }, { pickupPeriodForStaff: 7 }];
        const pickupPeriodForStudent = [{ pickupPeriodForStudent: 1 }, { pickupPeriodForStudent: 2 }, { pickupPeriodForStudent: 3 }, { pickupPeriodForStudent: 4 }, { pickupPeriodForStudent: 5 }, { pickupPeriodForStudent: 6 }, { pickupPeriodForStudent: 7 }];
        const enableTracking = [{ enableTracking: true }, { enableTracking: false }];

        // Create Excel workbook and worksheet
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Main Form');
        const categorySheet = workbook.addWorksheet('categoryName');
        const subCategorySheet = workbook.addWorksheet('subCategoryName');
        const itemSizeSheet = workbook.addWorksheet('itemSize');
        const unitSheet = workbook.addWorksheet('unitName');
        const vendorSheet = workbook.addWorksheet('vendorName');
        const storeSheet = workbook.addWorksheet('storeName');
        const taxSheet = workbook.addWorksheet('percentage');
        const itemAvailableToSheet = workbook.addWorksheet('itemAvailableTo');
        const priceApplicableToStaffSheet = workbook.addWorksheet('priceApplicableToStaff');
        const exchangeableItemForSheet = workbook.addWorksheet('exchangeableItemFor');
        const exchangePeriodForStudentSheet = workbook.addWorksheet('exchangePeriodForStudent');
        const exchangePeriodForStaffSheet = workbook.addWorksheet('exchangePeriodForStaff');
        const pickupPeriodForStaffSheet = workbook.addWorksheet('pickupPeriodForStaff');
        const pickupPeriodForStudentSheet = workbook.addWorksheet('pickupPeriodForStudent');

        const enableTrackingSheet = workbook.addWorksheet('enableTracking');

        // Header Title
        let headerTitles = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Category*', key: 'categoryName', width: 20 },
            { header: 'SubCategory*', key: 'subCategoryName', width: 20 },
            { header: 'Vendor*', key: 'vendorName', width: 20 },
            { header: 'Date Of Purchase*', key: 'dateOfPurchase', width: 20 },

            { header: 'Item Id', key: 'itemId', width: 20 },

            { header: 'Quantity*', key: 'itemQuantity', width: 20 },
            { header: 'Item Unit', key: 'unitName', width: 20 },

            { header: 'Store', key: 'storeName', width: 20 },

            { header: 'Item Name*', key: 'itemName', width: 20 },

            { header: 'Item Available To*', key: 'itemAvailableTo', width: 20 },

            { header: 'Price Applicable To Staff*', key: 'priceApplicableToStaff', width: 20 },

            { header: 'Item Exchange Avaliable For*', key: 'exchangeableItemFor', width: 20 },

            { header: 'Exchange Period For Student*', key: 'exchangePeriodForStudent', width: 20 },

            { header: 'Exchange Period For Staff*', key: 'exchangePeriodForStaff', width: 20 },

            { header: 'Pickup Period For Staff*', key: 'pickupPeriodForStaff', width: 20 },
            { header: 'Pickup Period For Student*', key: 'pickupPeriodForStudent', width: 20 },

            { header: 'Size(Age/class-wise)*', key: 'itemSize', width: 20 },

            { header: 'Weight', key: 'weightData', width: 20 },

            { header: 'Weight Unit', key: 'unitName', width: 20 },

            { header: 'Material', key: 'materialType', width: 20 },

            { header: 'Other Details', key: 'otherDetails', width: 20 },

            { header: 'Cost Price(incl. of GST)*', key: 'costPrice', width: 30 },

            { header: 'Selling Price*', key: 'sellingPrice', width: 20 },

            { header: 'Tax Rate(%)', key: 'taxRate', width: 20 },

            { header: 'Total Selling Price(incl. of GST)', key: 'totalSellingPrice', width: 30 },

            { header: 'Enable tracking for this item*', key: 'enableTracking', width: 30 },

            { header: 'Quantity in hand', key: 'quantityInHand', width: 20 },
            { header: 'Quantity Unit', key: 'unitName', width: 20 },

            { header: 'Reorder Point', key: 'reorderPointData', width: 20 },
            { header: 'Reorder Unit', key: 'unitName', width: 20 },


            { header: 'Prefered Vandor', key: 'preferredVendor', width: 20 }
        ];

        // Define columns in the worksheet, these columns are identified using a key.
        worksheet.columns = headerTitles;
        categorySheet.columns = [{ header: 'Category', key: 'categoryName', width: 25 }];
        subCategorySheet.columns = [{ header: 'SubCategory', key: 'subCategoryName', width: 20 }];
        itemSizeSheet.columns = [{ header: 'ItemSize', key: 'itemSize', width: 20 }];
        unitSheet.columns = [{ header: 'Unit', key: 'unitName', width: 20 }];
        vendorSheet.columns = [{ header: 'Vendor', key: 'VendorName', width: 25 }];
        storeSheet.columns = [{ header: 'Store', key: 'storeName', width: 25 }];
        taxSheet.columns = [{ header: 'Tax Rate(%)', key: 'percentage', width: 25 }];
        itemAvailableToSheet.columns = [{ header: 'Item Available To*', key: 'itemAvailableTo', width: 30 }];
        priceApplicableToStaffSheet.columns = [{ header: 'Price Applicable To Staff*', key: 'priceApplicableToStaff', width: 30 }];
        exchangeableItemForSheet.columns = [{ header: 'Item Exchange Avaliable For*', key: 'exchangeableItemFor', width: 30 }];
        exchangePeriodForStudentSheet.columns = [{ header: 'Exchange Period For Student*', key: 'exchangePeriodForStudent', width: 30 }];
        exchangePeriodForStaffSheet.columns = [{ header: 'Exchange Period For Staff*', key: 'exchangePeriodForStaff', width: 30 }];
        pickupPeriodForStaffSheet.columns = [{ header: 'Pickup Period For Staff*', key: 'pickupPeriodForStaff', width: 30 }];
        pickupPeriodForStudentSheet.columns = [{ header: 'Pickup Period For Student*', key: 'pickupPeriodForStudent', width: 30 }];

        enableTrackingSheet.columns = [{ header: 'Enable tracking for this item*', key: 'enableTracking', width: 30 }];


        let results = [];
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            let rowData = {
                no: i
            };
            results.push(rowData);
        }

        results.forEach((row) => {
            worksheet.addRow(row);
        });

        let categoryNames = categoryListing.map((item) => item.categoryName);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            categoryNames.forEach((categoryName) => {
                categorySheet.addRow({ categoryName });
            });
        }

        let subCategoryNames = subCategoryListing.map((item) => item.subCategoryName);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            subCategoryNames.forEach((subCategoryName) => {
                subCategorySheet.addRow({ subCategoryName });
            });
        }

        let itemSizeNames = itemSizeListing.map((item) => item.itemSize);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            itemSizeNames.forEach((itemSize) => {
                itemSizeSheet.addRow({ itemSize });
            });
        }

        let unitListNames = unitListing.map((item) => item.unitName);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            unitListNames.forEach((unitName) => {
                unitSheet.addRow({ unitName });
            });
        }

        let vendorNames = vendorListing.map((item) => item.vendorName);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            vendorNames.forEach((VendorName) => {
                vendorSheet.addRow({ VendorName });
            });
        }

        let storeNames = storeListing.map((item) => item.storeName);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            storeNames.forEach((storeName) => {
                storeSheet.addRow({ storeName });
            });
        }

        let taxNames = taxListing.map((item) => item.percentage);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            taxNames.forEach((percentage) => {
                taxSheet.addRow({ percentage });
            });
        }

        let itemAvailableToType = itemAvailableTo.map((item) => item.itemAvailableTo);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            itemAvailableToType.forEach((itemAvailableTo) => {
                itemAvailableToSheet.addRow({ itemAvailableTo });
            });
        }

        let priceApplicableToStaffToType = priceApplicableToStaff.map((item) => item.priceApplicableToStaff);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            priceApplicableToStaffToType.forEach((priceApplicableToStaff) => {
                priceApplicableToStaffSheet.addRow({ priceApplicableToStaff });
            });
        }

        let exchangeableItemForType = exchangeableItemFor.map((item) => item.exchangeableItemFor);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            exchangeableItemForType.forEach((exchangeableItemFor) => {
                exchangeableItemForSheet.addRow({ exchangeableItemFor });
            });
        }

        let exchangePeriodForStudentType = exchangePeriodForStudent.map((item) => item.exchangePeriodForStudent);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            exchangePeriodForStudentType.forEach((exchangePeriodForStudent) => {
                exchangePeriodForStudentSheet.addRow({ exchangePeriodForStudent });
            });
        }

        let exchangePeriodForStaffType = exchangePeriodForStaff.map((item) => item.exchangePeriodForStaff);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            exchangePeriodForStaffType.forEach((exchangePeriodForStaff) => {
                exchangePeriodForStaffSheet.addRow({ exchangePeriodForStaff });
            });
        }

        let pickupPeriodForStaffType = pickupPeriodForStaff.map((item) => item.pickupPeriodForStaff);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            pickupPeriodForStaffType.forEach((pickupPeriodForStaff) => {
                pickupPeriodForStaffSheet.addRow({ pickupPeriodForStaff });
            });
        }

        let pickupPeriodForStudentType = pickupPeriodForStudent.map((item) => item.pickupPeriodForStudent);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            pickupPeriodForStudentType.forEach((pickupPeriodForStudent) => {
                pickupPeriodForStudentSheet.addRow({ pickupPeriodForStudent });
            });
        }

        let enableTrackingType = enableTracking.map((item) => item.enableTracking);
        for (let i = 1; i <= templateDetails.noOfItems; i++) {
            enableTrackingType.forEach((enableTracking) => {
                enableTrackingSheet.addRow({ enableTracking });
            });
        }

        // File name & Path
        const __filename = fileURLToPath(import.meta.url);
        const __dirnamee = dirname(__filename);
        let fileName = `ITEM_MASTER_FORM_${moment().format('YYYY_MM_DD_HH_mm_ss')}.xlsx`;
        const directoryPath = join(__dirnamee, '../../tempFIles');

        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        let filePath = join(directoryPath, `/${fileName}`);

        for (let i = 2; i <= parseInt(templateDetails.noOfItems + 1); i++) {
            worksheet.getCell('B' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: true,
                errorStyle: 'stop',
                errorTitle: 'Please Select Category',
                error: 'Please select a valid Category from the list',
                formulae: ['categoryName!A2:A' + (categoryListing.length + 1)],
            };
            worksheet.getCell('C' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: true,
                errorStyle: 'stop',
                errorTitle: 'Please Select Subcategory',
                error: 'Please select a valid Subcategory from the list',
                formulae: ['subCategoryName!A2:A' + (subCategoryListing.length + 1)],
            };
            worksheet.getCell('D' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                // errorStyle: 'stop',
                // errorTitle: 'Please Select Subcategory',
                // error: 'Please select a valid Subcategory from the list',
                formulae: ['vendorName!A2:A' + (vendorListing.length + 1)],
            };

            worksheet.getCell('E' + i).note = 'YYYY-MM-DD';

            worksheet.getCell('H' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['unitName!A2:A' + (unitListing.length + 1)],
            };

            worksheet.getCell('I' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['storeName!A2:A' + (storeListing.length + 1)],
            };

            worksheet.getCell('K' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['itemAvailableTo!A2:A' + (itemAvailableTo.length + 1)],
            };

            worksheet.getCell('L' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['priceApplicableToStaff!A2:A' + (priceApplicableToStaff.length + 1)],
            };

            worksheet.getCell('M' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['exchangeableItemFor!A2:A' + (exchangeableItemFor.length + 1)],
            };

            worksheet.getCell('N' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['exchangePeriodForStudent!A2:A' + (exchangePeriodForStudent.length + 1)],
            };

            worksheet.getCell('O' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['exchangePeriodForStaff!A2:A' + (exchangePeriodForStaff.length + 1)],
            };

            worksheet.getCell('P' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['pickupPeriodForStaff!A2:A' + (pickupPeriodForStaff.length + 1)],
            };

            worksheet.getCell('Q' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['pickupPeriodForStudent!A2:A' + (pickupPeriodForStudent.length + 1)],
            };

            worksheet.getCell('R' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['itemSize!A2:A' + (itemSizeListing.length + 1)],
            };

            worksheet.getCell('T' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['unitName!A2:A' + (unitListing.length + 1)],
            };

            // worksheet.getCell('S' + i).dataValidation = {
            //     type: 'list',
            //     allowBlank: true,
            //     showErrorMessage: false,
            //     formulae: ['unitName!A2:A' + (unitListing.length + 1)],
            // };

            worksheet.getCell('Y' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['percentage!A2:A' + (taxListing.length + 1)],
            };

            worksheet.getCell('AA' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['enableTracking!A2:A' + (enableTracking.length + 1)],
            };

            worksheet.getCell('AC' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['unitName!A2:A' + (unitListing.length + 1)],
            };

            worksheet.getCell('AE' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['unitName!A2:A' + (unitListing.length + 1)],
            };

            worksheet.getCell('AF' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['VendorName!A2:A' + (vendorListing.length + 1)],
            };
        }

        // Finally save the worksheet into the folder from where we are running the code.
        await workbook.xlsx.writeFile(filePath);

        // Download file direct
        res.download(filePath, fileName);

        // Remove file from directory
        setTimeout(function () {
            fs.unlinkSync(filePath);
        }, 1000);

    } catch (error) {
        console.log(error);
    }
}

const validationOfitemAddedByExcelService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;

    try {
        let { uploadId } = req.body;
        let templateDetails = await inventoryItemBulkUploadSheetMaster.findOne({
            _id: uploadId
        });
        if (Object.keys(templateDetails).length === 0) {
            return await apiresponse(true, MESSAGES.INVENTORY.ITEM_MASTER.NO_TEMPLATE_FOUND, 201, null);
        }

        if (req.files.itemMasterExcel && req.files.itemMasterExcel.length > 0) {
            let itemMasterExcel = req.files.itemMasterExcel[0];
            let filePath = join(itemMasterExcel.destination, itemMasterExcel.originalname);
            // Parse a file
            const rows = await xlsxFile(filePath);
            if (rows && rows.length > 0) {
                if (templateDetails.noOfItems !== rows.length - 1) {
                    return await apiresponse(false, MESSAGES.INVENTORY.ITEM_MASTER.ROW_MISMATCH, 201, null);
                }

                if (rows.length - 1 > CONSTANTS.BULK_UPLOAD_MAX_ENQUIRY_FORM) {
                    return await apiresponse(false, CONSTANTS.MAX_LIMIT_EXCEEDED + CONSTANTS.BULK_UPLOAD_MAX_ENQUIRY_FORM, 201, null);
                }

                let key = rows[0];
                // console.log(key);
                // process.exit(0);

                let itemMasterData = [];

                // header validation
                if (key[0] != 'No' ||
                    key[1] != 'Category*' ||
                    key[2] != 'SubCategory*' ||
                    key[3] != 'Vendor*' ||
                    key[4] != 'Date Of Purchase*' ||
                    key[5] != 'Item Id' ||
                    key[6] != 'Quantity*' ||
                    key[7] != 'Item Unit' ||
                    key[8] != 'Store' ||
                    key[9] != 'Item Name*' ||
                    key[10] != 'Item Available To*' ||
                    key[11] != 'Price Applicable To Staff*' ||
                    key[12] != 'Item Exchange Avaliable For*' ||
                    key[13] != 'Exchange Period For Student*' ||
                    key[14] != 'Exchange Period For Staff*' ||
                    key[15] != 'Pickup Period For Staff*' ||
                    key[16] != 'Pickup Period For Student*' ||
                    key[17] != 'Size(Age/class-wise)*' ||
                    key[18] != 'Weight' ||
                    key[19] != 'Weight Unit' ||
                    key[20] != 'Material' ||
                    key[21] != 'Other Details' ||
                    key[22] != 'Cost Price(incl. of GST)*' ||
                    key[23] != 'Selling Price*' ||
                    key[24] != 'Tax Rate(%)' ||
                    key[25] != 'Total Selling Price(incl. of GST)' ||
                    key[26] != 'Enable tracking for this item*' ||
                    key[27] != 'Quantity in hand' ||
                    key[28] != 'Quantity Unit' ||
                    key[29] != 'Reorder Point' ||
                    key[30] != 'Reorder Unit' ||
                    key[31] != 'Prefered Vandor') {
                    return await apiresponse(false, MESSAGES.INVENTORY.ITEM_MASTER.INVALID_FILE, 201, null);
                }

                for (let i = 1; i < rows.length; i++) {
                    let element = rows[i];
                    let enquiryFormObj = {};

                    for (let j = 0; j < element.length; j++) {
                        enquiryFormObj[key[j]] = element[j];
                    }
                    itemMasterData.push(enquiryFormObj);
                }

                // console.log(itemMasterData);
                // process.exit(0);
                if (itemMasterData && itemMasterData.length > 0) {

                    let errors = [];
                    for (let element of itemMasterData) {
                        let categoryName = element['Category*'];
                        let subCategoryName = element['SubCategory*'];
                        let vendorName = element['Vendor*'];
                        let dateOfPurchase = element['Date Of Purchase*'];
                        let Quantity = element['Quantity*'];
                        let itemName = element['Item Name*'];
                        let itemAvailableTo = element['Item Available To*'];
                        let priceApplicableToStaff = element['Price Applicable To Staff*'];
                        let itemExchangeAvalTo = element['Item Exchange Avaliable For*'];
                        let itemSize = element['Size(Age/class-wise)*'];
                        let costPrice = element['Cost Price(incl. of GST)*'];
                        let sellingPrice = element['Selling Price*'];
                        let enableTracking = element['Enable tracking for this item*'];
                        let studentPickUpPeriod = element['Pickup Period For Student*'];

                        //validation for category
                        if (!categoryName) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Category Name is missing`);
                        }

                        //validation for subcategory
                        if (!subCategoryName) {

                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Sub-category Name is missing`);
                        }

                        //validation for vendorName
                        if (!vendorName) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Vendor Name is missing`);
                        }

                        //validation for dateOfPurchase
                        if (!dateOfPurchase) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Date Of Purchase is missing`);
                        }

                        //validation for Quantity
                        if (!Quantity) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Quantity is missing`);
                        }

                        //validation for itemName
                        if (!itemName) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Item Name is missing`);
                        }

                        //validation for itemAvailableTo
                        if (!itemAvailableTo) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Item Available To is missing`);
                        }

                        //validation for itemExchangeAvalTo
                        if (!itemExchangeAvalTo) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Item Exchange Avaliable To is missing`);
                        }

                        //validation for itemSize
                        if (!itemSize) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Item Size is missing`);
                        }

                        //validation for costPrice
                        if (!costPrice) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Cost Price is missing`);
                        }

                        //validation for sellingPrice
                        if (!sellingPrice) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Selling Price is missing`);
                        }

                        //validation for studentPickUpPeriod
                        if (!studentPickUpPeriod) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Pickup Period For Student is missing`);
                        }
                    }

                    if (errors && errors.length > 0) {

                        // Remove Excel
                        fs.unlinkSync(filePath);
                        return await apiresponse(false, errors, 201, null);
                    } else {

                        // unlink the file
                        fs.unlinkSync(filePath); //need to uncomment

                        // generate a jwt token
                        let token = jwt.sign(
                            {
                                data: {
                                    uploadId,
                                    instituteId,
                                },
                            },
                            process.env.JWT_SECRET_KEY,
                            {
                                expiresIn: '20m',
                            }
                        );
                        return await apiresponse(true, CONSTANTS.DATA_VALIDATED, 201, { token });
                    }

                } else {
                    return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
                }
            } else {
                return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
            }
        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const getItemListingForBulkEmptyUploadService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    try {
        const listing = await inventoryItemBulkUploadSheetMaster.find(
            { instituteId: instituteId, status: true }
        )
            .select('-__v -status')
            .populate({
                path: 'categoryId',
                select: '_id categoryName',
            })
            .populate({
                path: 'documentId',
                select: '_id fullPath',
            });

        if (listing.length === 0) {
            return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
        }
        return await apiresponse(true, MESSAGES.DATA_FOUND, 201, listing);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const uploadExcelSheetForBulkUploadOfItemMasterService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;

    try {
        let { uploadId, bulk_upload_token } = req.body;

        let templateDetails = await inventoryItemBulkUploadSheetMaster.findOne({
            _id: uploadId
        });

        if (Object.keys(templateDetails).length === 0) {
            return await apiresponse(true, MESSAGES.INVENTORY.ITEM_MASTER.NO_TEMPLATE_FOUND, 201, null);
        }

        // verify jwt token
        let jwtData = jwt.verify(bulk_upload_token, process.env.JWT_SECRET_KEY);

        if (jwtData) {
            if (
                jwtData.hasOwnProperty('data') &&
                jwtData.data.hasOwnProperty('uploadId') &&
                jwtData.data.hasOwnProperty('instituteId') &&
                jwtData.data.uploadId == uploadId &&
                jwtData.data.instituteId == instituteId
            ) {
                if (req.files.itemMasterExcel && req.files.itemMasterExcel.length > 0) {
                    let itemMasterExcel = req.files.itemMasterExcel[0];

                    let filePath = join(itemMasterExcel.destination, itemMasterExcel.originalname);

                    const rows = await xlsxFile(filePath);
                    if (rows && rows.length > 0) {
                        let key = rows[0];
                        let itemMasterFormData = [];
                        for (let i = 1; i < rows.length; i++) {
                            let element = rows[i];
                            let itemMasterObj = {};

                            for (let j = 0; j < element.length; j++) {
                                itemMasterObj[key[j]] = element[j];
                            }
                            itemMasterFormData.push(itemMasterObj);
                        }

                        if (itemMasterFormData && itemMasterFormData.length > 0) {

                            //store data
                            for (let element of itemMasterFormData) {

                                let categoryName = element['Category*'];
                                const categoryId = await getCategoryIdByName(categoryName, instituteId)

                                let subCategoryName = element['SubCategory*'];
                                const subCategoryId = await getSubCategoryIdByName(subCategoryName, instituteId);

                                let vendorName = element['Vendor*'];
                                const vendorId = vendorName ? await getVendorIdByName(vendorName, instituteId) : null;

                                let itemId = element['Item Id'];

                                let itemQuantity = element['Quantity*'];
                                let itemUnit = element['Item Unit'];
                                const itemUnitId = await getUnitIdByName(itemUnit, instituteId);

                                let store = element['Store'];
                                const storeId = store ? await getStoreIdByName(store, instituteId) : null;

                                let itemName = element['Item Name*'];

                                let itemAvailableTo = element['Item Available To*'];

                                let priceApplicableToStaff = element['Price Applicable To Staff*'];

                                let itemExchangeAvlFor = element['Item Exchange Avaliable For*'];

                                let exchangePeriodForStudent = element['Exchange Period For Student*'];

                                let exchangePeriodForStaff = element['Exchange Period For Staff*'];

                                let pickupPeriodForStaff = element['Pickup Period For Staff*'];

                                let pickupPeriodForStudent = element['Pickup Period For Student*'];

                                let itemSize = element['Size(Age/class-wise)*'];

                                let weight = element['Weight'];
                                let weightUnit = element['Weight Unit'];
                                const weightUnitId = await getUnitIdByName(weightUnit, instituteId);

                                let material = element['Material'];
                                let otherDetails = element['Other Details'];
                                let costPrice = element['Cost Price(incl. of GST)*'];
                                let sellingPrice = element['Selling Price*'];

                                let taxRate = element['Tax Rate(%)'];
                                const taxRateId = await getTaxIdByName(taxRate);

                                let totalSellingPrice = element['Total Selling Price(incl. of GST)'];
                                let enableTracking = element['Enable tracking for this item*'];

                                let quantityInHand = element['Quantity in hand'];
                                let quantityUnit = element['Quantity Unit'];
                                let quantityUnitId = await getUnitIdByName(quantityUnit, instituteId);

                                let reorderPoint = element['Reorder Point'];
                                let reorderUnit = element['Reorder Unit'];
                                let reorderUnitId = await getUnitIdByName(reorderUnit, instituteId);

                                let dateOfPurchase = element['Date Of Purchase*'];

                                let preferredVendor = element['Prefered Vandor'];
                                const preferredVendorId = preferredVendor ? await getVendorIdByName(preferredVendor, instituteId) : null;

                                //create item master
                                let itemMasterCreated = await inventoryItemMaster.create({
                                    instituteId,
                                    itemImages: [
                                        { 'documentID': '64f1753285a4f6c7c838d1e2', 'isPrimary': true }
                                    ],
                                    categoryId: categoryId ? categoryId._id : null,
                                    subCategoryId: subCategoryId ? subCategoryId._id : null,
                                    fixedVendorId: vendorId ? vendorId._id : null,
                                    itemId: itemId,
                                    itemQuantity: {
                                        'quantity': itemQuantity,
                                        'unit': itemUnitId ? itemUnitId._id : null
                                    },
                                    store: storeId ? storeId._id : null,
                                    itemName: itemName,
                                    itemAvailableTo: itemAvailableTo,
                                    priceApplicableToStaff: priceApplicableToStaff,
                                    exchangeableItemFor: itemExchangeAvlFor,
                                    exchangePeriodForStudent: exchangePeriodForStudent,
                                    exchangePeriodForStaff: exchangePeriodForStaff,
                                    pickupPeriodForStudent: pickupPeriodForStudent,
                                    pickupPeriodForStaff: pickupPeriodForStaff,
                                    itemSize: itemSize,
                                    weightData: {
                                        'weight': weight,
                                        'unit': weightUnitId ? weightUnitId._id : null
                                    },
                                    materialType: material,
                                    otherDetails: otherDetails,
                                    costPrice: costPrice,
                                    sellingPrice: sellingPrice,
                                    taxRate: taxRateId ? taxRateId._id : null,
                                    totalSellingPrice: totalSellingPrice,
                                    enableTracking: enableTracking,
                                    quantityInHand: {
                                        'quantityInHand': quantityInHand,
                                        'unit': quantityUnitId ? quantityUnitId._id : null
                                    },
                                    reorderPointData: {
                                        'reorderPoint': reorderPoint,
                                        'unit': reorderUnitId ? reorderUnitId._id : null
                                    },
                                    preferredVendor: preferredVendorId ? preferredVendorId._id : null,
                                    dateOfPurchase: dateOfPurchase
                                });

                                if (itemMasterCreated) {
                                    let itemMasterId = itemMasterCreated.id;
                                }

                                // Store excel and create logs for uploaded excel file
                                let document = await awsS3ServerToServerUpload(filePath, 'inventoryItemRequirementBulkUpload');
                                if (document) {
                                    let documentId = document._id;
                                    await inventoryItemBulkUploadSheetMaster.updateOne(
                                        { _id: uploadId },
                                        {
                                            $set: { documentId: documentId, updatedAt: new Date() }
                                        }
                                    );
                                }
                                // console.log(document);
                                // process.exit(0);

                                // unlink the file
                            }
                            fs.unlinkSync(filePath);
                            return await apiresponse(true, CONSTANTS.DATA_CREATED, 201, null);
                        } else {
                            return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
                        }
                    } else {
                        return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
                    }
                } else {
                    return await apiresponse(false, CONSTANTS.FILE_REQUIRED, 201, null);
                }
            }
        } else {
            return await apiresponse(false, CONSTANTS.UNAUTHORISED, 201, null);
        }

    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const updateHighestSellingPriceForOldData = async (req, res) => {
    let getAllItems = await inventoryItemMaster.find()
    for (let i = 0; i < getAllItems.length; i++) {
        let highestSellingPrice = getAllItems[i].itemSizes[0].sellingPrice;
        for (let j = 1; j < getAllItems[i].itemSizes.length; j++) {
            if (getAllItems[i].itemSizes[j].sellingPrice > highestSellingPrice) {
                highestSellingPrice = getAllItems[i].itemSizes[j].sellingPrice
            }
        }
        let updateItem = await inventoryItemMaster.findOneAndUpdate({ _id: getAllItems[i]._id }, { $set: { highestSellingPrice: highestSellingPrice } }, { new: true })
    }
    return await apiresponse(true, 'Success', 201, getAllItems.length);
}


export default {
    createInventoryNewItemService,
    editInventoryNewItemService,
    deleteInventoryNewItemService,
    getItemDetailsByIdService,
    getItemListingService,
    updateHighestSellingPriceForOldData
};