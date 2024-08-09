/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
import mongoose from 'mongoose';
import inventoryStaffOrderMaster from '../../../models/inventoryStaffOrderMaster.model.js';
import inventoryItemMaster from '../../../models/inventoryItemMaster.model.js';
import {generateOrderID} from '../../../utils/commonFunction.util.js';
import { apiresponse } from '../../../utils/commonResponse.util.js';
import MESSAGES from '../../../utils/commonMessage.util.js';

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
        const itemDetails = await inventoryItemMaster.findOne({ _id: itemId }, {itemSizes:1 ,_id:0});
        const stock = itemDetails.itemSizes;
        const stockRes = await checkStock(stock,order.orderedQuantity);
        if(stockRes.success === false) return stockRes;
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
const createAnOrderService = async (req, res) => {

    const instituteId = req.authData.data.instituteId;
    const staffId = req.authData.data.staffId;
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
        const orderStatus = paymentMode === 'ONLINE' ? 'STAFF_ORDER_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP' :'STAFF_ORDER_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP';
        for(let order of orders){
            // console.log(order);
            let itemId = order.itemId;
            let orderedQuantity = order.orderedQuantity;
            let totalSellingPrice = order.totalSellingPrice;
            let totalItemOrderRequested = orderedQuantity.reduce((sum, item) => sum + item.quantity, 0);

            const orderId= await generateOrderID(instituteId);
            let itemDetails = await inventoryItemMaster.findOne({ _id: itemId });
            // console.log(itemDetails);
            // process.exit(0);
            let itemSizes = itemDetails.itemSizes;
            let orderedSize = orderedQuantity[0].size;
            let inStockItem = itemSizes.find((item)=> item.size === orderedSize);
            let totalItemInStock = inStockItem ? inStockItem.itemQuantity.quantity : 0;
            // console.log(totalItemInStock,'totalItemInStock');
            // process.exit(0)
            let pickupPeriodForStaff = itemDetails.pickupPeriodForStaff;

            let currentDate = new Date();
            let estimatedPickUpDate = new Date(currentDate);
            estimatedPickUpDate.setDate(currentDate.getDate() + pickupPeriodForStaff);

            let orderObject = {
                    instituteId,
                    itemMasterId: itemId,
                    itemName: itemDetails ? itemDetails.itemName : '',
                    orderId: orderId,
                    transactionId: 'hdewiohdoiw37298347892',
                    staffId: staffId,
                    orderedQuantity: orderedQuantity,
                    itemInStock: totalItemInStock-totalItemOrderRequested,
                    orderedItemPrice: totalSellingPrice,
                    paymentMode: paymentMode,
                    isPriceApplicable:itemDetails.priceApplicableToStaff,
                    paymentStatus:paymentStatus,
                    estimatedPickUpDate: estimatedPickUpDate,
                    orderStatus: orderStatus
            };

            await inventoryStaffOrderMaster.create(orderObject);
            /* decrease the item stock after the order get completed */


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
            const itemDetails = await inventoryItemMaster.findOne({ _id: itemId }, { _id: 1 });
            if (!itemDetails) {
                isValid = false;
                errorMessage = MESSAGES.ORDER.VALID_ITEM_ID;
                break;
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
        const instituteId = req.authData.data.instituteId;
        const orderId = req.body.orderId;
        const exchangeData = req.body.exchangeData;
        const reasonForExchange = req.body.reasonForExchange;
        const commentForExchange = req.body.commentForExchange;

        let orderDetails = await inventoryStaffOrderMaster.findOne({_id:orderId});
        if(!orderDetails) return await apiresponse(false, MESSAGES.INVENTORY.APP.INVALID_ORDERID, 201, null);

        /* Validation that item is in stock or not.*/
        let itemDetails = await inventoryItemMaster.findOne({_id:orderDetails.itemMasterId},{itemSizes:1,itemName:1});
        const stockRes = await checkStock(itemDetails.itemSizes,exchangeData);
        if(stockRes.success === false) return stockRes;

        /*Update the exchange data field*/
        const exchangeDataArr = exchangeData.map((exData)=>{
            return {
                size:exData.size,
                quantity:exData.quantity,
                unit:new mongoose.Types.ObjectId(exData.unit),
                exchangeItemPrice:exData.exchangeItemPrice,
                exchangeStatus:'STAFF_REQ_AWAITING_PICKEDUP'
            }
        })

        await inventoryStaffOrderMaster.updateOne(
            {_id:orderId},
            {
                $set:{
                    exchangeData:exchangeDataArr,
                    reasonForExchange:reasonForExchange,
                    commentForExchange:commentForExchange,
                    exchangeRequestDate:new Date(),
                    exchangeRaisedBy:'STAFF',
                    updatedAt: new Date()
                }
            }
        );

        /* Notification of exchange request completion*/

        return await apiresponse(true, MESSAGES.INVENTORY.APP.EXCHANGE_SUCCESS, 201, null);

    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

export default {
    createAnOrderService,
    createRequestForExchangeService
};