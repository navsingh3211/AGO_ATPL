/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import inventoryStudentOrderMaster from '../models/inventoryStudentOrderMaster.model.js';
import inventoryStaffOrderMaster from '../models/inventoryStaffOrderMaster.model.js';
import inventoryItemMaster from '../models/inventoryItemMaster.model.js';
import inventoryItemKitMaster from '../models/inventoryItemKitMaster.model.js';
import inventoryDamagedItemMaster from '../models/inventoryDamagedItemMaster.model.js';
import { apiresponse } from '../utils/commonResponse.util.js';

import MESSAGES from '../utils/commonMessage.util.js';

import mongoose from 'mongoose';
import {
  getUnitNameAndIdById,
  getCategoryNameAndIdById,
  getSubcategoryNameAndIdById,
  getCategoriesNameByIds,
  getSubCategoryNameByIds,
  getStatusRealValueByStatusCodeForStudent,
  getStatusRealValueByStatusCodeForStaff,
  getImageFullPathById,
  getItemDetailsByItemId,
  getUnitNameById,
  getDateFormate,
  getTaxPercentageById,
  getItemStockById,
    getKitStockById
} from '../utils/commonFunction.util.js';
import {
  getStudentNameClassNameByStudentIdClassIdBatchId,
  getStudentAllDetails,
  getStaffDetails
} from '../utils/helperFunction.util.js';


/*
 *student exchange order section
 */
const getStudentExchangeOrdersListingService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    
    const configurationId = req.query
        ? req.query.configurationId
            ? req.query.configurationId
            : ''
        : '';
    let subSessionId = req.query
        ? req.query.subSessionId
            ? req.query.subSessionId
            : ''
        : '';
    const classId = req.query
        ? req.query.classId
            ? req.query.classId
            : ''
        : '';
    const batch = req.query
        ? req.query.batch
            ? req.query.batch
            : ''
        : '';

    const orderDate = req.query
        ? req.query.orderDate
            ? req.query.orderDate
            : ''
        : '';
    const exchangeRequestDate = req.query
        ? req.query.exchangeRequestDate
            ? req.query.exchangeRequestDate
            : ''
        : '';
    const exchangeStatus = req.query
        ? req.query.exchangeStatus
            ? req.query.exchangeStatus
            : ''
        : '';

    let conditionObj = { status: true, instituteId: instituteId,reasonForExchange: { $ne: '' } };
    if (configurationId) {
        conditionObj.configurationId = Number(configurationId);
    }
    if (subSessionId) {
        subSessionId = JSON.parse(subSessionId)
        conditionObj.subSessionId = { $all: subSessionId };
    }
    if (classId) {
        conditionObj.classId = Number(classId);
    }
    if (batch) {
        conditionObj.batch = Number(batch);
    }

    // console.log(conditionObj);
    // process.exit(0);
    try {
        let queryArray = [
            {
                $match: conditionObj
            },
            {
                $project: {
                    _id: 1,
                    itemFrom:1,
                    itemMasterId:1,
                    itemKitMasterId:1,
                    orderId: 1,
                    transactionId: 1,
                    estimatedPickUpDate: 1,
                    orderDate: 1,
                    studentId: 1,
                    configurationId: 1,
                    subSessionId: 1,
                    classId: 1,
                    batch: 1,
                    itemName: 1 ,
                    orderedQuantity: 1,
                    itemInStock:1,
                    orderedItemPrice: 1,
                    orderStatus: 1,
                    exchangeData:1,
                    reasonForExchange:1,
                    commentForExchange:1,
                    exchangeRequestDate:1
                }
            },
            { $unwind: '$exchangeData' }
        ];
        if (exchangeStatus) {
            queryArray.push({
                $match:{
                    'exchangeData.exchangeStatus':exchangeStatus
                }
            });
        }
        if (orderDate) {
            queryArray.push({
                $match: {
                    $expr: {
                        $eq: [
                            { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
                            { $dateToString: { format: '%Y-%m-%d', date: new Date(orderDate) } }
                        ]
                    }
                }
            });
        }
        if (exchangeRequestDate) {
            queryArray.push({
                $match: {
                    $expr: {
                        $eq: [
                            { $dateToString: { format: '%Y-%m-%d', date: '$exchangeRequestDate' } },
                            { $dateToString: { format: '%Y-%m-%d', date: new Date(exchangeRequestDate) } }
                        ]
                    }
                }
            });
        }
    
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

            let aggregationResult = await inventoryStudentOrderMaster.aggregate(queryArray);

            let total = aggregationResult[0].total[0] ? aggregationResult[0].total[0].count : 0;
            let dataListing = aggregationResult[0].data;
            let finalDataListing = [];
            for (let data of dataListing) {
                let stockCount;
                if(data.itemFrom === 'ITEM_MASTER'){
                    let stockDetails = await getItemStockById(data.itemMasterId,data.exchangeData.size);
                    stockCount = stockDetails ? stockDetails : 0;
                }else{
                    let stockDetails = await getKitStockById(data.itemKitMasterId);
                    stockCount = stockDetails.kitQuantity ? stockDetails.kitQuantity.quantity :0;
                }
                data.itemInStock = {
                    itemInStock:stockCount,
                    unit:data.orderedQuantity[0].unit ? await getUnitNameAndIdById(data.orderedQuantity[0].unit) : 'NA'
                };
                let studentDetails = await getStudentNameClassNameByStudentIdClassIdBatchId(req.header('Authorization'),data['studentId'],data['classId'],data['batch']);
                data.studentDetails={
                    studentName:studentDetails.studentFullName.firstName + ' ' + studentDetails.studentFullName.lastName,
                    className: studentDetails.studentclassName.className,
                    batchName:studentDetails.studentBatchName.batchName
                };
                finalDataListing.push(data);
            }
            
            let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
            if(total){
                let result = {
                    rows: finalDataListing,
                    total: total
                };
                return await apiresponse(true, msg, 201, result);
            }else{
                return await apiresponse(false, msg, 201, []);
            }
        } else {
            let dataByGivenId = await inventoryStudentOrderMaster.aggregate(queryArray);
            let finalDataListing=[];
            for (let data of dataByGivenId) {
                let stockCount;
                if(data.itemFrom === 'ITEM_MASTER'){
                    let stockDetails = await getItemStockById(data.itemMasterId,data.exchangeData.size);
                    stockCount = stockDetails ? stockDetails : 0;
                }else{
                    let stockDetails = await getKitStockById(data.itemKitMasterId);
                    stockCount = stockDetails.kitQuantity ? stockDetails.kitQuantity.quantity :0;
                }
                data.itemInStock ={
                    itemInStock:stockCount,
                    unit:data.orderedQuantity[0].unit ? await getUnitNameAndIdById(data.orderedQuantity[0].unit) : 'NA'
                };
                let studentDetails = await getStudentNameClassNameByStudentIdClassIdBatchId(req.header('Authorization'),data['studentId'],data['classId'],data['batch']);
                data.studentDetails={
                    studentName:studentDetails.studentFullName.firstName + ' ' + studentDetails.studentFullName.lastName,
                    className: studentDetails.studentclassName.className,
                    batchName:studentDetails.studentBatchName.batchName
                };
                finalDataListing.push(data);
            }
            let msg = dataByGivenId.length
                ? MESSAGES.DATA_FOUND
                : MESSAGES.NO_DATA_FOUND;
            if(dataByGivenId.length){
                return await apiresponse(true, msg, 201, finalDataListing);
            }else{
                return await apiresponse(false, msg, 201, []);
            }
        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
};

const getStudentExchangeOrdersDetailsService = async (req, res)=>{
    try{
        let {itemFrom,orderId} = req.query;
        let finaldata;
        if(itemFrom === 'ITEM_MASTER'){
            let orderDetails = await inventoryStudentOrderMaster.aggregate([
                {
                    $match:{_id:new mongoose.Types.ObjectId(orderId)}
                },
                {
                    $lookup:{
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
                        itemName: 1,
                        itemMasterId:1,
                        orderId: 1,
                        transactionId: 1,
                        studentId: 1,
                        configurationId: 1,
                        subSessionId: 1,
                        classId: 1,
                        batch: 1,
                        orderedQuantity: 1,
                        itemInStock: 1,
                        orderedItemPrice: 1,
                        orderDate: 1,
                        estimatedPickUpDate:1,
                        orderStatus:1,
                        exchangeRequestDate:1,
                        itemImages:'$itemDetails.itemImages',
                        categoryId:'$itemDetails.categoryId',
                        subCategoryId:'$itemDetails.subCategoryId',
                        reorderPointData:'$itemDetails.reorderPointData',
                        exchangeData:1,
                        reasonForExchange:1
                    }
                }
            ]);
            let orderData=orderDetails[0];
            // console.log(orderData);
            // process.exit(0);
            if(orderData){
                let studentDetails =await getStudentAllDetails(req.header('Authorization'),orderData.studentId,orderData.classId,orderData.batch,orderData.configurationId,orderData.subSessionId);
                let studentData;
                if(studentDetails){
                    studentData={
                        studentName:studentDetails.studentFullName.firstName + ' ' + studentDetails.studentFullName.lastName,
                        className: studentDetails.studentclassName.className,
                        batchName:studentDetails.studentBatchName.batchName,
                        configurationName:studentDetails.configurationName.configurationName,
                        subSessionName:studentDetails.subSessionName
                    }
                }

                let imageArr=orderData.itemImages;
                let imgFinalArray = await Promise.all(imageArr.map(async(image) => {
                    const { documentID, ...rest } = image;
                    return {
                      path:await getImageFullPathById(documentID),
                      ...rest
                    };
                }));
                
                let stockDetails = await getItemStockById(orderData.itemMasterId,orderData.exchangeData[0].size);
                let stockCount = stockDetails ? stockDetails : 0;
                
                let itemInStockData ={
                    itemInStock:stockCount,
                    unit:orderData.orderedQuantity[0].unit ? await getUnitNameAndIdById(orderData.orderedQuantity[0].unit) : 'NA'
                };
                finaldata={
                    images:imgFinalArray,
                    orderDate:orderData.orderDate,
                    estimatedPickUpDate:orderData.estimatedPickUpDate,
                    orderId:orderData.orderId,
                    transactionId:orderData.transactionId,

                    studentData:studentData,

                    category: orderData.categoryId ? await getCategoryNameAndIdById(orderData.categoryId) : 'NA',
                    subCategory:orderData.subCategoryId ? await getSubcategoryNameAndIdById(orderData.subCategoryId) : 'NA',
                    orderedQuantity:orderData.orderedQuantity,
                    orderedItemPrice:orderData.orderedItemPrice,
                    itemName:orderData.itemName,
                    itemMasterId:orderData.itemMasterId,
                    itemInStock:itemInStockData,
                    reorderPointData:{
                        reorderPoint:orderData.reorderPointData ? orderData.reorderPointData.reorderPoint : 'NA',
                        unit:orderData.reorderPointData.unit ? await getUnitNameAndIdById(orderData.reorderPointData.unit) : 'NA'
                    },
                    orderStatus:orderData.orderStatus,
                    exchangeData:orderData.exchangeData,
                    reasonForExchange:orderData.reasonForExchange,
                    exchangeRequestDate:orderData.exchangeRequestDate

                }
            }else{
                return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
            }
        }else if(itemFrom === 'ITEM_KIT'){
            let orderDetails = await inventoryStudentOrderMaster.aggregate([
                {
                    $match:{_id:new mongoose.Types.ObjectId(orderId)}
                },
                {
                    $lookup:{
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
                        itemName: 1,
                        itemKitMasterId:1,
                        orderId: 1,
                        transactionId: 1,
                        studentId: 1,
                        configurationId: 1,
                        subSessionId: 1,
                        classId: 1,
                        batch: 1,
                        orderedQuantity: 1,
                        itemInStock: 1,
                        orderedItemPrice: 1,
                        orderDate: 1,
                        estimatedPickUpDate:1,
                        orderStatus:1,
                        exchangeRequestDate:1,
                        categoryId:'$itemKitDetails.categoryIds',
                        subCategoryId:'$itemKitDetails.subCategoryIds',
                        itemListingData:'$itemKitDetails.itemListingData',
                        reorderPointData:'$itemKitDetails.reorderPoint',
                        exchangeData:1,
                        reasonForExchange:1
                    }
                },
            ]);
            let orderData = orderDetails[0];
            if(orderData){
                let studentDetails =await getStudentAllDetails(req.header('Authorization'),orderData.studentId,orderData.classId,orderData.batch,orderData.configurationId,orderData.subSessionId);
                let studentData;
                if(studentDetails){
                    studentData={
                        studentName:studentDetails.studentFullName ? studentDetails.studentFullName.firstName : '' + ' ' + studentDetails.studentFullName ? studentDetails.studentFullName.lastName : '',
                        className: studentDetails.studentclassName.className,
                        batchName:studentDetails.studentBatchName.batchName,
                        configurationName:studentDetails.configurationName.configurationName,
                        subSessionName:studentDetails.subSessionName
                    }
                }
                let itemListingData = await Promise.all(orderData.itemListingData.map(async (item)=>{
                    let itemDetails = await getItemDetailsByItemId(item.itemMasterId);
                    return {
                        ...item,
                        itemDetails: itemDetails
                    }
                }));
                let stockDetails = await getKitStockById(orderData.itemKitMasterId);
                let stockCount = stockDetails.kitQuantity ? stockDetails.kitQuantity.quantity :0;
                finaldata={
                    orderDate:orderData.orderDate,
                    estimatedPickUpDate:orderData.estimatedPickUpDate,
                    orderId:orderData.orderId,
                    transactionId:orderData.transactionId,
                    studentData:studentData,
                    category: orderData.categoryId ? await getCategoriesNameByIds(orderData.categoryId) : 'NA',
                    subCategory:orderData.subCategoryId ? await getSubCategoryNameByIds(orderData.subCategoryId) : 'NA',
                    orderedQuantity:{
                        quantity:orderData.orderedQuantity[0].quantity,
                        unit:orderData.orderedQuantity[0].unit ? await getUnitNameAndIdById(orderData.orderedQuantity[0].unit) : 'NA'
                    },
                    orderedItemPrice:orderData.orderedItemPrice,
                    itemName:orderData.itemName,
                    itemKitMasterId:orderData.itemKitMasterId,
                    itemInStock:{
                        itemInStock:stockCount,
                        unit:orderData.orderedQuantity[0].unit ? await getUnitNameAndIdById(orderData.orderedQuantity[0].unit) : 'NA'
                    },
                    reorderPointData:orderData.reorderPointData ? orderData.reorderPointData : 'NA',
                    orderStatus:orderData.orderStatus,
                    itemListingData:itemListingData,
                    exchangeData:orderData.exchangeData,
                    reasonForExchange:orderData.reasonForExchange,
                    exchangeRequestDate:orderData.exchangeRequestDate
                }
            }else{
                return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
            }
            // console.log(orderDetails,'orderDetails');
        }
        // console.log(finaldata);
        const msg = finaldata ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
        return await apiresponse(true, msg, 201, finaldata);
    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const getStudentExchangeOrdersDetailsPdfService = async (req, res)=>{
    try{
        let {orderId,itemFrom} = req.params;
        // console.log(orderId,itemFrom);
        // process.exit(0);
        let finaldata;
        if(itemFrom === 'ITEM_MASTER'){
            let orderDetails = await inventoryStudentOrderMaster.aggregate([
                {
                    $match:{_id:new mongoose.Types.ObjectId(orderId)}
                },
                {
                    $lookup:{
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
                        itemName: 1,
                        itemMasterId:1,
                        orderId: 1,
                        transactionId: 1,
                        studentId: 1,
                        configurationId: 1,
                        subSessionId: 1,
                        classId: 1,
                        batch: 1,
                        orderedQuantity: 1,
                        itemInStock: 1,
                        orderedItemPrice: 1,
                        orderDate: 1,
                        estimatedPickUpDate:1,
                        orderStatus:1,
                        paymentMode:1,
                        categoryId:'$itemDetails.categoryId',
                        subCategoryId:'$itemDetails.subCategoryId',
                        exchangeData:1,
                        reasonForExchange:1,
                        itemId:'$itemDetails.itemId',
                        taxRate:'$itemDetails.taxRate'
                    }
                }
            ]);
            let orderData=orderDetails[0];
            if(orderData){
                let studentDetails =await getStudentAllDetails(req.header('Authorization'),orderData.studentId,orderData.classId,orderData.batch,orderData.configurationId,orderData.subSessionId);
                let studentData;
                if(studentDetails){
                    studentData={
                        studentName:studentDetails.studentFullName.firstName + ' ' + studentDetails.studentFullName.lastName,
                        className: studentDetails.studentclassName.className,
                        batchName:studentDetails.studentBatchName.batchName,
                        configurationName:studentDetails.configurationName.configurationName,
                        subSessionName:studentDetails.subSessionName,
                        studentUniqueCode:studentDetails.studentFullName ? studentDetails.studentFullName.studentBatchUniqueIds[0].uniqueId : 'NA'
                    }
                }

                finaldata={
                    itemFrom :'ITEM_MASTER',
                    orderDate: getDateFormate(orderData.orderDate),
                    estimatedPickUpDate: getDateFormate(orderData.estimatedPickUpDate),
                    orderId:orderData.orderId,
                    transactionId:orderData.transactionId ? orderData.transactionId : 'NA',

                    studentData:studentData,

                    category: orderData.categoryId ? await getCategoryNameAndIdById(orderData.categoryId) : 'NA',
                    subCategory:orderData.subCategoryId ? await getSubcategoryNameAndIdById(orderData.subCategoryId) : 'NA',
                    orderedQuantity:orderData.orderedQuantity,
                    orderedItemPrice:orderData.orderedItemPrice,
                    paymentMode:orderData.paymentMode,
                    itemName:orderData.itemName,
                    itemMasterId:orderData.itemMasterId,
                    exchangeData:orderData.exchangeData,
                    reasonForExchange:orderData.reasonForExchange,
                    itemId:orderData.itemId,
                    taxRate:await getTaxPercentageById(orderData.taxRate)
                }
            }else{
                return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
            }
        }else if(itemFrom === 'ITEM_KIT'){
            let orderDetails = await inventoryStudentOrderMaster.aggregate([
                {
                    $match:{_id:new mongoose.Types.ObjectId(orderId)}
                },
                {
                    $lookup:{
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
                        itemName: 1,
                        itemKitMasterId:1,
                        orderId: 1,
                        transactionId: 1,
                        studentId: 1,
                        configurationId: 1,
                        subSessionId: 1,
                        classId: 1,
                        batch: 1,
                        orderedQuantity: 1,
                        itemInStock: 1,
                        orderedItemPrice: 1,
                        orderDate: 1,
                        estimatedPickUpDate:1,
                        orderStatus:1,
                        paymentMode:1,
                        categoryId:'$itemKitDetails.categoryIds',
                        subCategoryId:'$itemKitDetails.subCategoryIds',
                        itemListingData:'$itemKitDetails.itemListingData',
                        reorderPointData:'$itemKitDetails.reorderPoint',
                        kitId:'$itemKitDetails.itemKitId',
                        exchangeData:1,
                        reasonForExchange:1
                    }
                },
            ]);
            let orderData = orderDetails[0];
            if(orderData){
                let studentDetails =await getStudentAllDetails(req.header('Authorization'),orderData.studentId,orderData.classId,orderData.batch,orderData.configurationId,orderData.subSessionId);
                let studentData;
                if(studentDetails){
                    studentData={
                        studentName:studentDetails.studentFullName.firstName + ' ' + studentDetails.studentFullName.lastName,
                        className: studentDetails.studentclassName.className,
                        batchName:studentDetails.studentBatchName.batchName,
                        configurationName:studentDetails.configurationName.configurationName,
                        subSessionName:studentDetails.subSessionName,
                        studentUniqueCode:studentDetails.studentFullName ? studentDetails.studentFullName.studentBatchUniqueIds[0].uniqueId : 'NA'
                    }
                }
                let itemListingData = await Promise.all(orderData.itemListingData.map(async (item)=>{
                    let itemDetails = await getItemDetailsByItemId(item.itemMasterId);
                    return {
                        ...item,
                        itemDetails: itemDetails
                    }
                }));
                let orderedItemCount = orderData.orderedQuantity.reduce((total, item) => total + item.quantity, 0);
                let orderedItemUnit = await getUnitNameById(orderData.orderedQuantity[0].unit);

                let categoryListing = await getCategoriesNameByIds(orderData.categoryId);
                let categoryData = '';
                categoryListing.map((category)=>{
                    categoryData = categoryData + category.categoryName + ' ,'
                })

                let subCategoryListing = await getSubCategoryNameByIds(orderData.subCategoryId);
                let subCategoryData = '';
                subCategoryListing.map((subCategory)=>{
                    subCategoryData = subCategoryData + subCategory.subCategoryName + ' ,'
                })
                // console.log(categoryData,'categoryData');
                // process.exit(0);
                finaldata={
                    itemFrom :'ITEM_KIT',
                    orderDate:getDateFormate(orderData.orderDate),
                    estimatedPickUpDate:getDateFormate(orderData.estimatedPickUpDate),
                    orderId:orderData.orderId,
                    transactionId:orderData.transactionId,
                    studentData:studentData,
                    paymentMode:orderData.paymentMode,
                    category: categoryData? categoryData : 'NA',
                    subCategory:subCategoryData ? subCategoryData : 'NA',
                    orderedItemCount:{
                        count:orderedItemCount,
                        unit:orderedItemUnit
                    },
                    orderedQuantity:{
                        quantity:orderData.orderedQuantity[0].quantity,
                        unit:orderData.orderedQuantity[0].unit ? await getUnitNameAndIdById(orderData.orderedQuantity[0].unit) : 'NA'
                    },
                    orderedItemPrice:orderData.orderedItemPrice,
                    itemName:orderData.itemName,
                    itemKitMasterId:orderData.itemKitMasterId,
                    itemInStock:{
                        itemInStock:orderData.itemInStock,
                        unit:orderData.orderedQuantity[0].unit ? await getUnitNameAndIdById(orderData.orderedQuantity[0].unit) : 'NA'
                    },
                    reorderPointData:orderData.reorderPointData ? orderData.reorderPointData : 'NA',
                    orderStatus:getStatusRealValueByStatusCodeForStudent(orderData.orderStatus),
                    itemListingData:itemListingData,
                    exchangeData:orderData.exchangeData,
                    reasonForExchange:orderData.reasonForExchange,
                    kitId:orderData.kitId
                }
            }else{
                return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
            }
        }
        return finaldata;
    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}


/*
1.) Do validation that given order exist or not
2.) Change the exchange status after confirming the order
3.) Update the stock after confirming the exchange
4.) send the exchanging confirmation notification to the user after exchange confirmed
*/
const confirmItemForExchangeRequestService = async (req ,res)=>{
    try{
        const instituteId = req.authData.data.instituteId;
        const staffId = req.authData.data.staffId;
        const orderId = req.body.orderId;
        const size = req.body.size;
        const exchangeQuantity = req.body.exchangeQuantity;
        const itemFrom = req.body.itemFrom;
        const isMarkedAsDamage = req.body.isMarkedAsDamage;
        const damagedQuantity = req.body.damagedQuantity;
        
        /* validate the exchange request */
        const orderDetails = await inventoryStudentOrderMaster.findOne({_id:orderId},{
            itemMasterId:1,
            itemKitMasterId:1,
            orderedQuantity:1,
            exchangeData:1,
            exchangeRaisedBy:1,
            isMarkedAsDamage:1
        });
        if(!orderDetails) return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
        if(orderDetails.isMarkedAsDamage && isMarkedAsDamage){
            return await apiresponse(false, MESSAGES.MARKED_AS_DAMAGE, 201, null);
        }

        const orderedSize = orderDetails.orderedQuantity[0].size;
        const orderedQuantity = orderDetails.orderedQuantity[0].quantity;
        
        const exchangeRaisedBy = orderDetails.exchangeRaisedBy;
        let exchangeRaisedStatus;
        if(exchangeRaisedBy === 'STUDENT'){
            exchangeRaisedStatus = 'STUDENT_REQ_EXCHANGE_DONE';
        }else if(exchangeRaisedBy === 'ADMIN'){
            exchangeRaisedStatus = 'ADMIN_ISSUED_EXCHANGE_DONE'
        }

        if(itemFrom === 'ITEM_MASTER'){
            let webStatusArr = [
                {
                    status : "Admin-Issued",
                    colorCode : "#007A1C"
                },
                {
                    status : "Exchange Done",
                    colorCode : "#007A1C"
                }
            ]
    
            let appStatus = {
                status : "Exchange Requested",
                backgroundColorCode : "#FFFBF1",
                colorCode:"#CF8E00"
            }
            /*Change the exchange status after confirming the order*/
            await inventoryStudentOrderMaster.updateOne(
                { _id: orderId, 'exchangeData.size': size },
                { $set: { 'exchangeData.$.exchangeStatusWeb': webStatusArr , exchangeCompleteDate : new Date() , 'exchangeData.$.exchangeStatusApp' : {
                    status : "Exchange Completed",
                    colorCode : "#024700",
                    backgroundColor : "#E8FFED"
                },orderStatusApp : {
                    status : "Exchange Completed",
                    colorCode : "#024700",
                    backgroundColor : "#E8FFED"
                },'exchangeData.$.isExchangeAccepted' : true} }
            );

            /*Update the stock after confirming the exchange*/
            await inventoryItemMaster.updateOne(
                {_id:orderDetails.itemMasterId,'itemSizes.size':size},
                { $inc: { 'itemSizes.$.itemQuantity.quantity': - exchangeQuantity } }
            );

            await inventoryItemMaster.updateOne(
                {_id:orderDetails.itemMasterId,'itemSizes.size':orderedSize},
                { $inc: { 'itemSizes.$.itemQuantity.quantity': + orderedQuantity } }
            );

        }else if(itemFrom === 'ITEM_KIT'){
            let webStatusArr = [
                {
                    status : "Admin-Issued",
                    colorCode : "#007A1C"
                },
                {
                    status : "Exchange Done",
                    colorCode : "#007A1C"
                }
            ]
    
            let appStatus = {
                status : "Exchange Requested",
                backgroundColorCode : "#FFFBF1",
                colorCode:"#CF8E00"
            }
            /*Change the exchange status after confirming the order*/
            await inventoryStudentOrderMaster.updateOne(
                { _id: orderId, 'exchangeData.size': size },
                { $set: { 'exchangeData.$.exchangeStatusWeb': webStatusArr , exchangeCompleteDate : new Date(),'exchangeData.$.exchangeStatusApp' : {
                    status : "Exchange Completed",
                    colorCode : "#024700",
                    backgroundColor : "#E8FFED"
                },orderStatusApp : {
                    status : "Exchange Completed",
                    colorCode : "#024700",
                    backgroundColor : "#E8FFED"
                },'exchangeData.$.isExchangeAccepted' : true} }
            );
        }
        /*send the exchanging confirmation notification to the user after exchange confirmed pending*/

        /*Marked as damage item -> move item to item damaged master*/
        if(isMarkedAsDamage){
            let data;
            if(itemFrom === 'ITEM_MASTER'){
                const itemDetails = await inventoryItemMaster.findOne({_id:orderDetails.itemMasterId},{itemSizes:1,itemName:1,fixedVendorId:1,categoryId:1,subCategoryId:1});
                data = {
                    instituteId:instituteId,
                    itemFrom:itemFrom,
                    itemMasterId:orderDetails.itemMasterId,
                    damagedQuantity:damagedQuantity,
                    issueType:'NONISSUED',
                    damageRaisedByUserId:staffId,
                    damageRaisedByUserType:'ADMIN',
                    fixedVendorId:itemDetails ? itemDetails.fixedVendorId : null,
                    itemName:itemDetails ? itemDetails.itemName :'NA',
                    categoryId:itemDetails.categoryId,
                    subCategoryId:itemDetails.subCategoryId
                }
            }else if(itemFrom === 'ITEM_KIT'){
                const itemDetails = await inventoryItemKitMaster.findOne({ _id: orderDetails.itemKitMasterId },{kitQuantity:1,itemKitName:1});
                data = {
                    instituteId:instituteId,
                    itemFrom:itemFrom,
                    itemKitMasterId:orderDetails.itemKitMasterId,
                    damagedQuantity:damagedQuantity,
                    issueType:'NONISSUED',
                    damageRaisedByUserId:staffId,
                    damageRaisedByUserType:'ADMIN',
                    itemName:itemDetails ? itemDetails.itemKitName :'NA'
                }
            }
            
            let damagedDone = await inventoryDamagedItemMaster.create(data);
            await inventoryStudentOrderMaster.updateOne({_id:orderId},{
                $set:{
                    isMarkedAsDamage:true,
                    exchangeCompleteDate : new Date(),
                    'exchangeData.$.exchangeStatusApp' : {
                        status : "Exchange Completed",
                        colorCode : "#024700",
                        backgroundColor : "#E8FFED"
                    },orderStatusApp : {
                        status : "Exchange Completed",
                        colorCode : "#024700",
                        backgroundColor : "#E8FFED"
                    },'exchangeData.$.isExchangeAccepted' : true,
                    updatedAt: new Date()
                }
            });
        }
        return await apiresponse(true, MESSAGES.INVENTORY.EXCHANGE.CONFIRM_EXCHANGE, 201, null);
    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const rejectItemForExchangeRequestService = async (req ,res)=>{
    try{
        const instituteId = req.authData.data.instituteId;
        const staffId = req.authData.data.staffId;
        const orderId = req.body.orderId;
        const size = req.body.size;
        const itemFrom = req.body.itemFrom;
        const isMarkedAsDamage = req.body.isMarkedAsDamage;
        const damagedQuantity = req.body.damagedQuantity;
        
        /* validate the exchange request */
        const orderDetails = await inventoryStudentOrderMaster.findOne({_id:orderId},{
            itemMasterId:1,
            itemKitMasterId:1,
            orderedQuantity:1,
            exchangeData:1,
            exchangeRaisedBy:1,
            isMarkedAsDamage:1
        });
        if(!orderDetails) return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
        if(orderDetails.isMarkedAsDamage && isMarkedAsDamage){
            return await apiresponse(false, MESSAGES.MARKED_AS_DAMAGE, 201, null);
        }
        const exchangeRaisedStatus = 'EXCHANGE_REJECTED';

        if(itemFrom === 'ITEM_MASTER'){
            let webStatusArr = [
                {
                    status : "Echange Rejected",
                    colorCode : "#DC3545"
                }
            ]
            /*Change the exchange status after confirming the order*/
            await inventoryStudentOrderMaster.updateOne(
                { _id: orderId, 'exchangeData.size': size },
                { $set: { 'exchangeData.$.exchangeStatusWebs': webStatusArr , 
                exchangeRejectDate : new Date(),
                'exchangeData.$.exchangeStatusApp' : {
                    status : "Exchange Rejected",
                    colorCode : "#6C131C",
                    backgroundColor : "#FEE7E7"
                },orderStatusApp:{
                    status : "Exchange Rejected",
                    colorCode : "#6C131C",
                    backgroundColor : "#FEE7E7"
                },'exchangeData.$.isExchangeRejected' : true
            } }
            );

        }else if(itemFrom === 'ITEM_KIT'){
            let webStatusArr = [
                {
                    status : "Echange Rejected",
                    colorCode : "#DC3545"
                }
            ]
            /*Change the exchange status after confirming the order*/
            await inventoryStudentOrderMaster.updateOne(
                { _id: orderId, 'exchangeData.size': size },
                { $set: { 'exchangeData.$.exchangeStatusWeb': webStatusArr,
                exchangeRejectDate : new Date(), 'exchangeData.$.exchangeStatusApp' : {
                    status : "Exchange Rejected",
                    colorCode : "#6C131C",
                    backgroundColor : "#FEE7E7"
                },orderStatusApp:{
                    status : "Exchange Rejected",
                    colorCode : "#6C131C",
                    backgroundColor : "#FEE7E7"
                },'exchangeData.$.isExchangeRejected' : true} }
            );
            
        }
        /*send the exchanging rejection notification to the user after exchange confirmed pending*/
        /*Marked as damage item -> move item to item damaged master*/
        if(isMarkedAsDamage){
            let data;
            if(itemFrom === 'ITEM_MASTER'){
                const itemDetails = await inventoryItemMaster.findOne({_id:orderDetails.itemMasterId},{itemSizes:1,itemName:1,fixedVendorId:1,categoryId:1,subCategoryId:1});
                data = {
                    instituteId:instituteId,
                    itemFrom:itemFrom,
                    itemMasterId:orderDetails.itemMasterId,
                    damagedQuantity:damagedQuantity,
                    issueType:'NONISSUED',
                    damageRaisedByUserId:staffId,
                    damageRaisedByUserType:'ADMIN',
                    fixedVendorId:itemDetails ? itemDetails.fixedVendorId : 'NA',
                    itemName:itemDetails ? itemDetails.itemName :'NA',
                    categoryId:itemDetails.categoryId,
                    subCategoryId:itemDetails.subCategoryId
                }
            }else if(itemFrom === 'ITEM_KIT'){
                const itemDetails = await inventoryItemKitMaster.findOne({ _id: orderDetails.itemKitMasterId },{kitQuantity:1,itemKitName:1});
                data = {
                    instituteId:instituteId,
                    itemFrom:itemFrom,
                    itemKitMasterId:orderDetails.itemKitMasterId,
                    damagedQuantity:damagedQuantity,
                    issueType:'NONISSUED',
                    damageRaisedByUserId:staffId,
                    damageRaisedByUserType:'ADMIN',
                    itemName:itemDetails ? itemDetails.itemKitName :'NA'
                }
            }
            
            let damagedDone = await inventoryDamagedItemMaster.create(data);
            await inventoryStudentOrderMaster.updateOne({_id:orderId},{
                $set:{
                    isMarkedAsDamage:true,
                    exchangeRejectDate : new Date(),
                    'exchangeData.$.exchangeStatusApp' : {
                        status : "Exchange Rejected",
                        colorCode : "#6C131C",
                        backgroundColor : "#FEE7E7"
                    },orderStatusApp:{
                        status : "Exchange Rejected",
                        colorCode : "#6C131C",
                        backgroundColor : "#FEE7E7"
                    },'exchangeData.$.isExchangeRejected' : true,
                    updatedAt: new Date()
                }
            });
        }
        return await apiresponse(true, MESSAGES.INVENTORY.EXCHANGE.REJECT_EXCHANGE, 201, null);
    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

/* helper funtion to check the stock */
const checkStock = async (stock, orderRequest) => {
    let errorMessage = null;
    for (const item of orderRequest) {
        const matchingStockItem = stock.find(stockItem => stockItem.size === item.size);
        // console.log(matchingStockItem,'matchingStockItem');
        if (!matchingStockItem) {
            errorMessage = `${item.size} is not in stock.`;
            return await apiresponse(false, errorMessage, 201);
        }

        if (item.quantity > matchingStockItem.itemQuantity.quantity) {
            errorMessage = `Not enough ${item.size} in stock.`;
            return await apiresponse(false, errorMessage, 201);
        }
    }
    return await apiresponse(true, 'Item is in stock.', 201);
}

const assignItemExchangeManuallyToStudentService = async (req, res)=>{
    try{
        const instituteId = req.authData.data.instituteId;
        const staffId = req.authData.data.staffId;
        const orderId = req.body.orderId;
        const exchangeData = req.body.exchangeData;
        const reasonForExchange = req.body.reasonForExchange;
        const isMarkedAsDamage = req.body.isMarkedAsDamage;
        const damagedQuantity = req.body.damagedQuantity;
        
        let orderDetails = await inventoryStudentOrderMaster.findOne({_id:orderId});
        if(!orderDetails) return await apiresponse(false, MESSAGES.INVENTORY.APP.INVALID_ORDERID, 201, null);
        // if(
        //     orderDetails.orderStatus === 'STUDENT_ORDER_REJECTED' || 
        //     orderDetails.orderStatus === 'STUDENT_CANCELLED_ORDER' || 
        //     orderDetails.orderStatus === 'STUDENT_ORDER_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP' ||
        //     orderDetails.orderStatus === 'ADMIN_ISSUED_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP' ||
        //     orderDetails.orderStatus === 'ADMIN_ISSUED_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP'
        //     ) return await apiresponse(false, MESSAGES.INVENTORY.EXCHANGE.EXCHANGE_FOR_REJECT_ORDER, 201, null);

        if(orderDetails.isMarkedAsDamage && isMarkedAsDamage){
            return await apiresponse(false, MESSAGES.MARKED_AS_DAMAGE, 201, null);
        }
        /* Validation that item is in stock or not.*/
        const itemFrom = orderDetails.itemFrom;
        let itemDetails;
        if(itemFrom === 'ITEM_MASTER'){
            itemDetails = await inventoryItemMaster.findOne({_id:orderDetails.itemMasterId},{itemSizes:1,itemName:1,fixedVendorId:1,categoryId:1,subCategoryId:1});
            const stockRes = await checkStock(itemDetails.itemSizes,exchangeData);
            if(stockRes.success === false) return stockRes;
           
        }else if(itemFrom === 'ITEM_KIT'){
            itemDetails = await inventoryItemKitMaster.findOne({ _id: orderDetails.itemKitMasterId },{kitQuantity:1,itemKitName:1});
            const kitStock = itemDetails.kitQuantity.quantity;
            const orderedQuantity = exchangeData[0];
            if(orderedQuantity.quantity > kitStock) return await apiresponse(false, 'Not enough item kit in stock.', 201);
        }
        let webStatusArr = [
            {
                status : "Admin-Issued",
                colorCode : "#C45806"
            },
            {
                status : "Awaiting Pickup",
                colorCode : "#C45806"
            }
        ]

        let appStatus = {
            status : "Exchange Requested",
            backgroundColorCode : "#FFFBF1",
            colorCode:"#CF8E00"
        }
        /*Update the exchange data field order master table*/
        await inventoryStudentOrderMaster.updateOne(
            {_id:orderId},
            {
                $set:{
                    exchangeData:exchangeData.map((exData)=>{
                        return {
                            size:exData.size,
                            quantity:exData.quantity,
                            unit:new mongoose.Types.ObjectId(exData.unit),
                            exchangeItemPrice:exData.exchangeItemPrice,
                            exchangeStatusApp:appStatus,
                            exchangeStatusWeb : webStatusArr
                        }
                    }),
                    reasonForExchange:reasonForExchange,
                    exchangeRaisedBy:'ADMIN',
                    isExchangeRequested : true,
                    exchangeRequestDate:new Date(),
                    updatedAt: new Date()
                }
            }
        );

        const size = exchangeData[0].size;
        const orderedSize = orderDetails.orderedQuantity[0].size;
        // /*Update the stock after the assignment of the item by amdin*/
        // if(itemFrom === 'ITEM_MASTER'){
        //     await inventoryItemMaster.updateOne(
        //         {_id:orderDetails.itemMasterId,'itemSizes.size':size},
        //         { $inc: 
        //             {
        //                 'itemSizes.$.itemQuantity.quantity': - 1,
        //                 'itemSizes.$.totalSellingPrice':  - exchangeData[0].exchangeItemPrice*1
        //             } 
        //         }
        //     );
            
        //     if(!isMarkedAsDamage){
        //         await inventoryItemMaster.updateOne(
        //             {_id:orderDetails.itemMasterId,'itemSizes.size':orderedSize},
        //             { $inc: 
        //                 {
        //                     'itemSizes.$.itemQuantity.quantity': + 1 ,
        //                     'itemSizes.$.totalSellingPrice':  orderDetails.orderedQuantity[0].orderedItemPricePerUnit
        //                 } 
        //             }
        //         );
        //     }
        // }

        /*Marked as damage item -> move item to item damaged master*/
        if(isMarkedAsDamage){
            let data;
            if(itemFrom === 'ITEM_MASTER'){
                data = {
                    instituteId:instituteId,
                    itemFrom:itemFrom,
                    itemMasterId:orderDetails.itemMasterId,
                    damagedQuantity:damagedQuantity,
                    issueType:'NONISSUED',
                    damageRaisedByUserId:staffId,
                    damageRaisedByUserType:'ADMIN',
                    fixedVendorId:itemDetails ? itemDetails.fixedVendorId : null,
                    itemName:itemDetails ? itemDetails.itemName :'NA',
                    categoryId:itemDetails.categoryId,
                    subCategoryId:itemDetails.subCategoryId
                }
            }else if(itemFrom === 'ITEM_KIT'){
                data = {
                    instituteId:instituteId,
                    itemFrom:itemFrom,
                    itemKitMasterId:orderDetails.itemKitMasterId,
                    damagedQuantity:damagedQuantity,
                    issueType:'NONISSUED',
                    damageRaisedByUserId:staffId,
                    damageRaisedByUserType:'ADMIN',
                    fixedVendorId:null,
                    itemName:itemDetails ? itemDetails.itemKitName :'NA'
                }
            }
            let damagedDone = await inventoryDamagedItemMaster.create(data);
            await inventoryStudentOrderMaster.updateOne({_id:orderId},{
                $set:{
                    isMarkedAsDamage:true,
                    updatedAt: new Date()
                }
            });
        }
        return await apiresponse(true, MESSAGES.INVENTORY.EXCHANGE.ASSIGN_ITEM_EXCHANGE, 201, null);

    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}


/*
 *staff exchange order section
 */
const getStaffExchangeOrdersListingService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;

    const orderDate = req.query
        ? req.query.orderDate
            ? req.query.orderDate
            : ''
        : '';
    const exchangeRequestDate = req.query
        ? req.query.exchangeRequestDate
            ? req.query.exchangeRequestDate
            : ''
        : '';
    const exchangeStatus = req.query
    ? req.query.exchangeStatus
        ? req.query.exchangeStatus
        : ''
    : '';
    
    let conditionObj = { status: true, instituteId: instituteId,reasonForExchange: { $ne: '' } };

    
    // console.log(conditionObj);
    // process.exit(0);
    try {
        let queryArray = [
            {
                $match: conditionObj
            },
            {
                $project: {
                    _id: 1,
                    itemMasterId:1,
                    itemName:1,
                    orderId: 1,
                    transactionId: 1,
                    staffId:1,
                    orderedQuantity:1,
                    itemInStock:1,
                    orderedItemPrice:1,
                    paymentMode:1,
                    isPriceApplicable:1,
                    paymentStatus:1,
                    estimatedPickUpDate: 1,
                    orderDate: 1,
                    orderStatus:1,
                    orderBy:1,
                    exchangeData:1,
                    reasonForExchange:1,
                    exchangeRequestDate:1,
                    exchangeRaisedBy:1
                }
            },
            { $unwind: '$exchangeData' }
        ];
        if (exchangeStatus) {
            queryArray.push({
                $match:{
                    'exchangeData.exchangeStatus':exchangeStatus
                }
            });
        }
        if (orderDate) {
            queryArray.push({
                $match: {
                    $expr: {
                        $eq: [
                            { $dateToString: { format: '%Y-%m-%d', date: '$orderDate' } },
                            { $dateToString: { format: '%Y-%m-%d', date: new Date(orderDate) } }
                        ]
                    }
                }
            });
        }
        if (exchangeRequestDate) {
            queryArray.push({
                $match: {
                    $expr: {
                        $eq: [
                            { $dateToString: { format: '%Y-%m-%d', date: '$exchangeRequestDate' } },
                            { $dateToString: { format: '%Y-%m-%d', date: new Date(exchangeRequestDate) } }
                        ]
                    }
                }
            });
        }
        // console.log(queryArray);
        // process.exit(0);
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

            let aggregationResult = await inventoryStaffOrderMaster.aggregate(queryArray);

            let total = aggregationResult[0].total[0] ? aggregationResult[0].total[0].count : 0;
            let dataListing = aggregationResult[0].data;
            
            let finalDataListing = [];
            for (let data of dataListing) {
                let stockDetails = await getItemStockById(data.itemMasterId,data.exchangeData.size);
                let stockCount = stockDetails ? stockDetails : 0;
                data.itemInStock = {
                    itemInStock:stockCount,
                    unit:data.orderedQuantity[0].unit ? await getUnitNameAndIdById(data.orderedQuantity[0].unit) : 'NA'
                };
                let staffDetails = await getStaffDetails(req.header('Authorization'),data.staffId);
               
                data.staffDetails=staffDetails;
                finalDataListing.push(data);
            }
            
            let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
            if(total){
                let result = {
                    rows: finalDataListing,
                    total: total
                };
                return await apiresponse(true, msg, 201, result);
            }else{
                return await apiresponse(false, msg, 201, []);
            }
        } else {
            let dataByGivenId = await inventoryStaffOrderMaster.aggregate(queryArray);
            let finalDataListing=[];
            for (let data of dataByGivenId) {
                let stockDetails = await getItemStockById(data.itemMasterId,data.exchangeData.size);
                let stockCount = stockDetails ? stockDetails : 0;
                data.itemInStock ={
                    itemInStock:stockCount,
                    unit:data.orderedQuantity[0].unit ? await getUnitNameAndIdById(data.orderedQuantity[0].unit) : 'NA'
                };
                let staffDetails = await getStaffDetails(req.header('Authorization'),data.staffId);
                
                data.staffDetails=staffDetails;
                finalDataListing.push(data);
            }
            let msg = dataByGivenId.length
                ? MESSAGES.DATA_FOUND
                : MESSAGES.NO_DATA_FOUND;
            if(dataByGivenId.length){
                return await apiresponse(true, msg, 201, finalDataListing);
            }else{
                return await apiresponse(false, msg, 201, []);
            }
        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
};

const getStaffExchangeOrdersDetailsService = async (req, res)=>{
    try{
        let {orderId} = req.params;
        let finaldata;
        let orderDetails = await inventoryStaffOrderMaster.aggregate([
            {
                $match:{_id:new mongoose.Types.ObjectId(orderId)}
            },
            {
                $lookup:{
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
                    _id: 1,
                    itemMasterId:1,
                    itemName:1,
                    orderId: 1,
                    transactionId: 1,
                    staffId:1,
                    orderedQuantity:1,
                    itemInStock:1,
                    orderedItemPrice:1,
                    paymentMode:1,
                    isPriceApplicable:1,
                    paymentStatus:1,
                    estimatedPickUpDate: 1,
                    orderDate: 1,
                    orderStatus:1,
                    orderBy:1,
                    exchangeData:1,
                    reasonForExchange:1,
                    exchangeRequestDate:1,
                    exchangeRaisedBy:1,
                    itemImages:'$itemDetails.itemImages',
                    categoryId:'$itemDetails.categoryId',
                    subCategoryId:'$itemDetails.subCategoryId',
                    reorderPointData:'$itemDetails.reorderPointData',
                }
            }
        ]);
        let orderData=orderDetails[0];
        // return await apiresponse(true, 'msg', 201, orderData);
        // console.log(orderData);
        // process.exit(0);
        if(orderData){
            let staffDetails = await getStaffDetails(req.header('Authorization'),orderData.staffId);
            let imageArr=orderData.itemImages;
            let imgFinalArray = await Promise.all(imageArr.map(async(image) => {
                const { documentID, ...rest } = image;
                return {
                    path:await getImageFullPathById(documentID),
                    ...rest
                };
            }));
            let stockDetails = await getItemStockById(orderData.itemMasterId,orderData.exchangeData[0].size);
            let stockCount = stockDetails ? stockDetails : 0
            let itemInStockData ={
                itemInStock:stockCount,
                unit:orderData.orderedQuantity[0].unit ? await getUnitNameAndIdById(orderData.orderedQuantity[0].unit) : 'NA'
            };
            finaldata={
                images:imgFinalArray,
                orderDate:orderData.orderDate,
                estimatedPickUpDate:orderData.estimatedPickUpDate,
                orderId:orderData.orderId,
                transactionId:orderData.transactionId,

                staffDetails:staffDetails,

                category: orderData.categoryId ? await getCategoryNameAndIdById(orderData.categoryId) : 'NA',
                subCategory:orderData.subCategoryId ? await getSubcategoryNameAndIdById(orderData.subCategoryId) : 'NA',
                orderedQuantity:orderData.orderedQuantity,
                orderedItemPrice:orderData.orderedItemPrice,
                itemName:orderData.itemName,
                itemMasterId:orderData.itemMasterId,
                itemInStock:itemInStockData,
                reorderPointData:{
                    reorderPoint:orderData.reorderPointData ? orderData.reorderPointData.reorderPoint : 'NA',
                    unit:orderData.reorderPointData.unit ? await getUnitNameAndIdById(orderData.reorderPointData.unit) : 'NA'
                },
                orderStatus:orderData.orderStatus,
                exchangeData:orderData.exchangeData,
                reasonForExchange:orderData.reasonForExchange,
                exchangeRequestDate:orderData.exchangeRequestDate
            }
            const msg = finaldata ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
            return await apiresponse(true, msg, 201, finaldata);
        }else{
            return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
        }
    
    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const confirmItemForExchangeRequestOfStaffService = async (req ,res)=>{
    try{
        const instituteId = req.authData.data.instituteId;
        const staffId = req.authData.data.staffId;
        const orderId = req.body.orderId;
        const size = req.body.size;
        const exchangeQuantity = req.body.exchangeQuantity;
        const isMarkedAsDamage = req.body.isMarkedAsDamage;
        const damagedQuantity = req.body.damagedQuantity;

        /* validate the exchange request */
        const orderDetails = await inventoryStaffOrderMaster.findOne({_id:orderId},{
            itemMasterId:1,
            orderedQuantity:1,
            exchangeData:1,
            exchangeRaisedBy:1,
            isMarkedAsDamage:1
        });
        if(!orderDetails) return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
        if(orderDetails.isMarkedAsDamage && isMarkedAsDamage){
            return await apiresponse(false, MESSAGES.MARKED_AS_DAMAGE, 201, null);
        }
        // console.log(orderDetails);
        // process.exit(0);
        const orderedSize = orderDetails.orderedQuantity[0].size;
        const orderedQuantity = orderDetails.orderedQuantity[0].quantity;
        
        const exchangeRaisedBy = orderDetails.exchangeRaisedBy;
        let exchangeRaisedStatus;
        if(exchangeRaisedBy === 'STAFF'){
            exchangeRaisedStatus = 'STAFF_REQ_EXCHANGE_DONE';
        }else if(exchangeRaisedBy === 'ADMIN'){
            exchangeRaisedStatus = 'ADMIN_ISSUED_EXCHANGE_DONE'
        }
        let webStatusArr = [
            {
                status : "Admin-Issued",
                colorCode : "#007A1C"
            },
            {
                status : "Exchange Done",
                colorCode : "#007A1C"
            }
        ]

        let appStatus = {
            status : "Exchange Requested",
            backgroundColorCode : "#FFFBF1",
            colorCode:"#CF8E00"
        }
        
        /*Change the exchange status after confirming the order*/
        await inventoryStaffOrderMaster.updateOne(
            { _id: orderId, 'exchangeData.size': size },
            { $set: { 'exchangeData.$.exchangeStatus': webStatusArr , exchangeCompleteDate : new Date() ,'exchangeData.$.exchangeStatusApp' : {
                status : "Exchange Completed",
                colorCode : "#024700",
                backgroundColor : "#E8FFED"
            },orderStatusApp : {
                status : "Exchange Completed",
                colorCode : "#024700",
                backgroundColor : "#E8FFED"
            },'exchangeData.$.isExchangeAccepted' : true} }
        );

        /*Update the stock after confirming the exchange*/
        await inventoryItemMaster.updateOne(
            {_id:orderDetails.itemMasterId,'itemSizes.size':size},
            { $inc: { 'itemSizes.$.itemQuantity.quantity': - exchangeQuantity } }
        );

        await inventoryItemMaster.updateOne(
            {_id:orderDetails.itemMasterId,'itemSizes.size':orderedSize},
            { $inc: { 'itemSizes.$.itemQuantity.quantity': + orderedQuantity } }
        );

        
        /*send the exchanging confirmation notification to the user after exchange confirmed pending*/

        /*Marked as damage item -> move item to item damaged master*/
        if(isMarkedAsDamage){
            const itemDetails = await inventoryItemMaster.findOne({_id:orderDetails.itemMasterId},{itemSizes:1,itemName:1,fixedVendorId:1,categoryId:1,subCategoryId:1});
            let data = {
                instituteId:instituteId,
                itemFrom:'ITEM_MASTER',
                itemMasterId:orderDetails.itemMasterId,
                damagedQuantity:damagedQuantity,
                issueType:'NONISSUED',
                damageRaisedByUserId:staffId,
                damageRaisedByUserType:'ADMIN',
                fixedVendorId:itemDetails ? itemDetails.fixedVendorId : 'NA',
                itemName:itemDetails ? itemDetails.itemName :'NA',
                categoryId:itemDetails.categoryId,
                subCategoryId:itemDetails.subCategoryId
            }
            let damagedDone = await inventoryDamagedItemMaster.create(data);
            await inventoryStaffOrderMaster.updateOne({_id:orderId},{
                $set:{
                    isMarkedAsDamage:true, exchangeCompleteDate : new Date(),
                    'exchangeData.$.exchangeStatusApp' : {
                        status : "Exchange Completed",
                        colorCode : "#024700",
                        backgroundColor : "#E8FFED"
                    },orderStatusApp : {
                        status : "Exchange Completed",
                        colorCode : "#024700",
                        backgroundColor : "#E8FFED"
                    },'exchangeData.$.isExchangeAccepted' : true,
                    updatedAt: new Date()
                }
            });
        }
        return await apiresponse(true, MESSAGES.INVENTORY.EXCHANGE.CONFIRM_EXCHANGE, 201, null);
    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const rejectItemForExchangeRequestOfStaffService = async (req ,res)=>{
    try{
        const instituteId = req.authData.data.instituteId;
        const staffId = req.authData.data.staffId;
        const orderId = req.body.orderId;
        const size = req.body.size;
        const isMarkedAsDamage = req.body.isMarkedAsDamage;
        const damagedQuantity = req.body.damagedQuantity;
        
        /* validate the exchange request */
        const orderDetails = await inventoryStaffOrderMaster.findOne({_id:orderId},{
            itemMasterId:1,
            orderedQuantity:1,
            exchangeData:1,
            exchangeRaisedBy:1,
            isMarkedAsDamage:1
        });
        if(!orderDetails) return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
        if(orderDetails.isMarkedAsDamage && isMarkedAsDamage){
            return await apiresponse(false, MESSAGES.MARKED_AS_DAMAGE, 201, null);
        }
        const exchangeRaisedStatus = 'EXCHANGE_REJECTED';
        let webStatusArr = [
            {
                status : "Echange Rejected",
                colorCode : "#DC3545"
            }
        ]
        /*Change the exchange status after confirming the order*/
        await inventoryStaffOrderMaster.updateOne(
            { _id: orderId, 'exchangeData.size': size },
            { $set: { 'exchangeData.$.exchangeStatusWeb': webStatusArr ,exchangeRejectDate : new Date(),'exchangeData.$.exchangeStatusApp' : {
                status : "Exchange Rejected",
                colorCode : "#6C131C",
                backgroundColor : "#FEE7E7"
            },orderStatusApp:{
                status : "Exchange Rejected",
                colorCode : "#6C131C",
                backgroundColor : "#FEE7E7"
            },'exchangeData.$.isExchangeRejected' : true} }
        );
        
        /*Marked as damage item -> move item to item damaged master*/
        if(isMarkedAsDamage){
            const itemDetails = await inventoryItemMaster.findOne({_id:orderDetails.itemMasterId},{itemSizes:1,itemName:1,fixedVendorId:1,categoryId:1,subCategoryId:1});
            let data = {
                instituteId:instituteId,
                itemFrom:'ITEM_MASTER',
                itemMasterId:orderDetails.itemMasterId,
                damagedQuantity:damagedQuantity,
                issueType:'NONISSUED',
                damageRaisedByUserId:staffId,
                damageRaisedByUserType:'ADMIN',
                fixedVendorId:itemDetails ? itemDetails.fixedVendorId : 'NA',
                itemName:itemDetails ? itemDetails.itemName :'NA',
                categoryId:itemDetails.categoryId,
                subCategoryId:itemDetails.subCategoryId
            }
            let damagedDone = await inventoryDamagedItemMaster.create(data);
            await inventoryStaffOrderMaster.updateOne({_id:orderId},{
                $set:{
                    isMarkedAsDamage:true,
                    exchangeRejectDate : new Date(),
                    'exchangeData.$.exchangeStatusApp' : {
                        status : "Exchange Rejected",
                        colorCode : "#6C131C",
                        backgroundColor : "#FEE7E7"
                    },orderStatusApp:{
                        status : "Exchange Rejected",
                        colorCode : "#6C131C",
                        backgroundColor : "#FEE7E7"
                    },'exchangeData.$.isExchangeRejected' : true,
                    updatedAt: new Date()
                }
            });
        }
        return await apiresponse(true, MESSAGES.INVENTORY.EXCHANGE.REJECT_EXCHANGE, 201, null);

        
        /*send the exchanging rejection notification to the user after exchange confirmed pending*/

    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const assignItemExchangeManuallyToStaffService = async (req, res)=>{
    try{
        const instituteId = req.authData.data.instituteId;
        const staffId = req.authData.data.staffId;
        const orderId = req.body.orderId;
        const exchangeData = req.body.exchangeData;
        const reasonForExchange = req.body.reasonForExchange;
        const isMarkedAsDamage = req.body.isMarkedAsDamage;
        const damagedQuantity = req.body.damagedQuantity;
        
        let orderDetails = await inventoryStaffOrderMaster.findOne({_id:orderId});
        if(!orderDetails) return await apiresponse(false, MESSAGES.INVENTORY.APP.INVALID_ORDERID, 201, null);
        // if(
        //     orderDetails.orderStatus === 'STAFF_ORDER_REJECTED' || 
        //     orderDetails.orderStatus === 'STAFF_CANCELLED_ORDER' || 
        //     orderDetails.orderStatus === 'STAFF_ORDER_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP' ||
        //     orderDetails.orderStatus === 'ADMIN_ISSUED_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP' ||
        //     orderDetails.orderStatus === 'ADMIN_ISSUED_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP'
        //     ) return await apiresponse(false, MESSAGES.INVENTORY.EXCHANGE.EXCHANGE_FOR_REJECT_ORDER, 201, null);
        // if(orderDetails.isMarkedAsDamage){
        //     return await apiresponse(false, MESSAGES.MARKED_AS_DAMAGE, 201, null);
        // }

        /* Validation that item is in stock or not.*/
        let itemDetails = await inventoryItemMaster.findOne({_id:orderDetails.itemMasterId},{itemSizes:1,itemName:1,fixedVendorId:1,categoryId:1,subCategoryId:1});
        const stockRes = await checkStock(itemDetails.itemSizes,exchangeData);
        if(stockRes.success === false) return stockRes;
        let webStatusArr = [
            {
                status : "Admin-Issued",
                colorCode : "#C45806"
            },
            {
                status : "Awaiting Pickup",
                colorCode : "#C45806"
            }
        ]

        let appStatus = {
            status : "Exchange Requested",
            backgroundColorCode : "#FFFBF1",
            colorCode:"#CF8E00"
        }
        /*Update the exchange data field order master table*/
        await inventoryStaffOrderMaster.updateOne(
            {_id:orderId},
            {
                $set:{
                    exchangeData:exchangeData.map((exData)=>{
                        return {
                            size:exData.size,
                            quantity:exData.quantity,
                            unit:new mongoose.Types.ObjectId(exData.unit),
                            exchangeItemPrice:exData.exchangeItemPrice,
                            exchangeStatusApp:appStatus,
                            webStatusArr : webStatusArr
                        }
                    }),
                    reasonForExchange:reasonForExchange,
                    exchangeRaisedBy:'ADMIN',
                    isExchangeRequested : true,
                    exchangeRequestDate:new Date(),
                    updatedAt: new Date()
                }
            }
        );

        const size = exchangeData[0].size;
        const orderedSize = orderDetails.orderedQuantity[0].size;
        
        /*Update the stock after the assignment of the item by admin*/
        // await inventoryItemMaster.updateOne(
        //     {_id:orderDetails.itemMasterId,'itemSizes.size':size},
        //     { $inc: {
        //          'itemSizes.$.itemQuantity.quantity': - 1 ,
        //          'itemSizes.$.totalSellingPrice':  - exchangeData[0].exchangeItemPrice*1
        //         } 
        //     }
        // );

        // if(!isMarkedAsDamage){
        //     const totalSellingPriceIncrement = orderDetails.orderedQuantity[0].orderedItemPricePerUnit;
        //     let updateOperation = {
        //         $inc: {
        //             'itemSizes.$.itemQuantity.quantity': + 1
        //         }
        //     };

        //     if (totalSellingPriceIncrement !== 0) {
        //         updateOperation.$inc['itemSizes.$.totalSellingPrice'] = totalSellingPriceIncrement;
        //     }
            
        //     await inventoryItemMaster.updateOne(
        //         { _id: orderDetails.itemMasterId, 'itemSizes.size': orderedSize },
        //         updateOperation
        //     );
        // }
        
        /*Marked as damage item -> move item to item damaged master*/
        if(isMarkedAsDamage){
            let data = {
                instituteId:instituteId,
                itemFrom:'ITEM_MASTER',
                itemMasterId:orderDetails.itemMasterId,
                damagedQuantity:damagedQuantity,
                issueType:'NONISSUED',
                damageRaisedByUserId:staffId,
                damageRaisedByUserType:'ADMIN',
                fixedVendorId:itemDetails ? itemDetails.fixedVendorId : 'NA',
                itemName:itemDetails ? itemDetails.itemName :'NA',
                categoryId:itemDetails.categoryId,
                subCategoryId:itemDetails.subCategoryId
            }
            let damagedDone = await inventoryDamagedItemMaster.create(data);
            await inventoryStaffOrderMaster.updateOne({_id:orderId},{
                $set:{
                    isMarkedAsDamage:true,
                    updatedAt: new Date()
                }
            });
        }
        return await apiresponse(true, MESSAGES.INVENTORY.EXCHANGE.ASSIGN_ITEM_EXCHANGE, 201, null);

    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const getStaffExchangeOrdersDetailsPdfPdfService = async (req, res)=>{
    try{
        let {orderId} = req.params;
        // console.log(orderId);
        // process.exit(0);
        let finaldata;
        let orderDetails = await inventoryStaffOrderMaster.aggregate([
            {
                $match:{_id:new mongoose.Types.ObjectId(orderId)}
            },
            {
                $lookup:{
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
                    itemName: 1,
                    itemMasterId:1,
                    orderId: 1,
                    transactionId: 1,
                    staffId:1,
                    orderedQuantity: 1,
                    itemInStock: 1,
                    orderedItemPrice: 1,
                    orderDate: 1,
                    estimatedPickUpDate:1,
                    orderStatus:1,
                    paymentMode:1,
                    categoryId:'$itemDetails.categoryId',
                    subCategoryId:'$itemDetails.subCategoryId',
                    exchangeData:1,
                    reasonForExchange:1,
                    itemId:'$itemDetails.itemId',
                    taxRate:'$itemDetails.taxRate'
                }
            }
        ]);
        let orderData=orderDetails[0];
        if(orderData){
            let staffData = await getStaffDetails(req.header('Authorization'),orderData.staffId);

            finaldata={
                orderDate: getDateFormate(orderData.orderDate),
                estimatedPickUpDate: getDateFormate(orderData.estimatedPickUpDate),
                orderId:orderData.orderId,
                transactionId:orderData.transactionId ? orderData.transactionId : 'NA',

                staffData:staffData,

                category: orderData.categoryId ? await getCategoryNameAndIdById(orderData.categoryId) : 'NA',
                subCategory:orderData.subCategoryId ? await getSubcategoryNameAndIdById(orderData.subCategoryId) : 'NA',
                orderedQuantity:orderData.orderedQuantity,
                orderedItemPrice:orderData.orderedItemPrice,
                paymentMode:orderData.paymentMode,
                itemName:orderData.itemName,
                itemMasterId:orderData.itemMasterId,
                exchangeData:orderData.exchangeData,
                reasonForExchange:orderData.reasonForExchange,
                itemId:orderData.itemId,
                taxRate:await getTaxPercentageById(orderData.taxRate)
            }
        }else{
            return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
        }
        return finaldata;
    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}



export default {
  getStudentExchangeOrdersListingService,
  getStudentExchangeOrdersDetailsService,
  getStudentExchangeOrdersDetailsPdfService,
  confirmItemForExchangeRequestService,
  rejectItemForExchangeRequestService,
  assignItemExchangeManuallyToStudentService,
  getStaffExchangeOrdersListingService,
  getStaffExchangeOrdersDetailsService,
  confirmItemForExchangeRequestOfStaffService,
  rejectItemForExchangeRequestOfStaffService,
  assignItemExchangeManuallyToStaffService,
  getStaffExchangeOrdersDetailsPdfPdfService
}