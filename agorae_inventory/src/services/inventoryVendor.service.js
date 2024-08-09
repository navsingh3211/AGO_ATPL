/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import inventoryVendorMaster from '../models/inventoryVendorMaster.model.js';
import paginationSearchHandler from '../utils/paginationSearchHandler.util.js';
import {hasSpecialCharacters} from '../utils/commonFunction.util.js';

import ejs from 'ejs';
import path from 'path';
import htmlPdf from 'html-pdf';
import fs from 'fs';
import CONSTANTS from '../utils/constants.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';

const createInventoryVendorService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;
    let vendorList = await inventoryVendorMaster.findOne({
        instituteId: instituteId,
        vendorName: body.vendorName.trim()
    });
    if (vendorList) {
        return {
            success: false,
            message: 'Vendor name  already exists.',
            code: 401,
            data: {}
        };
    }

    try {
        let response = await inventoryVendorMaster.create({
            instituteId,
            ...req.body
        });
        return {
            success: true,
            message: 'Vendor created successfully.',
            code: 201,
            data: response
        };
    } catch (err) {
        console.log(err);
    }
};

const updateInventoryVendorService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;

    let { vendorId, ...body } = req.body;

    let vendorList = await inventoryVendorMaster.findOne({
        _id: { $ne: vendorId },
        instituteId: instituteId,
        vendorName: body.vendorName.trim()
    });
    if (vendorList) {
        return {
            success: false,
            message: 'Vendor name  already exists.',
            code: 401,
            data: {}
        };
    }
    try {
        let response = await inventoryVendorMaster.updateOne(
            { _id: vendorId },
            {
                $set: { ...body, updatedAt: new Date() }
            }
        );
        return {
            success: true,
            message: 'Vendor updated successfully.',
            code: 201,
            data: response
        };
    } catch (error) {
        console.log(error);
    }
};

const getVendorDetails = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    let { vendorId } = req.params;

    try {
        let vendorDetails = await inventoryVendorMaster
            .findOne({ _id: vendorId, instituteId: instituteId })
            .select('-__v');
        return {
            success: true,
            message: null,
            code: 201,
            data: vendorDetails
        };
    } catch (error) {
        console.log(error);
    }
};

const updateVendorStatus = async (req, res) => {
    try {
        let { vendorId } = req.params;

        let vendorDetails = await inventoryVendorMaster.findOne({ _id: vendorId });
        if (vendorDetails) {
            if (vendorDetails.status === true) {
                await inventoryVendorMaster.updateOne(
                    { _id: vendorId },
                    {
                        $set: { status: false, updatedAt: new Date() }
                    }
                );
                return {
                    success: true,
                    message: 'Vendor status updated successfully.',
                    code: 201,
                    data: null
                };
            } else {
                await inventoryVendorMaster.updateOne(
                    { _id: vendorId },
                    {
                        $set: { status: true, updatedAt: new Date() }
                    }
                );
                return {
                    success: true,
                    message: 'Vendor status updated successfully.',
                    code: 201,
                    data: null
                };
            }
        } else {
            return {
                success: true,
                message: 'Vendor not found!.',
                code: 201,
                data: null
            };
        }
    } catch (err) {
        console.log(err);
    }
};

const getVendorList = async (req, res) => {
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
        if(req.query.searchKey && hasSpecialCharacters(req.query.searchKey)){
            return await apiresponse(false, 'No data found !', 201, '');
        }
        let queryArray = [
            {
                $match: {
                    $or:[
                        {instituteId:instituteId},
                        {instituteId:null}
                    ]
                }
            },
            {
                $match: {
                    $or: [
                        { 'vendorName': { $regex: searchKeyWord, $options: 'i' } },
                        { 'contactPersonName': { $regex: searchKeyWord, $options: 'i' } }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    vendorName: 1,
                    contactPersonName: 1,
                    email: 1,
                    phoneNumber: 1,
                    address:1,
                    gstNo:1,
                    panNo:1,
                    licenseNo:1,
                    status:1,
                    createdAt:1,
                    updatedAt:1
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
            let aggregationResult = await inventoryVendorMaster.aggregate(queryArray);
            let total = aggregationResult[0].total[0] ? aggregationResult[0].total[0].count : 0;
            let dataListing = aggregationResult[0].data;

            let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
            let result = {
                rows: dataListing,
                total: total,
            };
            return await apiresponse(true, msg, 201, result);
        } else {
            let aggregationResult = await inventoryVendorMaster.aggregate(queryArray);
            let total=aggregationResult.length;
            let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
            return await apiresponse(true, msg, 201, aggregationResult);
        }
    } catch (err) {
        console.log(err);
    }
};

const getVendorPdf = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    let { vendorId } = req.params;
    try {
        let vendorDetails = await inventoryVendorMaster
            .findOne({ _id: vendorId, instituteId: instituteId })
            .select('-__v');

        //  process.exit(0);
        return vendorDetails;
    } catch (error) {
        console.log(error);
    }
}

const getVendorListingForDropDownService = async (req, res) => {
    try {
        const instituteId = req.authData.data.instituteId;

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
                $project: {
                    _id: 1,
                    vendorName: 1,
                    contactPersonName: 1,
                    email: 1
                }
            }
        ];
        let aggregationResult = await inventoryVendorMaster.aggregate(queryArray);
        let total=aggregationResult.length;
        let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
        return await apiresponse(true, msg, 201, aggregationResult);
    } catch (err) {
        console.log(err);
    }
};

export default {
    createInventoryVendorService,
    updateInventoryVendorService,
    getVendorDetails,
    updateVendorStatus,
    getVendorList,
    getVendorPdf,
    getVendorListingForDropDownService
};
