/* eslint-disable no-trailing-spaces */
/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import inventoryStudentOrderMaster from '../models/inventoryStudentOrderMaster.model.js';
import inventoryStaffOrderMaster from '../models/inventoryStaffOrderMaster.model.js'
import inventoryItemMaster from '../models/inventoryItemMaster.model.js';
import inventoryItemKitMaster from '../models/inventoryItemKitMaster.model.js';
import inventoryDamagedItemMaster from '../models/inventoryDamagedItemMaster.model.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import {
    getCategoryNameById,
    getSubcategoryNameById,
    getUnitNameById,
    getImageFullPathById,
    generateOrderID,
    getDateFormate,
    getItemDetailsByItemId,
    checkStock,
    getTaxPercentageById,
    getItemStockById,
    getKitStockById
} from '../utils/commonFunction.util.js';
import MESSAGES from '../utils/commonMessage.util.js';
import {
    getStudentNameClassNameByStudentIdClassIdBatchId,
    getStudentAllDetails, getStaffDetails
} from '../utils/helperFunction.util.js';
import mongoose from 'mongoose';
import {
    getUnitNameAndIdById,
    getCategoryNameAndIdById,
    getSubcategoryNameAndIdById,
    getCategoriesNameByIds,
    getSubCategoryNameByIds,
    getStatusRealValueByStatusCodeForStudent,
    getStatusRealValueByStatusCodeForStaff
} from '../utils/commonFunction.util.js';
import inventoryManualPaymentService from './inventoryManualPayment.service.js';
import inventoryManualPaymentModel from '../models/inventoryManualPayment.model.js';
import inventoryManualPaymentHistoryModel from '../models/inventoryManualPaymentHistory.model.js';

/*
 *student order section
 */
const getStudentOrdersListingService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    const configurationId = req.query
        ? req.query.configurationId
            ? req.query.configurationId
            : ''
        : '';
    let subSessionId = req.query
        ? req.query.subSessionId
            ? req.query.subSessionId
            : null
        : null;
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
    const estimatedPickUpDate = req.query
        ? req.query.estimatedPickUpDate
            ? req.query.estimatedPickUpDate
            : ''
        : '';
    const orderStatus = req.query
        ? req.query.orderStatus
            ? req.query.orderStatus
            : ''
        : '';
    const studentId = req.query
        ? req.query.studentId
            ? req.query.studentId
            : ''
        : '';
    const searchKey = req.query
        ? req.query.searchKey
            ? req.query.searchKey
            : ''
        : '';

    let conditionObj = { status: true, instituteId: instituteId };
    if (configurationId) {
        conditionObj.configurationId = Number(configurationId);
    }
    if (subSessionId && JSON.parse(subSessionId).length !== 0) {
        subSessionId = JSON.parse(subSessionId)
        conditionObj.subSessionId = { $all: subSessionId };
    }
    if (classId) {
        conditionObj.classId = Number(classId);
    }
    if (batch) {
        conditionObj.batch = Number(batch);
    }

    if (orderStatus) {
        switch (orderStatus) {
            case 'adminIssueOfflinePaymentPendingAwaitingPickup':
                const statusesToMatch = ['Admin-Issued', 'Offline Payment Pending', 'Awaiting Pickup'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'adminIssueOfflinePaymentReceivedAwaitingPickup':
                const statusesToMatch2 = ['Admin-Issued', 'Offline Payment Received', 'Awaiting Pickup'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch2.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'adminIssueOfflinePaymentReceivedPickedUp':
                const statusesToMatch3 = ['Admin-Issued', 'Offline Payment Received', 'Item Picked up'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch3.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'adminIssueRejected':
                const statusesToMatch4 = ['Admin-Issued', 'Rejected'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch4.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'studentOrderOfflinePaymentPendingAwaitingPickup':
                const statusesToMatch5 = ['Student order', 'Offline Payment Pending', 'Awaiting Pickup'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch5.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'studentOrderOfflinePaymentReceivedAwaitingPickup':
                const statusesToMatch6 = ['Student order', 'Offline Payment Received', 'Awaiting Pickup'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch6.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'studentOrderOfflinePaymentReceivedPickedUp':
                const statusesToMatch7 = ['Student order', 'Offline Payment Received', 'Item Picked up'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch7.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'studentOrderOnlinePaymentPendingAwaitingPickup':
                const statusesToMatch8 = ['Student order', 'Online Payment Pending', 'Awaiting Pickup'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch8.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'studentOrderOnlinePaymentReceivedAwaitingPickup':
                const statusesToMatch9 = ['Student order', 'Online Payment Received', 'Awaiting Pickup'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch9.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'studentOrderOnlinePaymentReceivedPickedUp':
                const statusesToMatch10 = ['Student order', 'Online Payment Received', 'Item Picked up'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch10.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'studentOrderRejected':
                const statusesToMatch11 = ['Student order', 'Rejected'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch11.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            default:
                break;
        }
        // conditionObj.orderStatusWeb = orderStatus;
    }
    console.log(JSON.stringify(conditionObj), 'DUDU')
    if (studentId) {
        conditionObj.studentId = Number(studentId);
    }
    try {
        let queryArray = [
            {
                $match: conditionObj
            },
            {
                $match: {
                    $or: [
                        { 'itemName': { $regex: searchKey, $options: 'i' } }, // Search in item names
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    itemFrom: 1,
                    itemMasterId: 1,
                    itemKitMasterId: 1,
                    orderId: 1,
                    transactionId: 1,
                    estimatedPickUpDate: 1,
                    orderDate: 1,
                    studentId: 1,
                    configurationId: 1,
                    subSessionId: 1,
                    classId: 1,
                    batch: 1,
                    itemName: 1,
                    orderedQuantity: 1,
                    itemInStock: 1,
                    orderedItemPrice: 1,
                    orderStatus: 1,
                    isMarkedAsDamage: 1,
                    orderStatusWeb: 1,
                    orderStatusApp: 1,
                    isPaymentDone: 1,
                    isItemPickedUp: 1,
                    isItemRejected: 1
                }
            }
        ];

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
        if (estimatedPickUpDate) {
            queryArray.push({
                $match: {
                    $expr: {
                        $eq: [
                            { $dateToString: { format: '%Y-%m-%d', date: '$estimatedPickUpDate' } },
                            { $dateToString: { format: '%Y-%m-%d', date: new Date(estimatedPickUpDate) } }
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
                // console.log(data);
                // process.exit(0);
                let stockCount;
                if (data.itemFrom === 'ITEM_MASTER') {
                    let orderSize = data.orderedQuantity[0].size;
                    let stockDetails = await getItemStockById(data.itemMasterId, orderSize);
                    stockCount = stockDetails ? stockDetails : 0;
                } else {
                    let stockDetails = await getKitStockById(data.itemKitMasterId);
                    stockCount = stockDetails.kitQuantity ? stockDetails.kitQuantity.quantity : 0;
                }

                data.itemInStock = {
                    itemInStock: stockCount,
                    unit: data.orderedQuantity[0].unit ? await getUnitNameAndIdById(data.orderedQuantity[0].unit) : 'NA'
                };
                let studentDetails = await getStudentNameClassNameByStudentIdClassIdBatchId(req.header('Authorization'), data['studentId'], data['classId'], data['batch']);
                data.studentDetails = {};
                if (studentDetails) {
                    data.studentDetails = {
                        studentName: (studentDetails.studentFullName ? studentDetails.studentFullName.firstName : '') + ' ' + (studentDetails.studentFullName ? studentDetails.studentFullName.lastName : ''),
                        className: studentDetails.studentclassName.className,
                        batchName: studentDetails.studentBatchName.batchName
                    };
                }

                finalDataListing.push(data);
            }

            let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
            let success = total ? true : false;
            let result = {
                rows: finalDataListing,
                total: total
            };
            return await apiresponse(success, msg, 201, result);
        } else {
            let dataByGivenId = await inventoryStudentOrderMaster.aggregate(queryArray);
            let finalDataListing = [];
            for (let data of dataByGivenId) {
                let stockCount;
                if (data.itemFrom === 'ITEM_MASTER') {
                    let orderSize = data.orderedQuantity[0].size;
                    let stockDetails = await getItemStockById(data.itemMasterId, orderSize);
                    stockCount = stockDetails ? stockDetails : 0;
                } else {
                    let stockDetails = await getKitStockById(data.itemKitMasterId);
                    stockCount = stockDetails.kitQuantity ? stockDetails.kitQuantity.quantity : 0;
                }

                data.itemInStock = {
                    itemInStock: stockCount,
                    unit: data.orderedQuantity[0].unit ? await getUnitNameAndIdById(data.orderedQuantity[0].unit) : 'NA'
                };
                let studentDetails = await getStudentNameClassNameByStudentIdClassIdBatchId(req.header('Authorization'), data['studentId'], data['classId'], data['batch']);
                data.studentDetails = {};
                if (studentDetails) {
                    data.studentDetails = {
                        studentName: (studentDetails.studentFullName ? studentDetails.studentFullName.firstName : '') + ' ' + (studentDetails.studentFullName ? studentDetails.studentFullName.lastName : ''),
                        className: studentDetails.studentclassName.className,
                        batchName: studentDetails.studentBatchName.batchName
                    };
                }
                finalDataListing.push(data);
            }
            let msg = dataByGivenId.length
                ? MESSAGES.DATA_FOUND
                : MESSAGES.NO_DATA_FOUND;
            let success = dataByGivenId.length ? true : false;
            return await apiresponse(success, msg, 201, finalDataListing);
        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
};

const getStudentOrdersListingForDropDownService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    const configurationId = req.query
        ? req.query.configurationId
            ? req.query.configurationId
            : ''
        : '';
    let subSessionId = req.query
        ? req.query.subSessionId
            ? req.query.subSessionId
            : null
        : null;
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

    const studentId = req.query
        ? req.query.studentId
            ? req.query.studentId
            : ''
        : '';

    let conditionObj = {
        status: true,
        instituteId: instituteId,
        isPaymentDone: true,
        orderStatusWeb: {
            $not: {
                $elemMatch: {
                    status: { $in: ['Rejected'] }
                }
            }
        },
        'orderStatusApp.status': { $ne: 'Order Cancelled' }
    };
    if (configurationId) {
        conditionObj.configurationId = Number(configurationId);
    }
    if (subSessionId && JSON.parse(subSessionId).length !== 0) {
        subSessionId = JSON.parse(subSessionId)
        conditionObj.subSessionId = { $all: subSessionId };
    }
    if (classId) {
        conditionObj.classId = Number(classId);
    }
    if (batch) {
        conditionObj.batch = Number(batch);
    }

    if (studentId) {
        conditionObj.studentId = Number(studentId);
    }
    try {

        let dataByGivenId = await inventoryStudentOrderMaster.aggregate([
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
                $lookup: {
                    from: 'inventoryitemkitmasters',
                    localField: 'itemKitMasterId',
                    foreignField: '_id',
                    as: 'itemKitDetails'
                }
            },
            {
                $project: {
                    _id: 1,
                    itemFrom: 1,
                    itemMasterId: 1,
                    itemKitMasterId: 1,
                    orderId: 1,
                    transactionId: 1,
                    estimatedPickUpDate: 1,
                    orderDate: 1,
                    itemName: 1,
                    orderedQuantity: 1,
                    itemInStock: 1,
                    orderedItemPrice: 1,
                    // itemDetails:1,
                    // itemKitDetails:1,
                    itemSizesDetails: '$itemDetails.itemSizes',
                    KitSizesDetails: '$itemKitDetails.kitQuantity',
                    KitfinalSellingPriceperUnit: '$itemKitDetails.finalSellingPrice'
                }
            }
        ]);

        let msg = dataByGivenId.length
            ? MESSAGES.DATA_FOUND
            : MESSAGES.NO_DATA_FOUND;
        let success = dataByGivenId.length ? true : false;
        return await apiresponse(success, msg, 201, dataByGivenId);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
};

//for route conform-pickup-for-student-after-payment
const conformPickupForStudentAfterPaymentService = async (req, res) => {
    try {
        let orderArr = req.body.orderIds;
        for (let orderId of orderArr) {
            let orderDetails = await inventoryStudentOrderMaster.findOne({ _id: orderId });
            const itemFrom = orderDetails.itemFrom;
            const orderedData = orderDetails.orderedQuantity;
            if (orderDetails) {
                let pickupArr = [
                    {
                        status: orderDetails.orderStatusWeb[0].status,
                        colorCode: '#007A1C'
                    },
                    {
                        status: 'Offline Payment Received',
                        colorCode: '#007A1C'
                    },
                    {
                        status: 'Item Picked up',
                        colorCode: '#007A1C'
                    },
                ]
                let updateOrder = await inventoryStudentOrderMaster.findOneAndUpdate(
                    {
                        _id: orderId
                    },
                    {
                        $set: {
                            orderStatusWeb: pickupArr,
                            isItemPickedUp: true,
                            pickUpDate: new Date()
                        }
                    },
                    {
                        new: true
                    }
                )
            } else {
                return await apiresponse(true, MESSAGES.NO_ORDER_FOUND, 201, null);
            }
            //update order 
            // let pickupArr = [
            //     {
            //         status: "Admin-Issued",
            //         colorCode: "#007A1C"
            //     },
            //     {
            //         status: "Offline Payment Received",
            //         colorCode: "#007A1C"
            //     },
            //     {
            //         status: "Item Picked up",
            //         colorCode: "#007A1C"
            //     },
            // ]
            // let updateOrder = await inventoryStudentOrderMaster.findOneAndUpdate(
            //     {
            //         _id : orderId
            //     },
            //     {
            //         $set : {
            //             orderStatusWeb : pickupArr,
            //             isItemPickedUp : true
            //         }
            //     },
            //     {
            //         new : true
            //     }
            // )
            // let appStatus = { status: "Payment Pending", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" }
            // console.log(itemFrom)
            // console.log(orderedData)
            // let success = false;
            // if (orderDetails) {
            //     if (orderDetails.paymentStatus === 'FAIL') {
            //         return await apiresponse(false, null, 201, MESSAGES.PAYMENT_PENDING);
            //     } else if (orderDetails.paymentMode === 'ONLINE' && orderDetails.orderStatus === 'STUDENT_ORDER_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP') {
            //         await inventoryStudentOrderMaster.updateOne(
            //             { _id: orderId },
            //             {
            //                 $set: {
            //                     orderStatus: 'STUDENT_ORDER_ONLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP',
            //                     updatedAt: new Date()
            //                 }
            //             }
            //         );
            //         success = true;
            //     } else if (orderDetails.paymentMode === 'ONLINE' && orderDetails.orderStatus === 'STUDENT_ORDER_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP') {
            //         return await apiresponse(false, null, 201, MESSAGES.PAYMENT_PENDING);
            //     } else if (orderDetails.paymentMode === 'COD' && orderDetails.orderStatus === 'STUDENT_ORDER_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP') {
            //         await inventoryStudentOrderMaster.updateOne(
            //             { _id: orderId },
            //             {
            //                 $set: {
            //                     orderStatus: 'STUDENT_ORDER_OFFLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP',
            //                     updatedAt: new Date()
            //                 }
            //             }
            //         );
            //         success = true;
            //     } else if (orderDetails.paymentMode === 'ONLINE' && orderDetails.orderStatus === 'ADMIN_ISSUED_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP') {
            //         return await apiresponse(false, null, 201, MESSAGES.PAYMENT_PENDING);
            //     } else if (orderDetails.paymentMode === 'ONLINE' && orderDetails.orderStatus === 'ADMIN_ISSUED_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP') {
            //         await inventoryStudentOrderMaster.updateOne(
            //             { _id: orderId },
            //             {
            //                 $set: {
            //                     orderStatus: 'ADMIN_ISSUED_ONLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP',
            //                     updatedAt: new Date()
            //                 }
            //             }
            //         );
            //         success = true;
            //     } else if (orderDetails.paymentMode === 'COD' && orderDetails.orderStatus === 'ADMIN_ISSUED_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP') {
            //         await inventoryStudentOrderMaster.updateOne(
            //             { _id: orderId },
            //             {
            //                 $set: {
            //                     orderStatus: 'ADMIN_ISSUED_OFFLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP',
            //                     updatedAt: new Date()
            //                 }
            //             }
            //         );
            //         success = true;
            //     }

            //     /* update the item stock avaliable in item */
            //     // if (success) {
            //     //     if (itemFrom === 'ITEM_MASTER') {
            //     //         const itemDetails = await inventoryItemMaster.findOne({ _id: orderDetails.itemMasterId });
            //     //         let itemSizes = itemDetails.itemSizes;
            //     //         let itemSizesUpdatedData = [];
            //     //         let matchedArr = [];
            //     //         for (const item of orderedData) {
            //     //             let matchingStockItem = itemSizes.find(stockItem => stockItem.size === item.size);
            //     //             matchingStockItem.itemQuantity.quantity -= item.quantity;
            //     //             matchedArr.push(matchingStockItem);
            //     //         }
            //     //         let notMatchedArr = itemSizes.filter(item => !matchedArr.includes(item));
            //     //         itemSizesUpdatedData = [...matchedArr, ...notMatchedArr];
            //     //         await inventoryItemMaster.updateOne(
            //     //             { _id: orderDetails.itemMasterId },
            //     //             {
            //     //                 $set: {
            //     //                     itemSizes: itemSizesUpdatedData,
            //     //                     updatedAt: new Date()
            //     //                 },
            //     //                 $inc: { 'quantityInHand.quantityInHand': -orderedData[0].quantity }
            //     //             }
            //     //         );
            //     //     } else if (itemFrom === 'ITEM_KIT') {
            //     //         let itemKitDetails = await inventoryItemKitMaster.findOne({ _id: orderDetails.itemKitMasterId });

            //     //         await inventoryItemKitMaster.updateOne(
            //     //             { _id: orderDetails.itemKitMasterId },
            //     //             {
            //     //                 $set: {
            //     //                     kitQuantity: {
            //     //                         quantity: itemKitDetails.kitQuantity.quantity - orderedData[0].quantity,
            //     //                         unit: itemKitDetails.kitQuantity.unit
            //     //                     },
            //     //                     updatedAt: new Date()
            //     //                 }
            //     //             }
            //     //         );
            //     //     }
            //     // }


            //     /* Your order has been confirm by admin ,a notification will be triggred --> pending */
            //     if (success) {
            //         /* notification part is pending */
            //     }
            // } else {
            //     return await apiresponse(false, MESSAGES.NO_ORDER_FOUND, 201, null);
            // }
        }
        return await apiresponse(true, MESSAGES.ORDER_PICKUP_SUCCESS, 201, null);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

//for route reject-student-order
const rejectStudentOrderService = async (req, res) => {
    try {
        let orderArr = req.body.orderIds;
        for (let orderId of orderArr) {
            let orderDetails = await inventoryStudentOrderMaster.findOne({ _id: orderId });
            const orderedData = orderDetails.orderedQuantity[0];
            const itemFrom = orderDetails.itemFrom;
            console.log(orderedData)
            console.log(orderDetails)
            if (orderDetails) {
                if (itemFrom == 'ITEM_MASTER') {
                    let itemId = orderDetails.itemMasterId
                    let itemDetails = await inventoryItemMaster.findById(
                        {
                            _id: itemId
                        }
                    )
                    let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderedData.size)
                    let updateItemStock = await inventoryItemMaster.findOneAndUpdate(
                        {
                            _id: itemId
                        },
                        {
                            $inc: { [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: +orderedData.quantity, 'quantityInHand.quantityInHand': +orderedData.quantity }
                        }
                    )
                    //update order
                    let webstatusArr = [
                        {
                            status: orderDetails.orderStatusWeb[0].status,
                            colorCode: '#DC3545'
                        },
                        {
                            status: 'Rejected',
                            colorCode: '#DC3545'
                        },
                    ]

                    let appStatus = { status: 'Order Cancelled', colorCode: '#6C131C', backgroundColorCode: '#FEE7E7' }

                    let updateOrder = await inventoryStudentOrderMaster.findOneAndUpdate(
                        {
                            _id: orderId
                        },
                        {
                            $set: {
                                orderStatusWeb: webstatusArr,
                                orderStatusApp: appStatus,
                                isItemRejected: true,
                                orderRejectDate: new Date()
                            }
                        },
                        {
                            new: true
                        }
                    )
                } else {
                    let itemId = orderDetails.itemKitMasterId
                    let updateItemCount = await inventoryItemKitMaster.findOneAndUpdate(
                        { _id: itemId },
                        { $inc: { 'kitQuantity.quantity': +orderedData.quantity } },
                        { new: true }
                    )

                    //order update
                    let webstatusArr = [
                        {
                            status: orderDetails.orderStatusWeb[0].status,
                            colorCode: '#DC3545'
                        },
                        {
                            status: 'Rejected',
                            colorCode: '#DC3545'
                        },
                    ]

                    let appStatus = { status: 'Order Cancelled', colorCode: '#6C131C', backgroundColorCode: '#FEE7E7' }

                    let updateOrder = await inventoryStudentOrderMaster.findOneAndUpdate(
                        {
                            _id: orderId
                        },
                        {
                            $set: {
                                orderStatusWeb: webstatusArr,
                                orderStatusApp: appStatus,
                                isItemRejected: true,
                                orderRejectDate: new Date()
                            }
                        },
                        {
                            new: true
                        }
                    )
                }
                //update manual payment
                let manualPaymentDetails = await inventoryManualPaymentModel.findOne(
                    {
                        orderedUserType: 'STUDENT',
                        orderId: orderId
                    }
                )
                let deleteManual = await inventoryManualPaymentModel.findByIdAndDelete(
                    {
                        _id: manualPaymentDetails._id
                    }
                )
                let deleteManualHistory = await inventoryManualPaymentHistoryModel.deleteMany(
                    {
                        manualPaymentId: manualPaymentDetails._id
                    }
                )
                // let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderedQuantity[0].size)
                //         let updateItemCount = await inventoryItemMaster.findOneAndUpdate(
                //             { _id: orderedItemId},
                //             { $inc: { [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: -orderedQuantity[0].quantity, 'quantityInHand.quantityInHand': -orderedQuantity[0].quantity } },
                //             { new: true }
                //         )
                // await inventoryStudentOrderMaster.updateOne(
                //     { _id: orderId },
                //     {
                //         $set: {
                //             orderStatus: 'STUDENT_ORDER_REJECTED',
                //             updatedAt: new Date()
                //         }
                //     }
                // );
                /* Your order has been rejected by admin, a notification will be trigrred to student pending */
            } else {
                return await apiresponse(true, MESSAGES.NO_ORDER_FOUND, 201, null);
            }
        }
        return await apiresponse(true, MESSAGES.ORDER_REJECTED, 201, null);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const getItemOrderDetailService = async (req, res) => {
    try {
        let { itemFrom, orderId } = req.query;
        let finaldata;
        if (itemFrom === 'ITEM_MASTER') {
            let orderDetails = await inventoryStudentOrderMaster.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(orderId) }
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
                        itemName: 1,
                        itemMasterId: 1,
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
                        estimatedPickUpDate: 1,
                        orderStatusWeb: 1,
                        orderStatusApp: 1,
                        isPaymentDone: 1,
                        isItemPickedUp: 1,
                        isItemRejected: 1,
                        itemImages: '$itemDetails.itemImages',
                        categoryId: '$itemDetails.categoryId',
                        subCategoryId: '$itemDetails.subCategoryId',
                        reorderPointData: '$itemDetails.reorderPointData',
                    }
                }
            ]);
            let orderData = orderDetails[0];
            // console.log(orderData);
            if (orderData) {
                let studentDetails = await getStudentAllDetails(req.header('Authorization'), orderData.studentId, orderData.classId, orderData.batch, orderData.configurationId, orderData.subSessionId);
                // console.log(studentDetails,'studentDetails');
                let studentData = {};
                if (studentDetails) {
                    studentData = {
                        studentName: studentDetails.studentFullName.firstName + ' ' + studentDetails.studentFullName.lastName,
                        uniqueId: studentDetails.studentFullName ? studentDetails.studentFullName.studentBatchUniqueIds[0].uniqueId : 'NA',
                        className: studentDetails.studentclassName.className,
                        batchName: studentDetails.studentBatchName.batchName,
                        configurationName: studentDetails.configurationName.configurationName,
                        subSessionName: studentDetails.subSessionName
                    }
                }

                let imageArr = orderData.itemImages;
                let imgFinalArray = await Promise.all(imageArr.map(async (image) => {
                    const { documentID, ...rest } = image;
                    return {
                        path: await getImageFullPathById(documentID),
                        ...rest
                    };
                }));

                let stockDetails = await getItemStockById(orderData.itemMasterId, orderData.orderedQuantity[0].size);
                let stockCount = stockDetails ? stockDetails : 0;

                let itemInStockData = {
                    itemInStock: stockCount,
                    unit: orderData.orderedQuantity[0].unit ? await getUnitNameAndIdById(orderData.orderedQuantity[0].unit) : 'NA'
                };
                finaldata = {
                    images: imgFinalArray,
                    orderDate: orderData.orderDate,
                    estimatedPickUpDate: orderData.estimatedPickUpDate,
                    orderId: orderData.orderId,
                    transactionId: orderData.transactionId,

                    studentData: studentData,

                    category: orderData.categoryId ? await getCategoryNameAndIdById(orderData.categoryId) : 'NA',
                    subCategory: orderData.subCategoryId ? await getSubcategoryNameAndIdById(orderData.subCategoryId) : 'NA',
                    orderedQuantity: orderData.orderedQuantity,
                    orderedItemPrice: orderData.orderedItemPrice,
                    itemName: orderData.itemName,
                    itemMasterId: orderData.itemMasterId,
                    itemInStock: itemInStockData,
                    reorderPointData: {
                        reorderPoint: orderData.reorderPointData ? orderData.reorderPointData.reorderPoint : 'NA',
                        unit: orderData.reorderPointData.unit ? await getUnitNameAndIdById(orderData.reorderPointData.unit) : 'NA'
                    },
                    orderStatusWeb: orderData.orderStatusWeb,
                    orderStatusApp: orderData.orderStatusApp,
                    isPaymentDone: orderData.isPaymentDone,
                    isItemPickedUp: orderData.isItemPickedUp,
                    isItemRejected: orderData.isItemRejected,
                }
            } else {
                return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
            }
        } else if (itemFrom === 'ITEM_KIT') {
            let orderDetails = await inventoryStudentOrderMaster.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(orderId) }
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
                        itemName: 1,
                        itemKitMasterId: 1,
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
                        estimatedPickUpDate: 1,
                        orderStatusWeb: 1,
                        orderStatusApp: 1,
                        isPaymentDone: 1,
                        isItemPickedUp: 1,
                        isItemRejected: 1,
                        categoryId: '$itemKitDetails.categoryIds',
                        subCategoryId: '$itemKitDetails.subCategoryIds',
                        itemListingData: '$itemKitDetails.itemListingData',
                        reorderPointData: '$itemKitDetails.reorderPoint'
                    }
                },
            ]);
            let orderData = orderDetails[0];
            if (orderData) {
                let studentDetails = await getStudentAllDetails(req.header('Authorization'), orderData.studentId, orderData.classId, orderData.batch, orderData.configurationId, orderData.subSessionId);
                // console.log(studentDetails);
                let studentData;
                if (studentDetails) {
                    studentData = {
                        studentName: studentDetails.studentFullName.firstName + ' ' + studentDetails.studentFullName.lastName,
                        uniqueId: studentDetails.studentFullName ? studentDetails.studentFullName.studentBatchUniqueIds[0].uniqueId : 'NA',
                        className: studentDetails.studentclassName.className,
                        batchName: studentDetails.studentBatchName.batchName,
                        configurationName: studentDetails.configurationName.configurationName,
                        subSessionName: studentDetails.subSessionName
                    }
                }
                let itemListingData = await Promise.all(orderData.itemListingData.map(async (item) => {
                    let itemDetails = await getItemDetailsByItemId(item.itemMasterId);
                    return {
                        ...item,
                        itemDetails: itemDetails
                    }
                }));
                finaldata = {
                    orderDate: orderData.orderDate,
                    estimatedPickUpDate: orderData.estimatedPickUpDate,
                    orderId: orderData.orderId,
                    transactionId: orderData.transactionId,
                    studentData: studentData,
                    category: orderData.categoryId ? await getCategoriesNameByIds(orderData.categoryId) : 'NA',
                    subCategory: orderData.subCategoryId ? await getSubCategoryNameByIds(orderData.subCategoryId) : 'NA',
                    orderedQuantity: {
                        quantity: orderData.orderedQuantity[0].quantity,
                        unit: orderData.orderedQuantity[0].unit ? await getUnitNameAndIdById(orderData.orderedQuantity[0].unit) : 'NA'
                    },
                    orderedItemPrice: orderData.orderedItemPrice,
                    itemName: orderData.itemName,
                    itemKitMasterId: orderData.itemKitMasterId,
                    itemInStock: {
                        itemInStock: orderData.itemInStock,
                        unit: orderData.orderedQuantity[0].unit ? await getUnitNameAndIdById(orderData.orderedQuantity[0].unit) : 'NA'
                    },
                    reorderPointData: orderData.reorderPointData ? orderData.reorderPointData : 'NA',
                    orderStatusWeb: orderData.orderStatusWeb,
                    orderStatusApp: orderData.orderStatusApp,
                    isPaymentDone: orderData.isPaymentDone,
                    isItemPickedUp: orderData.isItemPickedUp,
                    isItemRejected: orderData.isItemRejected,
                    itemListingData: itemListingData
                }
            } else {
                return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
            }
            // console.log(orderDetails,'orderDetails');
        }
        // console.log(finaldata);
        const msg = finaldata ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
        return await apiresponse(true, msg, 201, finaldata);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const markAnItemAsDamageItemForStudentService = async (req, res) => {
    try {
        const instituteId = req.authData.data.instituteId;
        const damageRaisedByUserId = req.authData.data.staffId;

        const { orderId, itemId, itemFrom, damagedQuantity } = req.body;
        const orderData = await inventoryStudentOrderMaster.findOne({ _id: orderId }, { isMarkedAsDamage: 1 })
        // console.log(orderData);
        // process.exit(0);
        if (orderData.isMarkedAsDamage) {
            return await apiresponse(false, MESSAGES.MARKED_AS_DAMAGE, 401, null);
        }
        if (itemFrom === 'ITEM_MASTER') {
            let itemDetailForOrder = await inventoryItemMaster.findOne({ _id: itemId });

            if (itemDetailForOrder && req.body) {
                let damageData = {
                    instituteId: instituteId,
                    itemMasterId: itemId,
                    damagedQuantity: damagedQuantity,
                    issueType: 'NONISSUED',
                    damageRaisedByUserId: damageRaisedByUserId,
                    itemImages: itemDetailForOrder.itemImages,
                    categoryId: itemDetailForOrder.categoryId,
                    subCategoryId: itemDetailForOrder.subCategoryId,
                    fixedVendorId: itemDetailForOrder.fixedVendorId,
                    itemId: itemDetailForOrder.itemId,
                    store: itemDetailForOrder.store,
                    itemName: itemDetailForOrder.itemName,
                    itemAvailableTo: itemDetailForOrder.itemAvailableTo,
                    priceApplicableToStaff: itemDetailForOrder.priceApplicableToStaff,
                    exchangeableItemFor: itemDetailForOrder.exchangeableItemFor,
                    exchangePeriodForStudent: itemDetailForOrder.exchangePeriodForStudent,
                    exchangePeriodForStaff: itemDetailForOrder.exchangePeriodForStaff,
                    pickupPeriodForStudent: itemDetailForOrder.pickupPeriodForStudent,
                    pickupPeriodForStaff: itemDetailForOrder.pickupPeriodForStaff,
                    taxRate: itemDetailForOrder.taxRate,
                    itemSizes: itemDetailForOrder.itemSizes,
                    weightData: itemDetailForOrder.weightData,
                    materialType: itemDetailForOrder.materialType,
                    otherDetails: itemDetailForOrder.otherDetails,
                    enableTracking: itemDetailForOrder.enableTracking,
                    quantityInHand: itemDetailForOrder.quantityInHand,
                    reorderPoint: itemDetailForOrder.reorderPointData,
                    preferredVendor: itemDetailForOrder.preferredVendor || null,
                    dateOfPurchase: itemDetailForOrder.dateOfPurchase
                };
                // console.log(damageData);
                // process.exit(0)
                let response = await inventoryDamagedItemMaster.create(damageData);
                await inventoryStudentOrderMaster.updateOne({ _id: orderId }, {
                    $set: {
                        isMarkedAsDamage: true,
                        updatedAt: new Date()
                    }
                });
                return await apiresponse(true, MESSAGES.INVENTORY.DAMAGED_MASTER.DAMAGED_REQ_MOVED_TO_DAMAGE_MASTER, 201, null);
            } else {
                return await apiresponse(false, MESSAGES.SOME_DATA_MISSING, 401, null);
            }
        } else if (itemFrom === 'ITEM_KIT') {
            let itemKitDetailForOrder = await inventoryItemKitMaster.findOne({ _id: itemId });

            if (itemKitDetailForOrder && req.body) {
                let damagedData = {
                    instituteId: instituteId,
                    itemFrom: 'ITEM_KIT',
                    itemKitMasterId: itemId,
                    damagedQuantity: damagedQuantity,
                    damageRaisedByUserId: damageRaisedByUserId,
                    itemName: itemKitDetailForOrder.itemKitName
                }

                let response = await inventoryDamagedItemMaster.create(damagedData);
                await inventoryStudentOrderMaster.updateOne({ _id: orderId }, {
                    $set: {
                        isMarkedAsDamage: true,
                        updatedAt: new Date()
                    }
                });
                return await apiresponse(true, MESSAGES.INVENTORY.DAMAGED_MASTER.DAMAGED_REQ_MOVED_TO_DAMAGE_MASTER, 201, null);
            } else {
                return await apiresponse(false, MESSAGES.SOME_DATA_MISSING, 401, null);
            }
        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

//for route assign-item-to-student-manually
const assignItemToStudentManuallyService = async (req, res) => {
    try {
        const instituteId = req.authData.data.instituteId;
        const configurationId = req.body.configurationId;
        const subSessionId = req.body.subSessionId;
        // const classId= req.body.classId;
        const studentListing = req.body.student;
        const itemFrom = req.body.itemFrom;
        const orderedItemId = req.body.orderedItemId;
        const orderedQuantity = req.body.orderedQuantity;
        let noOfStudent = studentListing.length;

        /* checking that ordered quantity of item is avaliable in stock or not*/
        if (itemFrom === 'ITEM_KIT') {
            let orderedItemDetails = await inventoryItemKitMaster.findOne({ _id: orderedItemId }, { kitQuantity: 1 });
            if (!orderedItemDetails) return await apiresponse(false, MESSAGES.KIT.VALID_ITEM_KITID, 201, null);

            if (orderedItemDetails.kitQuantity.quantity < orderedQuantity[0].quantity * noOfStudent) {
                return await apiresponse(false, MESSAGES.KIT.QUANTITY_VALIDATION, 201, null);
            }
        } else if (itemFrom === 'ITEM_MASTER') {
            let orderedItemDetails = await inventoryItemMaster.findOne({ _id: orderedItemId }, { itemSizes: 1 });
            if (!orderedItemDetails) return await apiresponse(false, MESSAGES.VALID_ITEM_ID, 201, null);

            const stockRes = await checkStock(orderedItemDetails.itemSizes, orderedQuantity, noOfStudent);
            if (stockRes.success === false) return stockRes;
        }

        if (noOfStudent > 0) {
            for (let student of studentListing) {
                if (itemFrom === 'ITEM_KIT') {
                    let orderedItemKitDetails = await inventoryItemKitMaster.findOne({ _id: orderedItemId });
                    const orderId = await generateOrderID(instituteId);
                    let orderedData = [
                        {
                            size: '',
                            quantity: orderedQuantity[0].quantity,
                            orderedItemPricePerUnit: orderedQuantity[0].orderedItemPricePerUnit,
                            unit: orderedQuantity[0].unit
                        }
                    ];
                    let pickupPeriodForStudent = orderedItemKitDetails.pickupPeriod;
                    let currentDate = new Date();
                    let estimatedPickUpDate = new Date(currentDate);
                    estimatedPickUpDate.setDate(currentDate.getDate() + pickupPeriodForStudent);

                    let orderKitObject = {
                        instituteId,
                        itemFrom: itemFrom,
                        itemKitMasterId: orderedItemId,
                        itemName: orderedItemKitDetails ? orderedItemKitDetails.itemKitName : 'NA',
                        orderId: orderId,
                        transactionId: 'NA',
                        studentId: student.studentId,
                        configurationId: configurationId,
                        subSessionId: subSessionId,
                        classId: student.classId,
                        batch: student.batchId,
                        orderedQuantity: orderedData,
                        itemInStock: orderedItemKitDetails ? orderedItemKitDetails.kitQuantity.quantity : 0,
                        orderedItemPrice: orderedQuantity[0].totalSellingPrice,
                        paymentMode: 'COD',
                        paymentStatus: 'PENDING',
                        estimatedPickUpDate: estimatedPickUpDate,
                        orderStatusWeb: [
                            {
                                status: 'Admin-Issued',
                                colorCode: '#C45806'
                            },
                            {
                                status: 'Offline Payment Pending',
                                colorCode: '#C45806'
                            },
                            {
                                status: 'Awaiting Pickup',
                                colorCode: '#C45806'
                            },
                        ],
                        orderStatusApp: { status: 'Payment Pending', colorCode: '#6C131C', backgroundColorCode: '#FEE7E7' },
                        // orderStatus: 'ADMIN_ISSUED_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP',
                        orderBy: 'ASSIGN_BY_ADMIN'
                    };

                    let createOrder = await inventoryStudentOrderMaster.create(orderKitObject);
                    let createManualPaymentForOrder = await inventoryManualPaymentService.createManualPayment(student.studentId, 'STUDENT', createOrder._id, orderedQuantity[0].totalSellingPrice, orderedQuantity[0].totalSellingPrice, instituteId)
                    if (!createManualPaymentForOrder) {
                        //delete order if manual payment is not created
                        let deleteCreatedOrder = await inventoryStudentOrderMaster.findOneAndDelete(
                            {
                                _id: createOrder._id
                            }
                        )
                        return {
                            success: false,
                            message: `Manual Payment Not Created`,
                            code: 400,
                            data: {}
                        };
                    } else {
                        //delete count from stock
                        // let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderedQuantity[0].size)
                        let updateItemCount = await inventoryItemKitMaster.findOneAndUpdate(
                            { _id: orderedItemId },
                            { $inc: { 'kitQuantity.quantity': -orderedQuantity[0].quantity } },
                            { new: true }
                        )
                    }
                } else if (itemFrom === 'ITEM_MASTER') {
                    const orderIdForItem = await generateOrderID(instituteId);
                    let itemDetails = await inventoryItemMaster.findOne({ _id: orderedItemId }).lean();
                    let itemSizes = itemDetails.itemSizes;
                    let orderedSize = orderedQuantity[0].size;
                    let inStockItem = itemSizes.find((item) => item.size === orderedSize);
                    let totalItemInStock = inStockItem ? inStockItem.itemQuantity.quantity : 0;

                    let pickupPeriodForStudent = itemDetails.pickupPeriodForStudent;

                    let currentDate = new Date();
                    let estimatedPickUpDate = new Date(currentDate);
                    estimatedPickUpDate.setDate(currentDate.getDate() + pickupPeriodForStudent);
                    let orderedItemPrice = orderedQuantity[0].totalSellingPrice;

                    let orderedData = orderedQuantity.map((order) => {
                        return {
                            size: order.size,
                            quantity: order.quantity,
                            orderedItemPricePerUnit: order.orderedItemPricePerUnit,
                            unit: order.unit
                        }
                    });

                    let orderObject = {
                        instituteId,
                        itemFrom: itemFrom,
                        itemMasterId: orderedItemId,
                        itemName: itemDetails ? itemDetails.itemName : '',
                        orderId: orderIdForItem,
                        transactionId: 'NA',
                        studentId: student.studentId,
                        configurationId: configurationId,
                        subSessionId: subSessionId,
                        classId: student.classId,
                        batch: student.batchId,
                        orderedQuantity: orderedData,
                        itemInStock: totalItemInStock,
                        orderedItemPrice: orderedItemPrice,
                        paymentMode: 'COD',
                        paymentStatus: 'PENDING',
                        estimatedPickUpDate: estimatedPickUpDate,
                        orderStatusWeb: [
                            {
                                status: 'Admin-Issued',
                                colorCode: '#C45806'
                            },
                            {
                                status: 'Offline Payment Pending',
                                colorCode: '#C45806'
                            },
                            {
                                status: 'Awaiting Pickup',
                                colorCode: '#C45806'
                            },
                        ],
                        orderStatusApp: { status: 'Payment Pending', colorCode: '#6C131C', backgroundColorCode: '#FEE7E7' },
                        orderStatus: 'ADMIN_ISSUED_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP',
                        orderBy: 'ASSIGN_BY_ADMIN'
                    };
                    let createOrder = await inventoryStudentOrderMaster.create(orderObject);
                    let createManualPaymentForOrder = await inventoryManualPaymentService.createManualPayment(student.studentId, 'STUDENT', createOrder._id, orderedItemPrice, orderedItemPrice, instituteId)
                    if (!createManualPaymentForOrder) {
                        //delete order if manual payment is not created
                        let deleteCreatedOrder = await inventoryStudentOrderMaster.findOneAndDelete(
                            {
                                _id: createOrder._id
                            }
                        )
                        return {
                            success: false,
                            message: `Manual Payment Not Created and Order deleted`,
                            code: 400,
                            data: {}
                        };
                    } else {
                        //delete count from stock
                        let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderedQuantity[0].size)
                        let updateItemCount = await inventoryItemMaster.findOneAndUpdate(
                            { _id: orderedItemId },
                            {
                                $inc: {
                                    [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: -orderedQuantity[0].quantity,
                                    'quantityInHand.quantityInHand': -orderedQuantity[0].quantity,
                                    [`itemSizes.${indexOfSize}.totalSellingPrice`]: -orderedQuantity[0].quantity * orderedQuantity[0].orderedItemPricePerUnit
                                }
                            },
                            { new: true }
                        )
                    }
                }

            }
            return await apiresponse(true, MESSAGES.ITEM_ASSIGN_TO_STUDENT, 201, null);
        } else {
            return await apiresponse(false, MESSAGES.IS_ASSIGN_POSSIBLE, 201, null);
        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const receiptPdfOfItemForStudentService = async (req, res) => {
    try {
        let { orderId, itemFrom } = req.params;

        let finaldata;
        if (itemFrom === 'ITEM_MASTER') {
            let orderDetails = await inventoryStudentOrderMaster.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(orderId) }
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
                        itemName: 1,
                        itemMasterId: 1,
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
                        estimatedPickUpDate: 1,
                        orderStatus: 1,
                        paymentMode: 1,
                        categoryId: '$itemDetails.categoryId',
                        subCategoryId: '$itemDetails.subCategoryId',
                        reorderPointData: '$itemDetails.reorderPointData',
                        itemId: '$itemDetails.itemId',
                        taxRate: '$itemDetails.taxRate'
                    }
                }
            ]);
            let orderData = orderDetails[0];
            if (orderData) {
                let studentDetails = await getStudentAllDetails(req.header('Authorization'), orderData.studentId, orderData.classId, orderData.batch, orderData.configurationId, orderData.subSessionId);
                console.log(studentDetails);
                // process.exit(0);
                let studentData;
                if (studentDetails) {
                    studentData = {
                        studentName: studentDetails.studentFullName == null ? 'NA' : studentDetails.studentFullName?.firstName + ' ' + studentDetails.studentFullName?.lastName,
                        className: studentDetails.studentclassName.className,
                        batchName: studentDetails.studentBatchName.batchName,
                        configurationName: studentDetails.configurationName.configurationName,
                        subSessionName: studentDetails.subSessionName,
                        studentUniqueCode: studentDetails.studentFullName ? studentDetails.studentFullName.studentBatchUniqueIds[0].uniqueId : 'NA'
                    }
                }


                finaldata = {
                    itemFrom: 'ITEM_MASTER',
                    orderDate: getDateFormate(orderData.orderDate),
                    estimatedPickUpDate: getDateFormate(orderData.estimatedPickUpDate),
                    orderId: orderData.orderId,
                    transactionId: orderData.transactionId ? orderData.transactionId : 'NA',

                    studentData: studentData,

                    category: orderData.categoryId ? await getCategoryNameAndIdById(orderData.categoryId) : 'NA',
                    subCategory: orderData.subCategoryId ? await getSubcategoryNameAndIdById(orderData.subCategoryId) : 'NA',
                    orderedQuantity: orderData.orderedQuantity,
                    orderedItemPrice: orderData.orderedItemPrice,
                    itemName: orderData.itemName,
                    itemMasterId: orderData.itemMasterId,
                    paymentMode: orderData.paymentMode,
                    itemId: orderData.itemId,
                    taxRate: await getTaxPercentageById(orderData.taxRate)
                }
            } else {
                return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
            }
        } else if (itemFrom === 'ITEM_KIT') {
            let orderDetails = await inventoryStudentOrderMaster.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(orderId) }
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
                        itemName: 1,
                        itemKitMasterId: 1,
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
                        estimatedPickUpDate: 1,
                        orderStatus: 1,
                        paymentMode: 1,
                        categoryId: '$itemKitDetails.categoryIds',
                        subCategoryId: '$itemKitDetails.subCategoryIds',
                        itemListingData: '$itemKitDetails.itemListingData',
                        reorderPointData: '$itemKitDetails.reorderPoint',
                        kitId: '$itemKitDetails.itemKitId'
                    }
                },
            ]);
            let orderData = orderDetails[0];
            if (orderData) {
                let studentDetails = await getStudentAllDetails(req.header('Authorization'), orderData.studentId, orderData.classId, orderData.batch, orderData.configurationId, orderData.subSessionId);

                let studentData;
                if (studentDetails) {
                    studentData = {
                        studentName: studentDetails.studentFullName.firstName + ' ' + studentDetails.studentFullName.lastName,
                        className: studentDetails.studentclassName.className,
                        batchName: studentDetails.studentBatchName.batchName,
                        configurationName: studentDetails.configurationName.configurationName,
                        subSessionName: studentDetails.subSessionName,
                        studentUniqueCode: studentDetails.studentFullName ? studentDetails.studentFullName.studentBatchUniqueIds[0].uniqueId : 'NA'
                    }
                }

                let categoryListing = await getCategoriesNameByIds(orderData.categoryId);
                let categoryData = '';
                categoryListing.map((category) => {
                    categoryData = categoryData + category.categoryName + ' ,'
                })

                let subCategoryListing = await getSubCategoryNameByIds(orderData.subCategoryId);
                let subCategoryData = '';
                subCategoryListing.map((subCategory) => {
                    subCategoryData = subCategoryData + subCategory.subCategoryName + ' ,'
                })
                // console.log(categoryData,'categoryData');
                // process.exit(0);
                finaldata = {
                    itemFrom: 'ITEM_KIT',
                    orderDate: getDateFormate(orderData.orderDate),
                    estimatedPickUpDate: getDateFormate(orderData.estimatedPickUpDate),
                    orderId: orderData.orderId,
                    transactionId: orderData.transactionId,
                    studentData: studentData,
                    category: categoryData ? categoryData : 'NA',
                    subCategory: subCategoryData ? subCategoryData : 'NA',
                    orderedQuantity: orderData.orderedQuantity,
                    orderedItemPrice: orderData.orderedItemPrice,
                    itemName: orderData.itemName,
                    itemKitMasterId: orderData.itemKitMasterId,
                    paymentMode: orderData.paymentMode,
                    itemInStock: {
                        itemInStock: orderData.itemInStock,
                        unit: orderData.orderedQuantity[0].unit ? await getUnitNameAndIdById(orderData.orderedQuantity[0].unit) : 'NA'
                    },
                    reorderPointData: orderData.reorderPointData ? orderData.reorderPointData : 'NA',
                    orderStatus: getStatusRealValueByStatusCodeForStudent(orderData.orderStatus),
                    kitId: orderData.kitId
                }
            } else {
                return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
            }
        }
        return finaldata;
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}


const getStatusListingOfStudentForFilterationService = async (req, res) => {
    try {
        let statusListing = [
            //------------------admin manual issue statuses-----------------------
            {
                label: 'Admin-Issued,Offline Payment Pending,Awaiting Pickup',
                value: 'adminIssueOfflinePaymentPendingAwaitingPickup'
            },
            {
                label: 'Admin-Issued,Offline Payment Received,Awaiting Pickup',
                value: 'adminIssueOfflinePaymentReceivedAwaitingPickup'
            },
            {
                label: 'Admin-Issued,Offline Payment Received,Item Picked up',
                value: 'adminIssueOfflinePaymentReceivedPickedUp'
            },
            //------------------admin issue rejected statuses-----------------------
            {
                label: 'Admin-Issued,Rejected',
                value: 'adminIssueRejected'
            },
            //------------------student online issue and offline payment (COD)statuses-----------------------
            {
                label: 'Student order,Offline Payment Pending,Awaiting Pickup',
                value: 'studentOrderOfflinePaymentPendingAwaitingPickup'
            },
            {
                label: 'Student order,Offline Payment Received,Awaiting Pickup',
                value: 'studentOrderOfflinePaymentReceivedAwaitingPickup'
            },
            {
                label: 'Student order,Offline Payment Received,Item Picked up',
                value: 'studentOrderOfflinePaymentReceivedPickedUp'
            },
            //------------------student online issue and online payment (PG)statuses-----------------------
            {
                label: 'Student order,Online Payment Pending,Awaiting Pickup',
                value: 'studentOrderOnlinePaymentPendingAwaitingPickup'
            },
            {
                label: 'Student order,Online Payment Received,Awaiting Pickup',
                value: 'studentOrderOnlinePaymentReceivedAwaitingPickup'
            },
            {
                label: 'Student order,Online Payment Received,Item Picked up',
                value: 'studentOrderOnlinePaymentReceivedPickedUp'
            },
            //------------------Student online rejected statuses-----------------------
            {
                label: 'Student-order,Rejected',
                value: 'studentOrderRejected'
            },
        ]
        // let statusListing = [
        //     { _id: 'ADMIN_ISSUED_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP', value: 'Admin-issued,Online Payment Pending,Awaiting Pickup' },
        //     { _id: 'ADMIN_ISSUED_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP', value: 'Admin-issued,Online Payment Received,Awaiting Pickup' },
        //     { _id: 'ADMIN_ISSUED_ONLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP', value: 'Admin-issued,Online Payment Received,Item Picked up' },
        //     { _id: 'ADMIN_ISSUED_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP', value: 'Admin-issued,Offline Payment Pending,Awaiting Picked up' },
        //     { _id: 'ADMIN_ISSUED_OFFLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP', value: 'Admin-issued,Offline Payment Received,Item Picked up' },

        //     { _id: 'STUDENT_ORDER_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP', value: 'Student order,Online Payment Pending,Awaiting Pickup' },
        //     { _id: 'STUDENT_ORDER_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP', value: 'Student order,Online Payment Received,Awaiting Pickup' },
        //     { _id: 'STUDENT_ORDER_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP', value: 'Student order,Offline Payment Pending,Awaiting Pickup' },
        //     { _id: 'STUDENT_ORDER_REJECTED', value: 'Student order,Rejected' },
        //     { _id: 'STUDENT_ORDER_ONLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP', value: 'Student order,Online Payment Received,Item Picked up' },
        //     { _id: 'STUDENT_ORDER_OFFLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP', value: 'Student order,Offline Payment Received,Item Picked up' },
        //     { _id: 'STUDENT_CANCELLED_ORDER', value: 'Student cancelled order' }
        // ];
        return await apiresponse(true, MESSAGES.DATA_FOUND, 201, statusListing);

    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

/*
 *staff order section
 */
const getStaffOrdersListingService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    const orderDate = req.query
        ? req.query.orderDate
            ? req.query.orderDate
            : ''
        : '';
    const estimatedPickUpDate = req.query
        ? req.query.estimatedPickUpDate
            ? req.query.estimatedPickUpDate
            : ''
        : '';
    const orderStatus = req.query
        ? req.query.orderStatus
            ? req.query.orderStatus
            : ''
        : '';
    const pricing = req.query
        ? req.query.pricing
            ? req.query.pricing
            : ''
        : '';
    const searchKey = req.query
        ? req.query.searchKey
            ? req.query.searchKey
            : ''
        : '';

    let conditionObj = { status: true, instituteId: instituteId };
    if (orderStatus) {
        switch (orderStatus) {
            case 'adminIssueOfflinePaymentPendingAwaitingPickup':
                const statusesToMatch = ['Admin-Issued', 'Offline Payment Pending', 'Awaiting Pickup'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'adminIssueOfflinePaymentReceivedAwaitingPickup':
                const statusesToMatch2 = ['Admin-Issued', 'Offline Payment Received', 'Awaiting Pickup'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch2.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'adminIssueOfflinePaymentReceivedPickedUp':
                const statusesToMatch3 = ['Admin-Issued', 'Offline Payment Received', 'Item Picked up'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch3.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'adminIssueRejected':
                const statusesToMatch4 = ['Admin-Issued', 'Rejected'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch4.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'staffOrderOfflinePaymentPendingAwaitingPickup':
                const statusesToMatch5 = ['Staff order', 'Offline Payment Pending', 'Awaiting Pickup'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch5.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'staffOrderOfflinePaymentReceivedAwaitingPickup':
                const statusesToMatch6 = ['Staff order', 'Offline Payment Received', 'Awaiting Pickup'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch6.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'staffOrderOfflinePaymentReceivedPickedUp':
                const statusesToMatch7 = ['Staff order', 'Offline Payment Received', 'Item Picked up'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch7.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'staffOrderOnlinePaymentPendingAwaitingPickup':
                const statusesToMatch8 = ['Staff order', 'Online Payment Pending', 'Awaiting Pickup'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch8.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'staffOrderOnlinePaymentReceivedAwaitingPickup':
                const statusesToMatch9 = ['Staff order', 'Online Payment Received', 'Awaiting Pickup'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch9.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'staffOrderOnlinePaymentReceivedPickedUp':
                const statusesToMatch10 = ['Staff order', 'Online Payment Received', 'Item Picked up'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch10.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            case 'staffOrderRejected':
                const statusesToMatch11 = ['Staff order', 'Rejected'];
                conditionObj.orderStatusWeb = {
                    $all: statusesToMatch11.map(status => ({ $elemMatch: { 'status': status } }))
                }
                break;
            default:
                break;
        }
        // conditionObj.orderStatus = orderStatus;
    }
    if (pricing) {
        conditionObj.isPriceApplicable = pricing === 'PRICE_APPLICABLE' ? true : false;
    }
    // console.log(conditionObj);
    // process.exit(0);
    try {
        let queryArray = [
            {
                $match: conditionObj
            },
            {
                $match: {
                    $or: [
                        { 'itemName': { $regex: searchKey, $options: 'i' } }, // Search in item names
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    itemMasterId: 1,
                    orderId: 1,
                    transactionId: 1,
                    estimatedPickUpDate: 1,
                    orderDate: 1,
                    staffId: 1,
                    itemName: 1,
                    orderedQuantity: 1,
                    itemInStock: 1,
                    orderedItemPrice: 1,
                    orderStatus: 1,
                    isMarkedAsDamage: 1,
                    orderStatusWeb: 1,
                    orderStatusApp: 1,
                    isPaymentDone: 1,
                    isItemPickedUp: 1,
                    isItemRejected: 1
                }
            }
        ];
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
        if (estimatedPickUpDate) {
            queryArray.push({
                $match: {
                    $expr: {
                        $eq: [
                            { $dateToString: { format: '%Y-%m-%d', date: '$estimatedPickUpDate' } },
                            { $dateToString: { format: '%Y-%m-%d', date: new Date(estimatedPickUpDate) } }
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

            let aggregationResult = await inventoryStaffOrderMaster.aggregate(queryArray);

            let total = aggregationResult[0].total[0] ? aggregationResult[0].total[0].count : 0;
            let dataListing = aggregationResult[0].data;

            let finalDataListing = [];
            for (let data of dataListing) {
                let orderSize = data.orderedQuantity[0].size;
                let stockDetails = await getItemStockById(data.itemMasterId, orderSize);
                let stockCount = stockDetails ? stockDetails : 0;
                data.itemInStock = {
                    stock: stockCount,
                    unit: await getUnitNameAndIdById(data.orderedQuantity[0].unit)
                }
                let staffDetails = await getStaffDetails(req.header('Authorization'), data['staffId']);
                data.staffDetails = staffDetails;
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
            let dataByGivenId = await inventoryStaffOrderMaster.aggregate(queryArray);
            let finalDataListing = [];
            for (let data of dataByGivenId) {
                let orderSize = data.orderedQuantity[0].size;
                let stockDetails = await getItemStockById(data.itemMasterId, orderSize);
                let stockCount = stockDetails ? stockDetails : 0;
                data.itemInStock = {
                    stock: stockCount,
                    unit: await getUnitNameAndIdById(data.orderedQuantity[0].unit)
                }
                let staffDetails = await getStaffDetails(req.header('Authorization'), data['staffId']);
                data.staffDetails = staffDetails;
                finalDataListing.push(data);
            }
            let msg = dataByGivenId.length
                ? MESSAGES.DATA_FOUND
                : MESSAGES.NO_DATA_FOUND;
            if (dataByGivenId.length) {
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

const getStaffOrdersListingForDropDownService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    const staffId = req.query
        ? req.query.staffId
            ? req.query.staffId
            : ''
        : '';

    let conditionObj = {
        status: true,
        instituteId: instituteId,
        isPaymentDone: true,
        orderStatusWeb: {
            $not: {
                $elemMatch: {
                    status: { $in: ['Rejected'] }
                }
            }
        },
        'orderStatusApp.status': { $ne: 'Order Cancelled' }
    };
    if (staffId) {
        conditionObj.staffId = Number(staffId);
    }

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
                $project: {
                    _id: 1,
                    itemMasterId: 1,
                    orderId: 1,
                    transactionId: 1,
                    estimatedPickUpDate: 1,
                    orderDate: 1,
                    staffId: 1,
                    itemName: 1,
                    orderedQuantity: 1,
                    itemInStock: 1,
                    orderedItemPrice: 1,
                    itemSizesDetails: '$itemDetails.itemSizes',
                    priceApplicableToStaff: { $arrayElemAt: ['$itemDetails.priceApplicableToStaff', 0] }
                }
            }
        ];

        let dataByGivenId = await inventoryStaffOrderMaster.aggregate(queryArray);

        let msg = dataByGivenId.length
            ? MESSAGES.DATA_FOUND
            : MESSAGES.NO_DATA_FOUND;
        if (dataByGivenId.length) {
            return await apiresponse(true, msg, 201, dataByGivenId);
        } else {
            return await apiresponse(false, msg, 201, []);
        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
};

const conformPickupForStaffAfterPaymentService = async (req, res) => {
    try {
        let orderArr = req.body.orderIds;
        for (let orderId of orderArr) {
            let success = false;
            let orderDetails = await inventoryStaffOrderMaster.findOne({ _id: orderId });
            let itemDetails = await inventoryItemMaster.findOne({ _id: orderDetails.itemMasterId })
            const orderedData = orderDetails.orderedQuantity;
            if (orderDetails) {
                let pickupArr = itemDetails.priceApplicableToStaff ? [
                    {
                        status: orderDetails.orderStatusWeb[0].status,
                        colorCode: '#007A1C'
                    },
                    {
                        status: 'Offline Payment Received',
                        colorCode: '#007A1C'
                    },
                    {
                        status: 'Item Picked up',
                        colorCode: '#007A1C'
                    },
                ] : [
                    {
                        status: orderDetails.orderStatusWeb[0].status,
                        colorCode: '#007A1C'
                    },
                    {
                        status: 'Item Picked up',
                        colorCode: '#007A1C'
                    },
                ]
                let updateOrder = await inventoryStaffOrderMaster.findOneAndUpdate(
                    {
                        _id: orderId
                    },
                    {
                        $set: {
                            orderStatusWeb: pickupArr,
                            isItemPickedUp: true,
                            pickUpDate: new Date()
                        }
                    },
                    {
                        new: true
                    }
                )

            } else {
                return await apiresponse(false, MESSAGES.NO_ORDER_FOUND, 201, null);
            }
        }
        return await apiresponse(true, MESSAGES.ORDER_PICKUP_SUCCESS, 201, null);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const rejectStaffOrderService = async (req, res) => {
    try {
        let orderArr = req.body.orderIds;
        for (let orderId of orderArr) {
            let orderDetails = await inventoryStaffOrderMaster.findOne({ _id: orderId });
            if (orderDetails) {
                let itemId = orderDetails.itemMasterId
                let itemDetails = await inventoryItemMaster.findById(
                    {
                        _id: itemId
                    }
                )
                let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderDetails.orderedQuantity[0].size)
                let updateItemStock = await inventoryItemMaster.findOneAndUpdate(
                    {
                        _id: itemId
                    },
                    {
                        $inc: { [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: +orderDetails.orderedQuantity[0].quantity, 'quantityInHand.quantityInHand': +orderDetails.orderedQuantity[0].quantity }
                    }
                )
                //update order
                let webstatusArr = [
                    {
                        status: orderDetails.orderStatusWeb[0].status,
                        colorCode: '#DC3545'
                    },
                    {
                        status: 'Rejected',
                        colorCode: '#DC3545'
                    },
                ]

                let appStatus = { status: 'Order Cancelled', colorCode: '#6C131C', backgroundColorCode: '#FEE7E7' }

                let updateOrder = await inventoryStaffOrderMaster.findOneAndUpdate(
                    {
                        _id: orderId
                    },
                    {
                        $set: {
                            orderStatusWeb: webstatusArr,
                            orderStatusApp: appStatus,
                            isItemRejected: true,
                            orderRejectDate: new Date()
                        }
                    },
                    {
                        new: true
                    }
                )
                //update manual payment
                let manualPaymentDetails = await inventoryManualPaymentModel.findOne(
                    {
                        orderedUserType: 'STAFF',
                        orderId: orderId
                    }
                )
                let deleteManual = await inventoryManualPaymentModel.findByIdAndDelete(
                    {
                        _id: manualPaymentDetails._id
                    }
                )
                let deleteManualHistory = await inventoryManualPaymentHistoryModel.deleteMany(
                    {
                        manualPaymentId: manualPaymentDetails._id
                    }
                )
                // return await apiresponse(false, MESSAGES.NO_ORDER_FOUND, 201, indexOfSize);
                // let itemId = orderDetails.itemMasterId
                // let itemDetails = await inventoryItemMaster.findById(
                //     {
                //         _id: itemId
                //     }
                // )
                // let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderDetails.size)
                // let updateItemStock = await inventoryItemMaster.findOneAndUpdate(
                //     {
                //         _id: itemId
                //     },
                //     {
                //         $inc: { [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: +orderDetails.quantity, 'quantityInHand.quantityInHand': +orderDetails.quantity }
                //     }
                // )
                // //update order
                // let webstatusArr = [
                //     {
                //         status: "Admin-Issued",
                //         colorCode: "#DC3545"
                //     },
                //     {
                //         status: "Rejected",
                //         colorCode: "#DC3545"
                //     },
                // ]

                // let appStatus = { status: "Order Cancelled", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" }

                // let updateOrder = await inventoryStaffOrderMaster.findOneAndUpdate(
                //     {
                //         _id: orderId
                //     },
                //     {
                //         $set: {
                //             orderStatusWeb: webstatusArr,
                //             orderStatusApp: appStatus,
                //             isItemRejected: true,
                //             orderRejectDate: new Date()
                //         }
                //     },
                //     {
                //         new: true
                //     }
                // )
                // await inventoryStaffOrderMaster.updateOne(
                //     { _id: orderId },
                //     {
                //         $set: {
                //             orderStatus: 'STAFF_ORDER_REJECTED',
                //             updatedAt: new Date()
                //         }
                //     }
                // );
            } else {
                return await apiresponse(false, MESSAGES.NO_ORDER_FOUND, 201, null);
            }
        }
        return await apiresponse(true, MESSAGES.ORDER_REJECTED, 201, null);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const getItemOrderDetailsForStaffService = async (req, res) => {
    try {
        let { orderId } = req.params;
        let finaldata;
        let orderDetails = await inventoryStaffOrderMaster.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(orderId) }
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
                    staffId: 1,
                    itemName: 1,
                    itemMasterId: 1,
                    orderId: 1,
                    transactionId: 1,
                    orderedQuantity: 1,
                    itemInStock: 1,
                    orderedItemPrice: 1,
                    orderDate: 1,
                    estimatedPickUpDate: 1,
                    orderStatus: 1,
                    itemImages: '$itemDetails.itemImages',
                    categoryId: '$itemDetails.categoryId',
                    subCategoryId: '$itemDetails.subCategoryId',
                    reorderPointData: '$itemDetails.reorderPointData',
                    orderStatusWeb: 1,
                    orderStatusApp: 1,
                    isPaymentDone: 1,
                    isItemPickedUp: 1,
                    isItemRejected: 1
                }
            }
        ]);

        let orderData = orderDetails[0];

        if (orderData) {

            let imageArr = orderData.itemImages;
            let imgFinalArray = await Promise.all(imageArr.map(async (image) => {
                const { documentID, ...rest } = image;
                return {
                    path: await getImageFullPathById(documentID),
                    ...rest
                };
            }));
            let stockDetails = await getItemStockById(orderData.itemMasterId, orderData.orderedQuantity[0].size);
            let stockCount = stockDetails ? stockDetails : 0;
            finaldata = {
                images: imgFinalArray,
                orderDate: orderData.orderDate,
                estimatedPickUpDate: orderData.estimatedPickUpDate,
                orderId: orderData.orderId,
                transactionId: orderData.transactionId,

                category: orderData.categoryId ? await getCategoryNameAndIdById(orderData.categoryId) : 'NA',
                subCategory: orderData.subCategoryId ? await getSubcategoryNameAndIdById(orderData.subCategoryId) : 'NA',
                orderedQuantity: orderData.orderedQuantity,
                orderedItemPrice: orderData.orderedItemPrice,

                itemName: orderData.itemName,
                itemMasterId: orderData.itemMasterId,
                itemInStock: {
                    quantity: stockCount,
                    unit: orderData.orderedQuantity[0] ? await getUnitNameAndIdById(orderData.orderedQuantity[0].unit) : 'NA'
                },
                reorderPointData: {
                    reorderPoint: orderData.reorderPointData ? orderData.reorderPointData.reorderPoint : 'NA',
                    unit: orderData.reorderPointData.unit ? await getUnitNameById(orderData.reorderPointData.unit) : 'NA'
                },
                orderStatusWeb: orderData.orderStatusWeb,
                orderStatusApp: orderData.orderStatusApp,
                isPaymentDone: orderData.isPaymentDone,
                isItemPickedUp: orderData.isItemPickedUp,
                isItemRejected: orderData.isItemRejected,
            }
            let staffDetails = await getStaffDetails(req.header('Authorization'), orderData.staffId);
            finaldata.staffDetails = staffDetails;
        }
        const msg = finaldata ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
        if (finaldata) {
            return await apiresponse(true, msg, 201, finaldata);
        } else {
            return await apiresponse(false, msg, 201, null);
        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const markAnItemAsDamageItemForStaffService = async (req, res) => {
    try {
        const instituteId = req.authData.data.instituteId;
        const damageRaisedByUserId = req.authData.data.staffId;

        const itemMasterId = req.body.itemMasterId;
        const damagedQuantity = req.body.damagedQuantity;
        const orderId = req.body.orderId;
        const orderData = await inventoryStaffOrderMaster.findOne({ _id: orderId }, { isMarkedAsDamage: 1 })

        if (orderData.isMarkedAsDamage) {
            return await apiresponse(false, MESSAGES.MARKED_AS_DAMAGE, 401, null);
        }

        let itemDetailForOrder = await inventoryItemMaster.findOne({ _id: itemMasterId });

        if (itemDetailForOrder && req.body) {
            let damageData = {
                instituteId: instituteId,
                itemMasterId: itemMasterId,
                damagedQuantity: damagedQuantity,
                issueType: 'NONISSUED',
                damageRaisedByUserId: damageRaisedByUserId,
                itemImages: itemDetailForOrder.itemImages,
                categoryId: itemDetailForOrder.categoryId,
                subCategoryId: itemDetailForOrder.subCategoryId,
                fixedVendorId: itemDetailForOrder.fixedVendorId,
                itemId: itemDetailForOrder.itemId,
                store: itemDetailForOrder.store,
                itemName: itemDetailForOrder.itemName,
                itemAvailableTo: itemDetailForOrder.itemAvailableTo,
                priceApplicableToStaff: itemDetailForOrder.priceApplicableToStaff,
                exchangeableItemFor: itemDetailForOrder.exchangeableItemFor,
                exchangePeriodForStudent: itemDetailForOrder.exchangePeriodForStudent,
                exchangePeriodForStaff: itemDetailForOrder.exchangePeriodForStaff,
                pickupPeriodForStudent: itemDetailForOrder.pickupPeriodForStudent,
                pickupPeriodForStaff: itemDetailForOrder.pickupPeriodForStaff,
                taxRate: itemDetailForOrder.taxRate,
                itemSizes: itemDetailForOrder.itemSizes,
                weightData: itemDetailForOrder.weightData,
                materialType: itemDetailForOrder.materialType,
                otherDetails: itemDetailForOrder.otherDetails,
                enableTracking: itemDetailForOrder.enableTracking,
                quantityInHand: itemDetailForOrder.quantityInHand,
                reorderPoint: itemDetailForOrder.reorderPointData,
                preferredVendor: itemDetailForOrder.preferredVendor,
                dateOfPurchase: itemDetailForOrder.dateOfPurchase
            };
            // console.log(damageData);
            // process.exit(0);
            let response = await inventoryDamagedItemMaster.create(damageData);
            await inventoryStaffOrderMaster.updateOne({ _id: orderId }, {
                $set: {
                    isMarkedAsDamage: true,
                    updatedAt: new Date()
                }
            });
            return await apiresponse(true, MESSAGES.INVENTORY.DAMAGED_MASTER.DAMAGED_REQ_MOVED_TO_DAMAGE_MASTER, 201, null);
        } else {
            return await apiresponse(false, MESSAGES.SOME_DATA_MISSING, 401, null);
        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const assignItemToStaffManuallyService = async (req, res) => {
    try {
        const instituteId = req.authData.data.instituteId;
        const staffIds = req.body.staffIds;
        const orderedItemId = req.body.orderedItemId;
        const orderedQuantity = req.body.orderedQuantity;
        let noOfStaff = staffIds.length;

        /* checking that ordered quantity of item is avaliable in stock or not*/
        let orderedItemDetails = await inventoryItemMaster.findOne({ _id: orderedItemId }, { itemSizes: 1 });
        if (!orderedItemDetails) return await apiresponse(false, MESSAGES.VALID_ITEM_ID, 201, null);
        const stockRes = await checkStock(orderedItemDetails.itemSizes, orderedQuantity, noOfStaff);
        if (stockRes.success === false) return stockRes;

        if (staffIds.length > 0) {
            for (let staffId of staffIds) {
                const orderIdForItem = await generateOrderID(instituteId);
                let itemDetails = await inventoryItemMaster.findOne({ _id: orderedItemId });
                let itemSizes = itemDetails.itemSizes;

                let orderedSize = orderedQuantity[0].size;
                let inStockItem = itemSizes.find((item) => item.size === orderedSize);
                let totalItemInStock = inStockItem ? inStockItem.itemQuantity.quantity : 0;

                let pickupPeriodForStaff = itemDetails.pickupPeriodForStaff;

                let currentDate = new Date();
                let estimatedPickUpDate = new Date(currentDate);
                estimatedPickUpDate.setDate(currentDate.getDate() + pickupPeriodForStaff);
                let orderedItemPrice = orderedQuantity[0].totalSellingPrice;
                let orderedData = orderedQuantity.map((order) => {
                    return {
                        size: order.size,
                        quantity: order.quantity,
                        orderedItemPricePerUnit: order.orderedItemPricePerUnit,
                        unit: order.unit
                    }
                });

                let webStatusArr = itemDetails.priceApplicableToStaff ? [
                    {
                        status: 'Admin-Issued',
                        colorCode: '#C45806'
                    },
                    {
                        status: 'Offline Payment Pending',
                        colorCode: '#C45806'
                    },
                    {
                        status: 'Awaiting Pickup',
                        colorCode: '#C45806'
                    },
                ] : [
                    {
                        status: 'Admin-Issued',
                        colorCode: '#C45806'
                    },
                    {
                        status: 'Awaiting Pickup',
                        colorCode: '#C45806'
                    },
                ]

                const orderAssignData = {
                    instituteId: instituteId,
                    itemMasterId: orderedItemId,
                    itemName: itemDetails.itemName,
                    orderId: orderIdForItem,
                    transactionId: 'NA',
                    staffId: staffId,
                    orderedQuantity: orderedData,
                    itemInStock: totalItemInStock,
                    orderedItemPrice: orderedItemPrice,
                    isPriceApplicable: itemDetails.priceApplicableToStaff,
                    estimatedPickUpDate: estimatedPickUpDate,
                    orderStatusWeb: webStatusArr,
                    isPaymentDone: itemDetails.priceApplicableToStaff ? false : true,
                    orderStatusApp: { status: itemDetails.priceApplicableToStaff ? 'Payment Pending' : 'Payment Received', colorCode: '#6C131C', backgroundColorCode: '#FEE7E7' },
                    orderBy: 'ASSIGN_BY_ADMIN'
                }
                console.log(orderAssignData)
                // return await apiresponse(true, MESSAGES.ITEM_ASSIGN_TO_STAFF, 201, orderAssignData);

                let response = await inventoryStaffOrderMaster.create(orderAssignData);
                if (itemDetails.priceApplicableToStaff) {
                    let createManualPaymentForOrder = await inventoryManualPaymentService.createManualPayment(staffId, 'STAFF', response._id, orderedItemPrice, orderedItemPrice, instituteId)
                    if (!createManualPaymentForOrder) {
                        //delete order if manual payment is not created
                        let deleteCreatedOrder = await inventoryStaffOrderMaster.findOneAndDelete(
                            {
                                _id: response._id
                            }
                        )
                        return {
                            success: false,
                            message: `Manual Payment Not Created`,
                            code: 400,
                            data: {}
                        };
                    } else {
                        //delete count from stock
                        let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderedQuantity[0].size)
                        let updateItemCount = await inventoryItemMaster.findOneAndUpdate(
                            { _id: orderedItemId },
                            {
                                $inc: {
                                    [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: -orderedQuantity[0].quantity,
                                    'quantityInHand.quantityInHand': -orderedQuantity[0].quantity,
                                    [`itemSizes.${indexOfSize}.totalSellingPrice`]: -orderedQuantity[0].quantity * orderedQuantity[0].orderedItemPricePerUnit
                                }
                            },
                            { new: true }
                        )
                    }
                } else {
                    let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderedQuantity[0].size)
                    let updateItemCount = await inventoryItemMaster.findOneAndUpdate(
                        { _id: orderedItemId },
                        {
                            $inc: {
                                [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: -orderedQuantity[0].quantity,
                                'quantityInHand.quantityInHand': -orderedQuantity[0].quantity,
                                [`itemSizes.${indexOfSize}.totalSellingPrice`]: -orderedQuantity[0].quantity * orderedQuantity[0].orderedItemPricePerUnit
                            }
                        },
                        { new: true }
                    )
                }
                // let createManualPaymentForOrder = await inventoryManualPaymentService.createManualPayment(staffId, "STAFF", response._id, orderedItemPrice, orderedItemPrice, instituteId)
                // if (!createManualPaymentForOrder) {
                //     //delete order if manual payment is not created
                //     let deleteCreatedOrder = await inventoryStaffOrderMaster.findOneAndDelete(
                //         {
                //             _id: response._id
                //         }
                //     )
                //     return {
                //         success: false,
                //         message: `Manual Payment Not Created`,
                //         code: 400,
                //         data: {}
                //     };
                // } else {
                //     //delete count from stock
                //     let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderedQuantity[0].size)
                //     let updateItemCount = await inventoryItemMaster.findOneAndUpdate(
                //         { _id: orderedItemId },
                //         { $inc: { 
                //             [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: -orderedQuantity[0].quantity, 
                //             'quantityInHand.quantityInHand': -orderedQuantity[0].quantity,
                //             [`itemSizes.${indexOfSize}.totalSellingPrice`]: -orderedQuantity[0].quantity*orderedQuantity[0].orderedItemPricePerUnit
                //         } 
                //         },
                //         { new: true }
                //     )
                // }
            }
            return await apiresponse(true, MESSAGES.ITEM_ASSIGN_TO_STAFF, 201, null);
        } else {
            return await apiresponse(false, MESSAGES.IS_ASSIGN_POSSIBLE, 201, null);
        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const receiptPdfOfItemForStaffService = async (req, res) => {
    try {
        let { orderId } = req.params;
        let orderDetails = await inventoryStaffOrderMaster.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(orderId) }
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
                    staffId: 1,
                    itemName: 1,
                    itemMasterId: 1,
                    orderId: 1,
                    transactionId: 1,
                    orderedQuantity: 1,
                    itemInStock: 1,
                    orderedItemPrice: 1,
                    orderDate: 1,
                    estimatedPickUpDate: 1,
                    orderStatus: 1,
                    paymentMode: 1,
                    categoryId: '$itemDetails.categoryId',
                    subCategoryId: '$itemDetails.subCategoryId',
                    reorderPointData: '$itemDetails.reorderPointData',
                    itemId: '$itemDetails.itemId',
                    taxRate: '$itemDetails.taxRate'
                }
            }
        ]);

        let orderData = orderDetails[0];
        // console.log(orderData);
        // process.exit(0)
        let finaldata;
        if (orderData) {

            finaldata = {
                orderDate: getDateFormate(orderData.orderDate),
                estimatedPickUpDate: getDateFormate(orderData.estimatedPickUpDate),
                orderId: orderData.orderId,
                transactionId: orderData.transactionId,

                category: orderData.categoryId ? await getCategoryNameById(orderData.categoryId) : 'NA',
                subCategory: orderData.subCategoryId ? await getSubcategoryNameById(orderData.subCategoryId) : 'NA',
                orderedQuantity: orderData.orderedQuantity,

                orderedItemPrice: orderData.orderedItemPrice,
                itemName: orderData.itemName,
                itemMasterId: orderData.itemMasterId,
                paymentMode: orderData.paymentMode,
                itemId: orderData.itemId,
                taxRate: await getTaxPercentageById(orderData.taxRate)
            }
            let staffDetails = await getStaffDetails(req.header('Authorization'), orderData.staffId);
            finaldata.staffDetails = staffDetails;
            // console.log(finaldata);
            // process.exit(0);
            if (finaldata) {
                return finaldata;
            } else {
                return res.send(
                    await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null)
                );
            }
        } else {
            return res.send(
                await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null)
            );
        }
    } catch (error) {
        console.log(error);
        return res.send(
            await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR)
        );
    }
}

const getStatusListingOfStaffForFilterationService = async (req, res) => {
    try {
        let statusListing = [
            //------------------admin manual issue statuses-----------------------
            {
                label: 'Admin-Issued,Offline Payment Pending,Awaiting Pickup',
                value: 'adminIssueOfflinePaymentPendingAwaitingPickup'
            },
            {
                label: 'Admin-Issued,Offline Payment Received,Awaiting Pickup',
                value: 'adminIssueOfflinePaymentReceivedAwaitingPickup'
            },
            {
                label: 'Admin-Issued,Offline Payment Received,Item Picked up',
                value: 'adminIssueOfflinePaymentReceivedPickedUp'
            },
            //------------------admin issue rejected statuses-----------------------
            {
                label: 'Admin-Issued,Rejected',
                value: 'adminIssueRejected'
            },
            //------------------staff online issue and offline payment (COD)statuses-----------------------
            {
                label: 'Staff order,Offline Payment Pending,Awaiting Pickup',
                value: 'staffOrderOfflinePaymentPendingAwaitingPickup'
            },
            {
                label: 'Staff order,Offline Payment Received,Awaiting Pickup',
                value: 'staffOrderOfflinePaymentReceivedAwaitingPickup'
            },
            {
                label: 'Staff order,Offline Payment Received,Item Picked up',
                value: 'staffOrderOfflinePaymentReceivedPickedUp'
            },
            //------------------staff online issue and online payment (PG)statuses-----------------------
            {
                label: 'Staff order,Online Payment Pending,Awaiting Pickup',
                value: 'staffOrderOnlinePaymentPendingAwaitingPickup'
            },
            {
                label: 'Staff order,Online Payment Received,Awaiting Pickup',
                value: 'staffOrderOnlinePaymentReceivedAwaitingPickup'
            },
            {
                label: 'Staff order,Online Payment Received,Item Picked up',
                value: 'staffOrderOnlinePaymentReceivedPickedUp'
            },
            //------------------staff online rejected statuses-----------------------
            {
                label: 'Staff-order,Rejected',
                value: 'staffOrderRejected'
            },
        ]
        // let statusListing = [
        //     { _id: 'ADMIN_ISSUED_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP', value: 'Admin-issued,Online Payment Pending,Awaiting Pickup' },
        //     { _id: 'ADMIN_ISSUED_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP', value: 'Admin-issued,Online Payment Received,Awaiting Pickup' },
        //     { _id: 'ADMIN_ISSUED_ONLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP', value: 'Admin-issued,Online Payment Received,Item Picked up' },
        //     { _id: 'ADMIN_ISSUED_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP', value: 'Admin-issued,Offline Payment Pending,Awaiting Picked up' },
        //     { _id: 'ADMIN_ISSUED_OFFLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP', value: 'Admin-issued,Offline Payment Received,Item Picked up' },

        //     { _id: 'STAFF_ORDER_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP', value: 'Staff order,Online Payment Pending,Awaiting Pickup' },
        //     { _id: 'STAFF_ORDER_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP', value: 'Staff order,Online Payment Received,Awaiting Pickup' },
        //     { _id: 'STAFF_ORDER_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP', value: 'Staff order,Offline Payment Pending,Awaiting Pickup' },
        //     { _id: 'STAFF_ORDER_REJECTED', value: 'Staff order,Rejected' },
        //     { _id: 'STAFF_ORDER_ONLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP', value: 'Staff order,Online Payment Received,Item Picked up' },
        //     { _id: 'STAFF_ORDER_OFFLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP', value: 'Staff order,Offline Payment Received,Item Picked up' },
        //     { _id: 'STAFF_CANCELLED_ORDER', value: 'Staff cancelled order' }
        // ]
        return await apiresponse(true, MESSAGES.DATA_FOUND, 201, statusListing);

    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

export default {
    getStudentOrdersListingService,
    conformPickupForStudentAfterPaymentService,
    rejectStudentOrderService,
    getItemOrderDetailService,
    markAnItemAsDamageItemForStudentService,
    assignItemToStudentManuallyService,
    receiptPdfOfItemForStudentService,
    getStatusListingOfStudentForFilterationService,
    getStaffOrdersListingService,
    conformPickupForStaffAfterPaymentService,
    rejectStaffOrderService,
    getItemOrderDetailsForStaffService,
    markAnItemAsDamageItemForStaffService,
    assignItemToStaffManuallyService,
    receiptPdfOfItemForStaffService,
    getStatusListingOfStaffForFilterationService,
    getStudentOrdersListingForDropDownService,
    getStaffOrdersListingForDropDownService
};
