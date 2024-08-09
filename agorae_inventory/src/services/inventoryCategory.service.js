/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line no-unused-vars
import InventoryCategoryMaster from '../models/InventoryCategoryMaster.model.js';
import paginationSearchHandler from '../utils/paginationSearchHandler.util.js';
import {hasSpecialCharacters} from '../utils/commonFunction.util.js';
import CONSTANTS from '../utils/constants.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';

const createInventoryCategoryService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;
    let categorylisting = await InventoryCategoryMaster.findOne({
        $or:[
            {instituteId:instituteId},
            {instituteId:null}
            ], categoryName: body.categoryName.trim(), status: true,
    });
    if (categorylisting){
        return {
            success:false,
            message: 'Category name  already exists.',
            code: 401,
            data: {}
          };
    }

    try{
        let response = await InventoryCategoryMaster.create({ instituteId, ...req.body });
        return {
            success:true,
            message: 'Category created successfully.',
            code: 201,
            data: response
        };
    }catch(err){
        console.log(err);
    }

};

const updateInventoryCategoryService = async (req,res)=>{
    const instituteId = req.authData.data.instituteId;

    let body = req.body;

    let categorylisting = await InventoryCategoryMaster.findOne({
        $or:[
            {instituteId:instituteId},
            {instituteId:null}
          ], categoryName: body.categoryName.trim(), status: true,
    });
    if(categorylisting){
        return {
            success:false,
            message: 'Category name  already exists.',
            code: 401,
            data: {}
          };
    }
    try{
        let response = await InventoryCategoryMaster.updateOne(
            { _id: body.id },
            {
                $set: { categoryName: body.categoryName, editedAt: new Date() }
            }
        );
        return {
            success:true,
            message: 'Category updated successfully.',
            code: 201,
            data: response
        };
    } catch(error){
        console.log(error);
    }
}

const deleteInventoryCategoryService = async(req,res)=>{
    try{
        let { id } = req.params;

        let response = await InventoryCategoryMaster.updateOne(
            { _id: id },
            {
                $set: { status: null, updatedAt: new Date() }
            }
        );
        return {
            success:true,
            message: 'Category has been removed successfully.',
            code: 201,
            data: response
        };
    }catch(error){
        console.log(error);
    }
}

const getInventoryCategoryService = async(req,res)=>{
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
        if(sortBy && orderBy){
            sortOrder[`${sortBy}`] = orderBy === 'asc' ? 1 :-1;
        }else {
            sortOrder['updatedAt'] = -1;
        }

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
                        { 'categoryName': { $regex: searchKeyWord, $options: 'i' } }, // Search in category names
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    categoryName: 1,
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
            let aggregationResult = await InventoryCategoryMaster.aggregate(queryArray);
            let total = aggregationResult[0].total[0] ? aggregationResult[0].total[0].count : 0;
            let dataListing = aggregationResult[0].data;

            let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
            let result = {
                rows: dataListing,
                total: total,
            };
            return await apiresponse(true, msg, 201, result);
        } else {
            let aggregationResult = await InventoryCategoryMaster.aggregate(queryArray);
            let total=aggregationResult.length;
            let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;

            return await apiresponse(true, msg, 201, aggregationResult);
        }
    }catch(error){
        console.log(error);
    }
}

export default {
            createInventoryCategoryService,
            updateInventoryCategoryService,
            deleteInventoryCategoryService,
            getInventoryCategoryService
        };
