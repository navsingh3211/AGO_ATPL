/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
import mongoose from 'mongoose';
import inventoryStudentOrderMaster from '../../../models/inventoryStudentOrderMaster.model.js';
import inventoryItemMaster from '../../../models/inventoryItemMaster.model.js';
import inventoryItemKitMaster from '../../../models/inventoryItemKitMaster.model.js';
import inventoryDamagedItemMaster from '../../../models/inventoryDamagedItemMaster.model.js';
import { apiresponse } from '../../../utils/commonResponse.util.js';
import MESSAGES from '../../../utils/commonMessage.util.js';
import {generateOrderID} from '../../../utils/commonFunction.util.js';
import {getStudentClassBatchByStudentId,getStaffDetails} from '../../../utils/helperFunction.util.js';
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

/* function to validate the stock */
const validateOrderInStock = async (orders) => {
    for(let order of orders){
        let itemId = order.itemId;
        if (order.itemFrom === 'ITEM_MASTER') {
            const itemDetails = await inventoryItemMaster.findOne({ _id: itemId }, {itemSizes:1 ,_id:0});
            const stock = itemDetails.itemSizes;
            const stockRes = await checkStock(stock,order.orderedQuantity);
            if(stockRes.success === false) return stockRes;
        } else {
            const itemKitDetails = await inventoryItemKitMaster.findOne({ _id: itemId },{kitQuantity:1});
            const kitStock = itemKitDetails.kitQuantity.quantity;
            const orderedQuantity = order.orderedQuantity[0];
            if(orderedQuantity.quantity > kitStock) return await apiresponse(false, 'Not enough item kit in stock.', 401);
        }
    }
    return await apiresponse(true, 'Item is in stock.', 201);
}

/*
1.) validate Item that has been Ordered
2.) Check that item is in stock or not
3.) Payment process
4.) if payment is successful then if item is avaliable in stock then it will be inserted into order table
5.) if payment get failed then item will get inserted in order table but as failed order status
6.) if payment is successful but after that item is not in stock then refund will be initiated.
7.) update the item stock after the order success
*/

/* in this function, there is a issue with generateOrderID function */
const createAnOrderService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    const studentId = req.authData.data.studentId;
    const classId = req.authData.data.classId;
    const batchId = req.authData.data.batchId;
    const configurationId = req.timelineData.configurationId;
    const subSessionId = req.timelineData.subSessionIds;
    // console.log(instituteId,'-',studentId,'-',classId,'-',configurationId,'-',subSessionId);
    // process.exit(0);
    try {
        const orders = req.body.orders;

        /* validate Item that has been Ordered */
        let validateOrderResponse = await validateItemOrder(orders);
        if(validateOrderResponse.success === false) return validateOrderResponse;

        /* Check that item is in stock or not */
        let validateOrderInStockResponse = await validateOrderInStock(orders);
        if(validateOrderInStockResponse.success === false) return validateOrderInStockResponse;

        /* payment part is pending */

        /* after the completion of payment,before conforming the again check that item in stack or not  pending*/

        const paymentMode = req.body.paymentMode;
        const paymentStatus = req.body.paymentStatus;
        const orderStatus = paymentMode === 'ONLINE' ? 'STUDENT_ORDER_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP' :'STUDENT_ORDER_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP';
        for(let order of orders){
            // console.log(order);
            let itemId = order.itemId;
            let itemFrom = order.itemFrom;
            let orderedQuantity = order.orderedQuantity;
            let totalSellingPrice = order.totalSellingPrice;
            let totalItemOrderRequested = orderedQuantity.reduce((sum, item) => sum + item.quantity, 0);

            if (order.itemFrom === 'ITEM_MASTER') {
                const orderId= await generateOrderID(instituteId);
                let itemDetails = await inventoryItemMaster.findOne({ _id: itemId });
                let itemSizes = itemDetails.itemSizes;
                let orderedSize = orderedQuantity[0].size;
                let inStockItem = itemSizes.find((item)=> item.size === orderedSize);
                let totalItemInStock = inStockItem ? inStockItem.itemQuantity.quantity : 0;
                // console.log(totalItemInStock,'totalItemInStock');
                // process.exit(0)
                let pickupPeriodForStudent = itemDetails.pickupPeriodForStudent;

                let currentDate = new Date();
                let estimatedPickUpDate = new Date(currentDate);
                estimatedPickUpDate.setDate(currentDate.getDate() + pickupPeriodForStudent);

                let orderObject = {
                        instituteId,
                        itemFrom:itemFrom,
                        itemMasterId: itemId,
                        itemName: itemDetails ? itemDetails.itemName : '',
                        orderId: orderId,
                        transactionId: 'hdewiohdoiw37298347892',
                        studentId: studentId,
                        configurationId: configurationId,
                        subSessionId: subSessionId,
                        classId: classId,
                        batch: batchId,
                        orderedQuantity: orderedQuantity,
                        itemInStock: totalItemInStock-totalItemOrderRequested,
                        orderedItemPrice: totalSellingPrice,
                        paymentMode: paymentMode,
                        paymentStatus:paymentStatus,
                        estimatedPickUpDate: estimatedPickUpDate,
                        orderStatus: orderStatus
                };
                await inventoryStudentOrderMaster.create(orderObject);
                /* decrease the item stock after the order get completed */

            }else{
                const orderId= await generateOrderID(instituteId);
                let itemKitDetails = await inventoryItemKitMaster.findOne({ _id: itemId });
                let pickupPeriodForStudent = itemKitDetails.pickupPeriod;
                let currentDate = new Date();
                let estimatedPickUpDate = new Date(currentDate);
                estimatedPickUpDate.setDate(currentDate.getDate() + pickupPeriodForStudent);

                let orderKitObject = {
                        instituteId,
                        itemFrom:itemFrom,
                        itemKitMasterId: itemId,
                        itemName: itemKitDetails ? itemKitDetails.itemKitName : '',
                        orderId: orderId,
                        transactionId: 'hdewiohdoiw37298347892',
                        studentId: studentId,
                        configurationId: configurationId,
                        subSessionId: subSessionId,
                        classId: classId,
                        batch: batchId,
                        orderedQuantity: orderedQuantity,
                        itemInStock: itemKitDetails.kitQuantity.quantity-totalItemOrderRequested,
                        orderedItemPrice: totalSellingPrice,
                        paymentMode: paymentMode,
                        paymentStatus:paymentStatus,
                        estimatedPickUpDate: estimatedPickUpDate,
                        orderStatus: orderStatus
                };
                // console.log(orderKitObject);
                // process.exit(0);

                await inventoryStudentOrderMaster.create(orderKitObject);
            }
            /* decrease the item stock after the order get completed */

        }
        // process.exit(0);
        return await apiresponse(true, MESSAGES.INVENTORY.APP.ORDER_SUCCESS, 201, null);

    } catch (err) {
        console.log(err);
    }

};


/* function to check that given orders in payload are valida or not */
const validateItemOrder = async (orders) => {
    if (orders) {
        let isValid = true;
        let errorMessage = null;

        for (let order of orders) {
            let itemId = order.itemId;

            if (order.itemFrom === 'ITEM_MASTER') {
                const itemDetails = await inventoryItemMaster.findOne({ _id: itemId }, { _id: 1 });
                if (!itemDetails) {
                    isValid = false;
                    errorMessage = MESSAGES.ORDER.VALID_ITEM_ID;
                    break;
                }
            } else {
                const itemKitDetails = await inventoryItemKitMaster.findOne({ _id: itemId }, { _id: 1 });
                if (!itemKitDetails) {
                    isValid = false;
                    errorMessage = MESSAGES.ORDER.VALID_ITEM_KIT_ID;
                    break;
                }
            }
        }
        if (!isValid) return await apiresponse(false, errorMessage, 401);

    } else {
        return await apiresponse(false, MESSAGES.ORDER.CHECK_ITEM_EXIT, 401);
    }
    return await apiresponse(true, MESSAGES.ORDER.ALL_ITEMS_VALID, 200);
};


const createRequestForExchangeService = async (req, res) => {
    try{
        // const instituteId = req.authData.data.instituteId;
        const orderId = req.body.orderId;
        const exchangeData = req.body.exchangeData;
        const reasonForExchange = req.body.reasonForExchange;
        const commentForExchange = req.body.commentForExchange;

        let orderDetails = await inventoryStudentOrderMaster.findOne({_id:orderId});
        if(!orderDetails) return await apiresponse(false, MESSAGES.INVENTORY.APP.INVALID_ORDERID, 201, null);

        let orderedQuantity = orderDetails.orderedQuantity;
        // console.log(exchangeData);
        // process.exit(0);


        /* Validation that item is in stock or not.*/
        let itemFrom = orderDetails.itemFrom;
        let itemDetails;
        if(itemFrom === 'ITEM_MASTER'){
            itemDetails = await inventoryItemMaster.findOne({_id:orderDetails.itemMasterId},{itemSizes:1,itemName:1});
            const stockRes = await checkStock(itemDetails.itemSizes,exchangeData);
            if(stockRes.success === false) return stockRes;
            // console.log(itemDetails);
            // process.exit(0);
        }else if(itemFrom === 'ITEM_KIT'){
            itemDetails = await inventoryItemKitMaster.findOne({ _id: orderDetails.itemKitMasterId },{kitQuantity:1});
            const kitStock = itemDetails.kitQuantity.quantity;
            const orderedQuantity = exchangeData[0];
            if(orderedQuantity.quantity > kitStock) return await apiresponse(false, 'Not enough item kit in stock.', 201);
        }
        // console.log(exchangeData);
        // process.exit(0)

        /*Update the exchange data field*/
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
                            exchangeStatus:'STUDENT_REQ_AWAITING_PICKEDUP'
                        }
                    }),
                    reasonForExchange:reasonForExchange,
                    commentForExchange:commentForExchange,
                    exchangeRaisedBy:'STUDENT',
                    exchangeRequestDate:new Date(),
                    updatedAt: new Date()
                }
            }
        );

        /* update the stock after exchange request completed*/

        return await apiresponse(true, MESSAGES.INVENTORY.APP.EXCHANGE_SUCCESS, 201, null);

    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const markAsDamageItemService = async (req, res) =>{
    try{
        const instituteId = req.authData.data.instituteId;
        const userTypes = req.authData.data.userTypes;
        // console.log(req.authData.data);
        // process.exit(0)
        const {itemId,itemFrom,damagedQuantity} = req.body;
        if(userTypes === 'STUDENT'){
            const studentId = req.authData.data.studentId;
            const studentData = await getStudentClassBatchByStudentId(req,res);

            if(itemFrom === 'ITEM_MASTER'){
                const itemDetails = await inventoryItemMaster.findOne({_id:itemId});

                let damageData = {
                    instituteId:instituteId,
                    itemFrom:itemFrom,
                    itemMasterId: itemId,
                    damagedQuantity:damagedQuantity,
                    issueType:'ISSUED',
                    damageRaisedByUserId:studentId,
                    orderByStudentDetails:{
                        class:studentData ? studentData.classId : null,
                        batch:studentData ? studentData.batchId : null
                    },
                    damageRaisedByUserType:'STUDENT',
                    fixedVendorId:itemDetails ? itemDetails.fixedVendorId : null,
                    itemName:itemDetails ? itemDetails.itemName :'NA',
                    categoryId:itemDetails.categoryId,
                    subCategoryId:itemDetails.subCategoryId
                }
                //  console.log(damageData);
                // process.exit(0);
                let damagedDone = await inventoryDamagedItemMaster.create(damageData);
                return await apiresponse(true, MESSAGES.INVENTORY.DAMAGED_MASTER.DAMAGED_REQ_MOVED_TO_DAMAGE_MASTER, 201, null);
            } else if(itemFrom === 'ITEM_KIT'){
                const itemDetails = await inventoryItemKitMaster.findOne({_id:itemId});

                let damageData = {
                    instituteId:instituteId,
                    itemFrom:itemFrom,
                    itemKitMasterId: itemId,
                    damagedQuantity:damagedQuantity,
                    issueType:'ISSUED',
                    damageRaisedByUserId:studentId,
                    orderByStudentDetails:{
                        class:studentData ? studentData.classId : null,
                        batch:studentData ? studentData.batchId : null
                    },
                    damageRaisedByUserType:'STUDENT',
                    itemName:itemDetails ? itemDetails.itemKitName :'NA'
                }
                //  console.log(damageData);
                // process.exit(0);
                let damagedDone = await inventoryDamagedItemMaster.create(damageData);
                return await apiresponse(true, MESSAGES.INVENTORY.DAMAGED_MASTER.DAMAGED_REQ_MOVED_TO_DAMAGE_MASTER, 201, null);
            }

        }else if(userTypes === 'STAFF'){
            const staffId = req.authData.data.staffId;
            const staffData = await getStaffDetails(req.header('Authorization'),staffId);
            // console.log(staffData);
            // process.exit(0);
            if(itemFrom === 'ITEM_MASTER'){
                const itemDetails = await inventoryItemMaster.findOne({_id:itemId});

                let damageData = {
                    instituteId:instituteId,
                    itemFrom:itemFrom,
                    itemMasterId: itemId,
                    damagedQuantity:damagedQuantity,
                    issueType:'ISSUED',
                    damageRaisedByUserId:staffId,
                    orderByStaffDetails:{
                        staffName:staffData ? staffData.firstName + ' ' + staffData.lastName : null,
                        employeeCode:staffData ? staffData.employeeCode : null
                    },
                    damageRaisedByUserType:'STAFF',
                    fixedVendorId:itemDetails ? itemDetails.fixedVendorId : null,
                    itemName:itemDetails ? itemDetails.itemName :'NA',
                    categoryId:itemDetails.categoryId,
                    subCategoryId:itemDetails.subCategoryId
                }
                //  console.log(damageData);
                // process.exit(0);
                let damagedDone = await inventoryDamagedItemMaster.create(damageData);
                return await apiresponse(true, MESSAGES.INVENTORY.DAMAGED_MASTER.DAMAGED_REQ_MOVED_TO_DAMAGE_MASTER, 201, null);
            }
        }
        // console.log(instituteId);
    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

export default {
    createAnOrderService,
    createRequestForExchangeService,
    markAsDamageItemService
};