/* eslint-disable eqeqeq */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line no-unused-vars
import InventoryItemRequirementMaster from '../models/inventoryItemRequirement.model.js';
import inventoryDocumentMaster from '../models/inventoryDocumentMaster.model.js';
import inventoryItemMaster from '../models/inventoryItemMaster.model.js';
import inventoryItemReqUploadSheetMaster from '../models/inventoryItemReqUploadSheetMaster.model.js';
import InventoryCategoryMaster from '../models/InventoryCategoryMaster.model.js';
import inventorySubCategoryMaster from '../models/inventorySubCategoryMaster.model.js';
import inventoryItemSizeMaster from '../models/inventoryItemSizeMaster.model.js';
import InventoryUnitMaster from '../models/inventoryUnitMaster.model.js';
import inventoryVendorMaster from '../models/inventoryVendorMaster.model.js';
import vendorPurchaseRequest from '../models/vendorPurchaseRequest.model.js';

import { 
    getCategoryIdByName, 
    getSubCategoryIdByName, 
    getUnitIdByName, 
    getVendorIdByName,
    hasSpecialCharacters
} from '../utils/commonFunction.util.js';
import { awsS3ServerToServerUpload } from '../utils/awsS3Handler.util.js'

import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';

import getTokenDetails from '../utils/jwt.util.js';
import mongoose from 'mongoose';
import Excel from 'exceljs';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { join,dirname } from 'path';
// import path from 'path';
import moment from 'moment';
import CONSTANTS from '../utils/constants.util.js';
import xlsxFile from 'read-excel-file/node';
import jwt from 'jsonwebtoken';

const createInventoryItemRequirementService = async (req, res) => {
    const token = req.headers['authorization'];
    let institionData;
    getTokenDetails(token, async (err, data) => {
        if (err) {
            console.log(err);
            return {
                success: false,
                message: 'Invalid Token!',
                code: 404,
                data: {}
            };
        }
        // console.log(data);
        institionData = data;
    });
    // console.log(institionData,'ramayana');
    // process.exit(0);
    const instituteId = institionData.data.instituteId;

    try {
        let response = await InventoryItemRequirementMaster.create({ instituteId, ...req.body });
        console.log(response)
        //creating data for vendor purchase request
        if(response){
            const body = req.body;
            await vendorPurchaseRequest.create({
                instituteId,
                itemRequirementId:response._id,
                categoryId:body.categoryId,
                subCategoryId:body.subCategoryId,
                fixedVendorId:body.vendorId ? body.vendorId : null,
                itemName:body.itemName,
                itemSizes:[
                    {
                        size:body.itemSize,
                        itemQuantity:{
                            quantity:body.quantity,
                            unit:body.unit
                        },
                        cost:body.pricePerUnit,
                        costPrice:body.totalPrice,
                        sellingPrice:0,
                        totalSellingPrice:0
                    }
                ],
                proposedQty:{
                    quantity:body.quantity,
                    unit:body.unit
                },
                receivedQty:null
            });
        }
        return {
            success: true,
            message: 'Item requirement has been added successfully.',
            code: 201,
            data: response
        };
    } catch (err) {
        console.log(err);
    }

};

const editInventoryItemRequirementService = async (req, res) => {
    const token = req.headers['authorization'];

    let institionData;
    getTokenDetails(token, async (err, data) => {
        if (err) {
            console.log(err);
            return {
                success: false,
                message: 'Invalid Token!',
                code: 404,
                data: {}
            };
        }
        // console.log(data);
        institionData = data;
    });
    const instituteId = institionData.data.instituteId;

    const { itemReqId, ...itemReqBody } = req.body;

    const dataToUpdate = {
        instituteId: instituteId,
        ...itemReqBody,
        editedAt: new Date()
    };
    // console.log(dataToUpdate);
    // process.exit(0);
    try {
        let response = await InventoryItemRequirementMaster.updateOne(
            { _id: itemReqId },
            {
                $set: dataToUpdate
            }
        );
        return {
            success: true,
            message: 'Item Requirement updated successfully.',
            code: 201,
            data: response
        };
    } catch (error) {
        console.log(error);
    }
};

const deleteInventoryItemRequirementService = async (req, res) => {
    try {
        let { itemReqId } = req.params;
        // console.log(itemReqId);
        // process.exit(0);
        let response = await InventoryItemRequirementMaster.updateOne(
            { _id: itemReqId },
            {
                $set: { status: null, updatedAt: new Date() }
            }
        );
        return {
            success: true,
            message: 'Item Requirement has been removed successfully.',
            code: 201,
            data: response
        };
    } catch (error) {
        console.log(error);
    }
}

const getInventoryItemRequirementDetailsService = async (req, res) => {
    const token = req.headers['authorization'];

    let institionData;
    getTokenDetails(token, async (err, data) => {
        if (err) {
            console.log(err);
            return {
                success: false,
                message: 'Invalid Token!',
                code: 404,
                data: {}
            };
        }
        // console.log(data);
        institionData = data;
    });
    // console.log(institionData);
    // process.exit(0);
    const instituteId = institionData.data.instituteId;
    let { itemReqId } = req.params;
    // console.log(itemReqId,'TiTu MAMA');
    // process.exit(0);
    try {
        let ItemRequirementDetails = await InventoryItemRequirementMaster
            .findOne({ _id: itemReqId, instituteId: instituteId })
            .select('-__v -_id')
            .populate({
                path: 'categoryId',
                select: '_id categoryName', // Specify the fields you want to retrieve
            })
            .populate({
                path: 'subCategoryId',
                select: '_id subCategoryName', // Specify the fields you want to retrieve
            })
            .populate({
                path: 'unit',
                select: '_id unitName', // Specify the fields you want to retrieve
            })
            .populate({
                path: 'vendorId',
                select: '_id vendorName', // Specify the fields you want to retrieve
            });
        return {
            success: true,
            message: null,
            code: 201,
            data: ItemRequirementDetails
        };
    } catch (error) {
        console.log(error);
    }
}

const getInventoryItemRequirementListService = async (req, res) => {
    try {
        const instituteId = req.authData.data.instituteId;
        const sortBy = req.query.sortBy;
        const orderBy = req.query.orderBy;
        let sortOrder = {};
        if (sortBy && orderBy) {
          sortOrder[`${sortBy}`] = orderBy === 'asc' ? 1 : -1;
        }else{
            sortOrder['createdAt']= -1;
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

        //Creating condition for search for feild Category and Sub-category
        const searchKeyWord = req.query
            ? req.query.searchKey
                ? req.query.searchKey
                : ''
            : '';
        /* Checking for special charater in serch keyword*/
        if(searchKeyWord && hasSpecialCharacters(searchKeyWord)){
            return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 401, '');
        }
        let conditionObj = { status: true, instituteId: instituteId };
        if (categoryId) {
            conditionObj.categoryId = new mongoose.Types.ObjectId(categoryId);
        }
        if (subCatId) {
            conditionObj.subCategoryId = new mongoose.Types.ObjectId(subCatId);
        }
        // console.log(conditionObj);
        // process.exit(0);

        if (req.query.pageSize && req.query.pageNo) {
            const categoryCount = await InventoryItemRequirementMaster.countDocuments(
                conditionObj
            );

            const queryCat = await InventoryItemRequirementMaster.aggregate([
                {
                    $match: conditionObj
                },
                {
                    $lookup: {
                        from: 'inventorycategorymasters',
                        let: { categoryId: '$categoryId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$_id', '$$categoryId'] }
                                }
                            }
                        ],
                        as: 'Category'
                    }
                },
                {
                    $unwind: '$Category'
                },
                {
                    $lookup: {
                        from: 'inventorysubcategorymasters',
                        let: { subCategoryId: '$subCategoryId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$_id', '$$subCategoryId'] }
                                }
                            }
                        ],
                        as: 'SubCategory'
                    }
                },
                {
                    $unwind: '$SubCategory'
                },
                {
                    $lookup: {
                        from: 'inventoryunitmasters',
                        let: { unitId: '$unit' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$_id', '$$unitId'] }
                                }
                            }
                        ],
                        as: 'Unit'
                    }
                },
                {
                    $unwind: '$Unit'
                },
                {
                    $lookup: {
                        from: 'inventoryvendormasters',
                        let: { vendorId: '$vendorId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$_id', '$$vendorId'] }
                                }
                            }
                        ],
                        as: 'VendorMaster',
                    }
                },
                {
                    $unwind: {
                        path: '$VendorMaster',
                        preserveNullAndEmptyArrays: true // Preserve documents with no matches
                    }
                },
                {
                    $addFields: {
                        VendorMaster: {
                            $ifNull: ['$VendorMaster', {}] // Replace null VendorMaster with an empty object
                        }
                    }
                },
                {
                    $addFields: {
                        categoryName: '$Category.categoryName',
                        subCategoryName: '$SubCategory.subCategoryName',
                        unitName: '$Unit.unitName',
                        vendorName: {
                            $cond: {
                                if: { $ne: ['$VendorMaster', {}] },
                                then: '$VendorMaster.vendorName',
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
                            { 'vendorName': { $regex: searchKeyWord, $options: 'i' } }, // Search in SubCategory name
                            { 'itemName': { $regex: searchKeyWord, $options: 'i' } }
                        ]
                    }
                },
                {
                    $project:{
                        Category:0,
                        SubCategory:0,
                        Unit:0,
                        VendorMaster:0,
                        instituteId:0,
                        __v:0
                    }
                },
                {
                    $addFields: {
                      updatedAt: '$editedAt' // This adds/overwrites the updatedAt field with the value of editedAt
                    }
                },
                { 
                    $sort: sortOrder 
                },
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
            ]);
            let total = queryCat[0].total[0] ? queryCat[0].total[0].count : 0;
            let dataListing = queryCat[0].data;
            // console.log(queryCat);
            let msg = total ? 'Data Found!' : 'No Data Found!';
            let result = {
                rows: dataListing,
                total: total,
            };
            return {
                success: true,
                message: msg,
                code: 201,
                data: result
            };

        } else {
            const responseFinal = await InventoryItemRequirementMaster.aggregate([
                {
                    $match: conditionObj
                },
                {
                    $lookup: {
                        from: 'inventorycategorymasters',
                        let: { categoryId: '$categoryId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$_id', '$$categoryId'] }
                                }
                            }
                        ],
                        as: 'Category'
                    }
                },
                {
                    $unwind: '$Category'
                },
                {
                    $lookup: {
                        from: 'inventorysubcategorymasters',
                        let: { subCategoryId: '$subCategoryId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$_id', '$$subCategoryId'] }
                                }
                            }
                        ],
                        as: 'SubCategory'
                    }
                },
                {
                    $unwind: '$SubCategory'
                },
                {
                    $lookup: {
                        from: 'inventoryunitmasters',
                        let: { unitId: '$unit' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$_id', '$$unitId'] }
                                }
                            }
                        ],
                        as: 'Unit'
                    }
                },
                {
                    $unwind: '$Unit'
                },
                {
                    $lookup: {
                        from: 'inventoryvendormasters',
                        let: { vendorId: '$vendorId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$_id', '$$vendorId'] }
                                }
                            }
                        ],
                        as: 'VendorMaster',
                    }
                },
                {
                    $unwind: {
                        path: '$VendorMaster',
                        preserveNullAndEmptyArrays: true // Preserve documents with no matches
                    }
                },
                {
                    $addFields: {
                        VendorMaster: {
                            $ifNull: ['$VendorMaster', {}] // Replace null VendorMaster with an empty object
                        }
                    }
                },
                {
                    $addFields: {
                        categoryName: '$Category.categoryName',
                        subCategoryName: '$SubCategory.subCategoryName',
                        unitName: '$Unit.unitName',
                        vendorName: {
                            $cond: {
                                if: { $ne: ['$VendorMaster', {}] },
                                then: '$VendorMaster.vendorName',
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
                            { 'vendorName': { $regex: searchKeyWord, $options: 'i' } }, // Search in SubCategory name
                            { 'itemName': { $regex: searchKeyWord, $options: 'i' } }
                        ]
                    }
                },
                {
                    $project: {
                        Category: 0,
                        SubCategory: 0,
                        Unit: 0,
                        VendorMaster: 0,
                        instituteId: 0,
                        __v: 0
                    }
                },
                { $sort: sortOrder },
                // {
                //     $project: {
                //         itemName: 1,
                //         itemSize: 1,
                //         categoryName: 1,
                //         quantity: 1,
                //         pricePerUnit: 1,
                //         totalPrice: 1,
                //         approvalStatus: 1,
                //         approvedBY: 1,
                //         dateModified: '$updatedAt',
                //         subCategoryName: 1,
                //         vendorName: 1,
                //         createdAt: 1
                //     }
                // }
            ]);

            let msg = responseFinal.length ? 'Data Found!' : 'No Data Found!';
            return {
                success: true,
                message: msg,
                code: 201,
                data: responseFinal
            };
        }
    } catch (error) {
        console.log(error);
    }
};

const giveApprovalToItemRequirement = async (req,res) => {
    try{
        const staffName = req.staffName;
        const body=req.body;
        // console.log(body)
        // console.log(req.staffName);
        const response = body.itemRequirements.map( async (item)=>{
            await InventoryItemRequirementMaster.updateOne(
                { _id: item.itemReqID },
                {
                    $set: { approvalStatus: item.approvalStatus, approvedBY: staffName, approvalActionDate: new Date(), updatedAt: new Date() }
                }
            );
        });
        return {
            success: true,
            message: 'Item Requirement Approved Successfully.',
            code: 201,
            data: response
        };
    } catch(error){
        console.log(error);
    }
}

const uploadImageService = async (req,res) => {
    try{
        let type = 'INVENTORY';
        // console.log(req.files);
        // process.exit(0);
        if (req.files && req.files.file && req.files.file.length > 0) {
            let data=[];
            for (let i = 0; i < req.files.file.length; i++) {
                let s3Data = req.files.file[i];
                // console.log(s3Data);
                // process.exit(0)
                let create = await inventoryDocumentMaster.create({
                    type,
                    etag: s3Data.etag.substring(1, s3Data.etag.length - 1),
                    fileName: s3Data.key.split('/').pop(),
                    filePath: s3Data.key,
                    fullPath: s3Data.location,
                    mimeType: s3Data.mimetype,
                    size: s3Data.size,
                    originalFileName: s3Data.originalname
                        .split('.')
                        .shift()
                        .toString()
                        .replace(/[_\-&\/\\#,+()$~%.'":*?<>{}]/g, ' ')
                        .replace(/\s\s+/g, ' '),
                    fileExtension: CONSTANTS.MIME_TO_EXTENSION[s3Data.mimetype],
                });
                data.push({ 'documentId': create.id, 'fullPath': s3Data.location })
            }
            return {
                success: true,
                message: 'Item Photoes uploaded Successfully.',
                code: 201,
                data: data
            };
        } else {
            return {
                success: false,
                message: 'Input file is required!',
                code: 404,
                data: null
            };
        }
    } catch (error) {
        console.log(error);
    }
}

const transferDataFromItemMReqToItemMasterService = async (req,res) =>{

    const instituteId = req.authData.data.instituteId;

    try {
        let { itemReqId ,...body} = req.body;

        //get item count by same category,subcategory and item name
        const itemName = (body.itemName).trim();
        const getItemCount = await inventoryItemMaster.countDocuments({instituteId:instituteId,categoryId:body.categoryId,subCategoryId:body.subCategoryId,itemName:itemName});
        body.itemId=body.itemId + '-' + (getItemCount + 1);

        //check for approval status
        const itemReqDetails = await InventoryItemRequirementMaster.findOne({ _id: itemReqId });
        
        // if (itemReqDetails.approvalStatus !== 'APPROVED PENDING TRANSFER' || itemReqDetails.approvalStatus !== 'APPROVED L2 PENDING TRANSFER'){
        //     return await apiresponse(false, MESSAGES.INVENTORY.ITEM_REQ.ITEM_CANNOT_TRANSFER, 201, null);
        // }

        if (!['APPROVED PENDING TRANSFER', 'APPROVED L2 PENDING TRANSFER'].includes(itemReqDetails.approvalStatus)){
            return await apiresponse(false, MESSAGES.INVENTORY.ITEM_REQ.ITEM_CANNOT_TRANSFER, 201, null);
        }

        let response = await inventoryItemMaster.create({ instituteId, ...body, itemTransferStatus:'TRANSFERED_FROM_ITEM_REQ' });

        //after transfering  the data from item req to item master ,update approval status of item req
        await InventoryItemRequirementMaster.updateOne(
            { _id: itemReqId },
            {
                $set: { approvalStatus: 'APPROVED TRANSFER DONE', updatedAt: new Date() }
            }
        );

        //adding data in vendor purchase request master
        if(response){
            const receivedQty = body.itemSizes.reduce((sum,ele)=>sum + ele.itemQuantity.quantity,0);
            await vendorPurchaseRequest.updateOne(
                { itemRequirementId: itemReqId },
                {
                    $set: {
                        itemImages:body.itemImages,
                        categoryId:body.categoryId,
                        subCategoryId:body.subCategoryId,
                        fixedVendorId:body.fixedVendorId,
                        itemId:body.itemId,
                        taxRate:body.taxRate ? body.taxRate : null,
                        itemSizes:body.itemSizes,
                        receivedQty:{
                            quantity:receivedQty,
                            unit:body.itemSizes[0].itemQuantity.unit
                        },
                        weightData:body.weightData ? body.weightData : '',
                        materialType:body.materialType ? body.materialType : '',
                        otherDetails:body.otherDetails ? body.otherDetails : '',
                        enableTracking:body.enableTracking,
                        quantityInHand:body.quantityInHand,
                        reorderPointData:body.reorderPointData,
                        preferredVendor:body.preferredVendor ? body.preferredVendor : null,
                        vendorPurchaseStatus:'RECEIVED'
                    }
                }
            );
        }
        
        return await apiresponse(true, MESSAGES.INVENTORY.ITEM_REQ.ITEM_TRANSFER_SUCCESS, 201, response);

    } catch (error) {
        console.log(error);
    }
}

const createInventoryItemRequirementTemplateForSheetInBulkUploadService = async (req,res) =>{
    const token = req.headers['authorization'];
    let institionData;
    getTokenDetails(token, async (err, data) => {
        if (err) {
            console.log(err);
            return {
                success: false,
                message: 'Invalid Token!',
                code: 404,
                data: {}
            };
        }
        institionData = data;
    });
    const instituteId = institionData.data.instituteId;
    // console.log(instituteId);
    // process.exit(0);
    try{
        let { categoryId, noOfItems } = req.body;
        let response = await inventoryItemReqUploadSheetMaster.create({ instituteId, categoryId: categoryId, noOfItems: noOfItems });
        return {
            success: true,
            message: 'Empty sheet is generated successfully.',
            code: 201,
            data: response
        };

    }catch(error){
        console.log(error);
    }
}

const downloadItemRequirementTemplateForBulkUploadService = async(req,res)=>{
    const token = req.headers['authorization'];
    let institionData;
    getTokenDetails(token, async (err, data) => {
        if (err) {
            console.log(err);
            return {
                success: false,
                message: 'Invalid Token!',
                code: 404,
                data: {}
            };
        }
        institionData = data;
    });
    const instituteId = institionData.data.instituteId;
    
    try{
        const { itemReqId } = req.params;
       
        let templateDetails = await inventoryItemReqUploadSheetMaster.findOne({
            _id: itemReqId
        }).select('-__v -_id')
        .populate({
            path: 'categoryId',
            select: '_id categoryName',
        });
       
        if (Object.keys(templateDetails).length===0){
            return {
                success: false,
                message: 'No template sheet is found with given id.',
                code: 201,
                data: null
            };
        }
        // category listing
        const categoryId = templateDetails.categoryId._id;
        // console.log(categoryId);
        // process.exit(0);
        const categoryListing = await InventoryCategoryMaster.find(
            {
                status: true,
                _id:categoryId,
                $or: [
                    { instituteId: instituteId },
                    { instituteId: null }
                ]
            },
            {
                _id:0,
                categoryName:1
            }
        );

        //subcategory listing 
        const subCategoryListing = await inventorySubCategoryMaster.find({
            status:true,
            instituteId: instituteId,
            categoryId:categoryId
        }, { _id:0,subCategoryName :1});
       

        //sizelisting
        const sizeListing = await inventoryItemSizeMaster.find(
            {
                instituteId: instituteId,
                status: true,
                categoryId:categoryId
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
        }, { _id:0,unitName :1});
        
        //vendorlisting
        const vendorListing = await inventoryVendorMaster.find({
            instituteId: instituteId, status: true
        }, { _id: 0, vendorName :1});

        // Create Excel workbook and worksheet
        const workbook = new Excel.Workbook();  
        const worksheet = workbook.addWorksheet('Main Form');
        const categorySheet = workbook.addWorksheet('categoryName');
        const subCategorySheet = workbook.addWorksheet('subCategoryName');
        const itemSizeSheet = workbook.addWorksheet('itemSizeName');
        const unitSheet = workbook.addWorksheet('unitName');
        const vendorSheet = workbook.addWorksheet('vendorName');

        // Header Title
        let headerTitles = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Category', key: 'categoryName', width: 20 },
            { header: 'SubCategory', key: 'subCategoryName', width: 20 },
            { header: 'Item Name', key: 'itemName', width: 20 },
            { header: 'ItemSize', key: 'itemSizeName', width: 20 },
            { header: 'Quantity', key: 'quantity', width: 20 },
            { header: 'Unit', key: 'unitName', width: 20 },
            { header: 'Cost Per Unit', key: 'costPerUnit', width: 20 },
            { header: 'Total Price', key: 'totalPrice', width: 20 },
            { header: 'Vendor', key: 'VendorName', width: 20 },
            { header: 'Description', key: 'description', width: 20 }
        ];
        
        // Define columns in the worksheet, these columns are identified using a key.
        worksheet.columns = headerTitles;
        categorySheet.columns = [{ header: 'Category', key: 'categoryName', width: 25 }];
        subCategorySheet.columns = [{ header: 'SubCategory', key: 'subCategoryName', width: 20 }];
        itemSizeSheet.columns = [{ header: 'ItemSize', key: 'itemSize', width: 20 }];
        unitSheet.columns = [{ header: 'Unit', key: 'unitName', width: 20 }];
        vendorSheet.columns = [{ header: 'Vendor', key: 'VendorName', width: 25 }];

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

        // File name & Path
        const __filename = fileURLToPath(import.meta.url);
        const __dirnamee = dirname(__filename);
        let fileName = `ITEM_REQUIREMENT_FORM_${moment().format('YYYY_MM_DD_HH_mm_ss')}.xlsx`;
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
            worksheet.getCell('E' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['itemSizeName!A2:A' + (itemSizeListing.length + 1)],
            };
            worksheet.getCell('G' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['unitName!A2:A' + (unitListing.length + 1)],
            };
            worksheet.getCell('J' + i).dataValidation = {
                type: 'list',
                allowBlank: true,
                showErrorMessage: false,
                formulae: ['vendorName!A2:A' + (vendorListing.length + 1)],
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

    }catch(error){
        console.log(error);
    }
}

const validationOfitemRequirementAddedByExcelService = async(req ,res) =>{
    const token = req.headers['authorization'];
    let institionData;
    getTokenDetails(token, async (err, data) => {
        if (err) {
            console.log(err);
            return {
                success: false,
                message: 'Invalid Token!',
                code: 404,
                data: {}
            };
        }
        institionData = data;
    });
    const instituteId = institionData.data.instituteId;
    // console.log(instituteId,'SheeriMad Bhagawat Gita')
    try{
        let { uploadId } = req.body;
        let templateDetails = await inventoryItemReqUploadSheetMaster.findOne({
            _id: uploadId
        });
        if (Object.keys(templateDetails).length === 0) {
            return {
                success: false,
                message: 'No template sheet is found with given id.',
                code: 201,
                data: null
            }
        }
        
        if (req.files.itemRequirementExcel && req.files.itemRequirementExcel.length > 0) {
            let itemRequirementExcel = req.files.itemRequirementExcel[0];
            let filePath = join(itemRequirementExcel.destination, itemRequirementExcel.originalname);
            // console.log(filePath);
            // process.exit(0);
            
            // Parse a file
            const rows =await xlsxFile(filePath);
            // console.log(rows);

            if (rows && rows.length > 0) {
                if (templateDetails.noOfItems !== rows.length - 1) {
                    return {
                        success: false,
                        message: 'The number of rows are not exact.',
                        code: 201,
                        data: null
                    };
                }

                if (rows.length - 1 > CONSTANTS.BULK_UPLOAD_MAX_ENQUIRY_FORM) {
                    return {
                        success: false,
                        message: CONSTANTS.MAX_LIMIT_EXCEEDED + CONSTANTS.BULK_UPLOAD_MAX_ENQUIRY_FORM,
                        code: 201,
                        data: null
                    };
                }

                let key = rows[0];
                let itemRequirementFormData = [];

                // header validation
                if (
                    key[0] != 'No' ||
                    key[1] != 'Category' ||
                    key[2] != 'SubCategory' ||
                    key[3] != 'Item Name' ||
                    key[4] != 'ItemSize' ||
                    key[5] != 'Quantity' ||
                    key[6] != 'Unit' ||
                    key[7] != 'Cost Per Unit' ||
                    key[8] != 'Total Price' ||
                    key[9] != 'Vendor' ||
                    key[10] != 'Description'
                ) {
                    return {
                        success: false,
                        message: 'Invalid file entered.',
                        code: 201,
                        data: null
                    };
                }

                for (let i = 1; i < rows.length; i++) {
                    let element = rows[i];
                    let enquiryFormObj = {};

                    for (let j = 0; j < element.length; j++) {
                        enquiryFormObj[key[j]] = element[j];
                    }
                    itemRequirementFormData.push(enquiryFormObj);
                }

                // console.log(itemRequirementFormData);
                if (itemRequirementFormData && itemRequirementFormData.length > 0) {

                    let errors = [];
                    for (let element of itemRequirementFormData) {
                        // console.log(element);
                        // process.exit(0);
                        let categoryName = element['Category'];
                        let subCategoryName = element['SubCategory'];
                        let itemName = element['Item Name'];
                        let itemSizeName = element['ItemSize'];
                        let quantity = element['Quantity'];
                        let unitName = element['Unit'];
                        let costPerUnit = element['Cost Per Unit'];
                        let totalPrice = element['Total Price'];
                        let vendor = element['Vendor'];
                        let description = element['Description'];

                        //validation for category
                        if (!categoryName) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Category Name is missing`);
                        }

                        //validation for subcategory
                        if (!subCategoryName) {
                            console.log('here!!!!!')
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Sub-category Name is missing`);
                        }

                        //validation for itemName
                        if (!itemName) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Item Name is missing`);
                        }

                        //validation for quantity
                        if (!quantity) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Quantity is missing`);
                        }

                        //validation for costPerUnit
                        if (!costPerUnit) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Cost Per Unit is missing`);
                        }

                        //validation for total price
                        if (!costPerUnit) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Total price is missing`);
                        }

                        //validation for unitName
                        if (!unitName) {
                            let rawNo = element['No'];
                            let errorMessage = `Row no: ${rawNo}, `;
                            errors.push(errorMessage + `Unit Name is missing`);
                        }
                    }

                    if (errors && errors.length > 0) {

                        // Remove Excel
                        fs.unlinkSync(filePath);

                        return{
                            success: false,
                            message: 'Mandatory fields are missing.',
                            code: 201,
                            data: null
                        };

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
                                expiresIn: '15m',
                            }
                        );
                        return{
                            success: true,
                            message: CONSTANTS.DATA_VALIDATED,
                            code: 201,
                            data: { token }
                        }
                    }

                } else {
                    return {
                        success: false,
                        message: 'No Data Found!',
                        code: 201,
                        data: null
                    };
                }
            } else {
                return {
                    success: false,
                    message: 'No Data Found!',
                    code: 201,
                    data: null
                };
            }
        }
        
    }catch(error){
        console.log(error);
    }
}

const uploadExcelSheetForBulkUploadOfItemRequirementService = async(req, res) =>{
    const token = req.headers['authorization'];
    let institionData;
    getTokenDetails(token, async (err, data) => {
        if (err) {
            console.log(err);
            return {
                success: false,
                message: 'Invalid Token!',
                code: 404,
                data: {}
            };
        }
        institionData = data;
    });
    const instituteId = institionData.data.instituteId;
    // console.log(instituteId,'SheeriMad Bhagawat Gita')
    try{
        let { uploadId, bulk_upload_token } = req.body;
        // console.log(uploadId);
        // console.log(bulk_upload_token);
        // process.exit(0);
        let templateDetails = await inventoryItemReqUploadSheetMaster.findOne({
            _id: uploadId
        });
       
        if (Object.keys(templateDetails).length === 0) {
            return {
                success: false,
                message: 'No template sheet is found with given id.',
                code: 201,
                data: null
            }
        }

        // verify jwt token
        let jwtData = jwt.verify(bulk_upload_token, process.env.JWT_SECRET_KEY);
        // console.log(jwtData);
        // process.exit(0);
        if (jwtData){
            if (
                jwtData.hasOwnProperty('data') &&
                jwtData.data.hasOwnProperty('uploadId') &&
                jwtData.data.hasOwnProperty('instituteId') &&
                jwtData.data.uploadId == uploadId &&
                jwtData.data.instituteId == instituteId
            ){
                // console.log(req.files);
                if (req.files.itemRequirementExcel && req.files.itemRequirementExcel.length > 0) {
                    let itemRequirementExcel = req.files.itemRequirementExcel[0];
                    let filePath = join(itemRequirementExcel.destination, itemRequirementExcel.originalname);
                    // console.log(itemRequirementExcel.path);
                    // process.exit(0);
                    const rows = await xlsxFile(filePath);
                    // console.log(rows);
                    if (rows && rows.length > 0) {
                        let key = rows[0];
                        let itemRequirementFormData = [];
                        for (let i = 1; i < rows.length; i++) {
                            let element = rows[i];
                            let itemRequirementObj = {};

                            for (let j = 0; j < element.length; j++) {
                                itemRequirementObj[key[j]] = element[j];
                            }
                            itemRequirementFormData.push(itemRequirementObj);
                        }
                        // console.log(itemRequirementFormData);
                        
                        if (itemRequirementFormData && itemRequirementFormData.length>0){

                            //store data
                            for (let element of itemRequirementFormData){

                                let categoryName = element['Category'];
                                const categoryId = await getCategoryIdByName(categoryName, instituteId);  
                                // console.log(categoryId._id,'Category here bulk upload');
                                // process.exit(0)

                                let subCategoryName = element['SubCategory'];
                                // console.log(subCategoryName);
                                const subCategoryId = await getSubCategoryIdByName(subCategoryName, instituteId);
                                // console.log(subCategoryId, 'suncategory here bulk upload');
                                // process.exit(0)

                                let itemName = element['Item Name'];
                                let itemSizeName = element['ItemSize'];
                                let quantity = element['Quantity'];


                                let unitName = element['Unit'];
                                const unitId = await getUnitIdByName(unitName, instituteId);
                                // console.log(unitId);
                                // process.exit(0);
                                let costPerUnit = element['Cost Per Unit'];
                                let totalPrice = element['Total Price'];
                                let vendorName = element['Vendor'];
                                const vendorId = vendorName ? await getVendorIdByName(vendorName, instituteId): null;

                                let description = element['Description'];

                                //create item requirement

                                let itemRequirementCreated = await InventoryItemRequirementMaster.create({ 
                                    instituteId,
                                    categoryId: categoryId._id,
                                    subCategoryId: subCategoryId._id,
                                    itemName: itemName,
                                    itemSize: itemSizeName,
                                    quantity: quantity,
                                    unit: unitId._id,
                                    pricePerUnit: costPerUnit,
                                    totalPrice: totalPrice,
                                    vendorId: vendorId ? vendorId : null,
                                    description: description
                                });

                                if (itemRequirementCreated){
                                    let itemRequirementId = itemRequirementCreated.id;


                                    await vendorPurchaseRequest.create({
                                        instituteId,
                                        itemRequirementId:itemRequirementId,
                                        categoryId:categoryId._id,
                                        subCategoryId:subCategoryId._id,
                                        fixedVendorId:vendorId ? vendorId : null,
                                        itemName:itemName,
                                        itemSizes:[
                                            {
                                                size:itemSizeName,
                                                itemQuantity:{
                                                    quantity:quantity,
                                                    unit:unitId._id
                                                },
                                                cost:costPerUnit,
                                                costPrice:totalPrice,
                                                sellingPrice:0,
                                                totalSellingPrice:0
                                            }
                                        ],
                                        proposedQty:{
                                            quantity:quantity,
                                            unit:unitId._id
                                        },
                                        receivedQty:null
                                    });
                                }

                                // Store excel and create logs for uploaded excel file
                                let document = await awsS3ServerToServerUpload(filePath, 'inventoryItemRequirementBulkUpload');
                                if (document){
                                    let documentId = document._id;
                                    await inventoryItemReqUploadSheetMaster.updateOne(
                                        { _id: uploadId },
                                        {
                                            $set: { documentId: documentId, updatedAt: new Date() }
                                        }
                                    );
                                }
                                // console.log(document);
                                // process.exit(0);
                                  
                            }
                            // unlink the file
                            fs.unlinkSync(filePath);
                            return {
                                success: true,
                                message: CONSTANTS.DATA_CREATED,
                                code: 201,
                                data: null
                            }; 
                        }else{
                            return {
                                success: false,
                                message: 'No Data Found!',
                                code: 201,
                                data: null
                            };
                        }
                    }else{
                        return {
                            success: false,
                            message: 'No Data Found!',
                            code: 201,
                            data: null
                        };
                    }
                }else{
                    return {
                        success: false,
                        message: CONSTANTS.FILE_REQUIRED,
                        code: 201,
                        data: null
                    }
                }

            }
        }else{
            return {
                success: false,
                message: CONSTANTS.UNAUTHORISED,
                code: 201,
                data: null
            }
        }

    }catch(error){
        console.log(error);
    }
}

const getItemRequirementListingForBulkEmptyUploadService = async (req, res) => {
    const token = req.headers['authorization'];
    let institionData;
    getTokenDetails(token, async (err, data) => {
        if (err) {
            console.log(err);
            return {
                success: false,
                message: 'Invalid Token!',
                code: 404,
                data: {}
            };
        }
        // console.log(data);
        institionData = data;
    });
    // console.log(req.query,'ramayana');
    // process.exit(0);
    const instituteId = institionData.data.instituteId;
    try {
        if(req.query.pageNo && req.query.pageSize){
            const pageNo = Number(req.query.pageNo);
            const pageSize = Number(req.query.pageSize);
            const skipAmount = (pageNo - 1) * pageSize;

            const totalCount = await inventoryItemReqUploadSheetMaster.countDocuments({instituteId: instituteId, status: true});

            const listing = await inventoryItemReqUploadSheetMaster.find(
                { instituteId: instituteId, status: true}
            )
            .select('-__v -status')
            .populate({
                path: 'categoryId',
                select: '_id categoryName', // Specify the fields you want to retrieve
            })
            .populate({
                path: 'documentId',
                select: '_id fullPath', // Specify the fields you want to retrieve
            }).skip(skipAmount)
            .limit(pageSize);
            const result = {
                listing,
                totalCount:totalCount
            }
            // console.log(listing);
            if (listing.length===0){
                return {
                    success: false,
                    message: 'No data found!',
                    code: 201,
                    data: null
                };
            }
    
            return {
                success: true,
                message: 'Item data found.',
                code: 201,
                data: result
            };
        }else{  
            const listing = await inventoryItemReqUploadSheetMaster.find(
                { instituteId: instituteId, status: true}
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
            
            // console.log(listing);
            if (listing.length===0){
                return {
                    success: false,
                    message: 'No data found!',
                    code: 201,
                    data: null
                };
            }
    
            return {
                success: true,
                message: 'Item data found.',
                code: 201,
                data: listing
            };
        }
        
    } catch (error) {
        console.log(error);
    }
}

const giveApprovalToItemrequirementRequestService = async (req, res) => {
    const token = req.headers['authorization'];

    let institionData;
    getTokenDetails(token, async (err, data) => {
        if (err) {
            console.log(err);
            return {
                success: false,
                message: 'Invalid Token!',
                code: 404,
                data: {}
            };
        }
        institionData = data;
    });

    const instituteId = institionData.data.instituteId;

    try {
        const { approvalStatus, itemRequirementIds } = req.body;

        if (itemRequirementIds.length == 0) {
            return {
                success: false,
                message: 'Please Provide some item requirement Ids.',
                code: 401,
                data: null
            };
        }

        for (const itemRequirementId of itemRequirementIds) {
            const itemRequirementDetails = await InventoryItemRequirementMaster
                .findOne({ _id: itemRequirementId, instituteId: instituteId })
                .select('_id');

            if (itemRequirementDetails === null) {
                return {
                    success: false,
                    message: 'Please Provide valid requirement Ids.',
                    code: 401,
                    data: null
                };
            }
        }

        //update query for every item requirement ids
        for (const itemRequirementId of itemRequirementIds) {
            const dataToUpdate = {
                approvalStatus: approvalStatus,
                updatedAt: new Date()
            };
            await InventoryItemRequirementMaster.updateOne(
                { _id: itemRequirementId },
                {
                    $set: dataToUpdate
                }
            );
        }
        return {
            success: true,
            message: 'Approval for Item Requirement has been given successfully.',
            code: 201,
            data: null
        };
    } catch (error) {
        console.log(error);
    }
}

export default {
    createInventoryItemRequirementService,
    editInventoryItemRequirementService,
    deleteInventoryItemRequirementService,
    getInventoryItemRequirementDetailsService,
    getInventoryItemRequirementListService,
    giveApprovalToItemRequirement,
    uploadImageService,
    transferDataFromItemMReqToItemMasterService,
    createInventoryItemRequirementTemplateForSheetInBulkUploadService,
    downloadItemRequirementTemplateForBulkUploadService,
    validationOfitemRequirementAddedByExcelService,
    uploadExcelSheetForBulkUploadOfItemRequirementService,
    getItemRequirementListingForBulkEmptyUploadService,
    giveApprovalToItemrequirementRequestService
};