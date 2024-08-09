/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
// eslint-disable-next-line no-unused-vars

import inventoryItemSizeMaster from '../models/inventoryItemSizeMaster.model.js';
import inventorySubCategoryMaster from '../models/inventorySubCategoryMaster.model.js';
import mongoose from 'mongoose';
import {hasSpecialCharacters} from '../utils/commonFunction.util.js';
import CONSTANTS from '../utils/constants.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';


const createInventoryItemSizeService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;
    try {
        let sizeMasterData = await inventoryItemSizeMaster.findOne({
            instituteId:instituteId,
            categoryId:body.categoryId,
            subCategoryId:body.subCategoryId,
            status:true
        });

        if(sizeMasterData){
            return await apiresponse(false, 'Item size with given category and sub-category already exists.', 201, null);
        }
        let response = await inventoryItemSizeMaster.create({
            instituteId,
            ...req.body
        });
        if(response){
            await inventorySubCategoryMaster.updateOne(
                { _id: body.subCategoryId },
                { $set: { isAlreadyUsed: true } }
            );
        }
        return await apiresponse(true,'Item Size is created successfully.', 201, response);

    } catch (err) {
        console.log(err);
        return await apiresponse(false, err, 401, MESSAGES.GENERAL_ERROR);
    }
};

const editInventoryItemSizeService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;

    try {
        let sizeMasterData = await inventoryItemSizeMaster.findOne({
            instituteId:instituteId,
            categoryId:body.categoryId,
            subCategoryId:body.subCategoryId,
            _id: { $ne: body.itemSizeId },
            status:true
        });

        if(sizeMasterData){
            return await apiresponse(false, 'Item size with given category and sub-category already exists.', 201, null);
        }

        let response = await inventoryItemSizeMaster.updateOne(
            { _id: body.itemSizeId },
            {
                $set: {
                    instituteId: instituteId,
                    categoryId: body.categoryId,
                    subCategoryId: body.subCategoryId,
                    itemSize: body.itemSize,
                    updatedAt: new Date()
                }
            }
        );
        if(response){
            let getItemSizeMaster = await inventoryItemSizeMaster.findOne(
                {_id:body.itemSizeId},
                {
                    subCategoryId:1,_id:0
                }
            );
            if(getItemSizeMaster.subCategoryId !== new mongoose.Types.ObjectId(body.subCategoryId)){
                await inventorySubCategoryMaster.updateOne(
                    { _id: new mongoose.Types.ObjectId(body.subCategoryId) },
                    { $set: { isAlreadyUsed: true } }
                );

                // await inventorySubCategoryMaster.updateOne(
                //     { _id: getItemSizeMaster.subCategoryId },
                //     { $set: { isAlreadyUsed: false } }
                // );
            }
        }
        return await apiresponse(true,'Item Size updated successfully.', 201, response);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
};

const deleteInventoryItemSizeService = async (req, res) => {
    try {
        let { id } = req.params;

        let response = await inventoryItemSizeMaster.updateOne(
            { _id: id },
            {
                $set: { status: null, updatedAt: new Date() }
            }
        );
        return await apiresponse(true,'Item size has been removed successfully.', 201, response);

    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
};

const getInventoryItemSizeService = async (req, res) => {
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
        // console.log(sortOrder);
        // process.exit(0);
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
        if(hasSpecialCharacters(searchKeyWord)){
            return await apiresponse(false,'No data found !', 201, {});
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
            const categoryCount = await inventoryItemSizeMaster.countDocuments(
                conditionObj
            );
            const queryCat = await inventoryItemSizeMaster.aggregate([
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
                    $unwind: {
                        path: '$Category',
                        preserveNullAndEmptyArrays: true, // Preserve documents without a match
                    },
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
                    $unwind: {
                        path: '$SubCategory',
                        preserveNullAndEmptyArrays: true, // Preserve documents without a match
                    },
                },
                {
                    $addFields: {
                        categoryName: { $ifNull: ['$Category.categoryName', null] },
                        subCategoryName: { $ifNull: ['$SubCategory.subCategoryName', null] },
                    },
                },
                {
                    $match: {
                        $or: [
                            { 'categoryName': { $regex: searchKeyWord, $options: 'i' } }, // Search in category names
                            { 'subCategoryName': { $regex: searchKeyWord, $options: 'i' } }
                            // Add more conditions if needed
                        ]
                    }
                },
                {
                    $project: {
                        instituteId: 0,
                        status: 0,
                        __v: 0,
                        createdAt: 0,
                        Category: 0,
                        SubCategory: 0,
                    }
                },
                { $sort: sortOrder },
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
            return await apiresponse(true,msg, 201, result);

        } else {
            const responseFinal = await inventoryItemSizeMaster.aggregate([
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
                    $addFields: {
                        categoryName: '$Category.categoryName',
                        subCategoryName: '$SubCategory.subCategoryName'
                    }
                },
                {
                    $match: {
                        $or: [
                            { 'categoryName': { $regex: searchKeyWord, $options: 'i' } }, // Search in category names
                            { 'subCategoryName': { $regex: searchKeyWord, $options: 'i' } }
                            // Add more conditions if needed
                        ]
                    }
                },
                {
                    $project: {
                        instituteId: 0,
                        status: 0,
                        __v: 0,
                        createdAt: 0,
                        Category: 0,
                        SubCategory: 0,
                    }
                },
                { $sort: sortOrder }
            ]);

            let msg = responseFinal.length ? 'Data Found!' : 'No Data Found!';
            return await apiresponse(true,msg, 201, responseFinal);

        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
};

const getInventorySizeService = async (req, res) => {
    try {
        const instituteId = req.authData.data.instituteId;

        const sizeListing = await inventoryItemSizeMaster.find(
            {
                instituteId: instituteId,
                status: 1
            },
            { itemSize: 1, _id: 0 }
        );
        //  console.log(sizeListing);
        // process.exit(0);
        let mergedItemSize = sizeListing.reduce((merged, current) => {
            return merged.concat(current.itemSize);
        }, []);
        // console.log(mergedItemSiz);
        mergedItemSize = [...new Set(mergedItemSize)];
        let msg = mergedItemSize.length ? 'Data Found!' : 'No Data Found!';
        return {
            success: true,
            message: msg,
            code: 201,
            data: mergedItemSize
        };
    } catch (error) {
        console.log(error);
    }
};

export default {
    createInventoryItemSizeService,
    editInventoryItemSizeService,
    deleteInventoryItemSizeService,
    getInventoryItemSizeService,
    getInventorySizeService
};
