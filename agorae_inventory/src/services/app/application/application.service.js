/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
import InventoryCategoryMaster from "../../../models/InventoryCategoryMaster.model.js";
import InventorySubCategoryMaster from "../../../models/inventorySubCategoryMaster.model.js";
import InventorySearchHistory from "../../../models/inventorySearchHistory.model.js";
import InventorySubCategory from "../../../models/inventorySubCategoryMaster.model.js";
import InventoryItem from "../../../models/inventoryItemMaster.model.js";
import InventoryItemNotify from "../../../models/inventoryItemNotify.model.js";
import InventoryItemWishList from "../../../models/inventoryItemWishList.model.js";
import InventoryStudentOrder from "../../../models/inventoryStudentOrderMaster.model.js";
import InventoryStaffOrder from "../../../models/inventoryStaffOrderMaster.model.js";
import InventoryItemKitMaster from "../../../models/inventoryItemKitMaster.model.js";
import InventoryCart from "../../../models/inventoryCart.model.js";
import CONSTANTS from "../../../utils/constants.util.js";
import { checkStock, generateOrderID, getCategoriesNameByIds, getCategoryNameById, getDateFormate, getStatusRealValueByStatusCodeForStudent, getSubCategoryNameByIds, getSubcategoryNameById, getTaxPercentageById, getUnitNameAndIdById } from "../../../utils/commonFunction.util.js";
import inventoryManualPaymentService from '../../inventoryManualPayment.service.js';

import mongoose from 'mongoose'
import inventoryItemMasterModel from "../../../models/inventoryItemMaster.model.js";
import inventoryManualPaymentModel from "../../../models/inventoryManualPayment.model.js";
import inventoryManualPaymentHistoryModel from "../../../models/inventoryManualPaymentHistory.model.js";
import MESSAGES from "../../../utils/commonMessage.util.js";
import { getStaffDetails, getStudentAllDetails } from "../../../utils/helperFunction.util.js";
import { apiresponse } from "../../../utils/commonResponse.util.js";

const getCategories = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    let categoryList = await InventoryCategoryMaster.find({
        $or: [{ instituteId: null }, { instituteId: instituteId }],
        status: true
    })
    return {
        success: true,
        message: 'Categories fetched',
        code: 200,
        data: categoryList
    };
};

const getSubCategories = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    const body = req.body
    let subcategoryList = await InventorySubCategoryMaster.find({
        instituteId: instituteId,
        categoryId: body.categoryId,
        status: true
    }).sort({ createdAt: -1 })
    return {
        success: true,
        message: 'SubCategories fetched',
        code: 200,
        data: subcategoryList
    };
};

const getSearchedList = async (req, res) => {
    const data = req.authData.data;
    let searchObj = {
        instituteId: data.instituteId
    }
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        searchObj.studentId = data.studentId
    } else {
        searchObj.staffId = data.staffId
    }
    let historyData = await InventorySearchHistory.find(searchObj).limit(10).sort({ createdAt: -1 })
    let result = historyData.filter(
        (person, index) => index === historyData.findIndex(
            other => person.searchText === other.searchText
        ));
    return {
        success: true,
        message: 'Search History fetched',
        code: 200,
        data: result
    };
};

const createSearchHistory = async (instituteId, userId, userType, searchText, subCategoryId) => {
    let createObj = {
        instituteId: instituteId,
        searchText: searchText,
        subCategoryId: subCategoryId
    }
    if (userType === CONSTANTS.USER_TYPES.STUDENT) {
        createObj.studentId = userId
    } else {
        createObj.staffId = userId
    }
    let historyData = await InventorySearchHistory.create(createObj)
    return true;
}

const searchSuggestions = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    let searchSubCategoryDetails = await InventorySubCategory.find({
        subCategoryName: { $regex: body.searchTerm, $options: 'i' },
        instituteId: data.instituteId
    }).limit(10)
    let dataArr = []
    for (let cnt of searchSubCategoryDetails) {
        let itemCount = await InventoryItem.countDocuments({
            subCategoryId: cnt._id,
            instituteId: data.instituteId
        })
        let tmpObj = { subCategoryId: cnt._id, subCategoryName: cnt.subCategoryName, count: itemCount }
        dataArr.push(tmpObj)
    }
    return {
        success: true,
        message: 'Search Success!',
        code: 200,
        data: dataArr
    };
}

const getSearchedItems = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    let userId;
    let pageNo = req.query.pageNo;// Page number
    let pageSize = req.query.pageSize; // Number of items per page
    const skip = (pageNo - 1) * pageSize;// Calculate the number of documents to skip
    let subCategoryName = await InventorySubCategory.findById(body.subCategoryId)
    let conditionObj = {
        subCategoryId: body.subCategoryId,
        instituteId: data.instituteId,
        // $in: ['all', 'student'],
        status: true
    }
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        userId = data.studentId
        conditionObj['$or'] = [{ itemAvailableTo: 'all' },
        { itemAvailableTo: 'student' }]
        let resSaveHistory = await createSearchHistory(data.instituteId, data.studentId, data.userTypes, subCategoryName.subCategoryName, subCategoryName._id)
    } else {
        userId = data.staffId
        conditionObj['$or'] = [{ itemAvailableTo: 'all' },
        { itemAvailableTo: 'staff' }]
        // conditionObj['$in'] = ['all', 'staff']
        let resSaveHistory = await createSearchHistory(data.instituteId, data.staffId, data.userTypes, subCategoryName.subCategoryName, subCategoryName._id)
    }
    // let sortOptions = { createdAt: -1 }
    let sortOptions = {
        itemViewCount: -1,
    }
    if (req.query.highestSellingPrice == -1) {
        sortOptions = { highestSellingPrice: -1 }
    } else if (req.query.highestSellingPrice == 1) {
        sortOptions = { highestSellingPrice: 1 }
    }

    //1 Ascending
    //-1 Descending


    if (body.avaliability == 0) {
        conditionObj['quantityInHand.quantityInHand'] = 0
    }
    if (body.avaliability == 1) {
        conditionObj['quantityInHand.quantityInHand'] = { $gt: 0 }
    }
    if (body.size.length > 0) {
        conditionObj['itemSizes.size'] = body.size
    }
    if (body.material.length > 0) {
        conditionObj.materialType = body.material
    }
    let countOfItems = await InventoryItem.countDocuments({
        ...conditionObj
    })
    let searchedItems = await InventoryItem.find({
        ...conditionObj
    }).sort(sortOptions).populate("itemImages.documentID").skip(skip).limit(pageSize).lean()
    searchedItems.forEach(e => {
        if (e.userWhislisted != undefined && e.userWhislisted.includes(userId)) {
            e["isWishlisted"] = true
        } else {
            e["isWishlisted"] = false
        }
    })
    let dataObj = {
        total: countOfItems,
        rows: searchedItems
    }
    return {
        success: true,
        message: 'Items Fetched Successfully!',
        code: 200,
        data: dataObj
    };
}

const getItemDetails = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    let userId;
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        userId = data.studentId
    } else {
        userId = data.staffId
    }
    if (body.itemFrom == 'ITEM_KIT') {
        let updateItemViewCount = await InventoryItemKitMaster.findOneAndUpdate({ _id: body.itemId }, { $inc: { itemKitViewCount: 1 } }, { new: true })
        let getKitDetails = await InventoryItemKitMaster.findById({
            _id: body.itemId
        }).populate({
            path: 'itemListingData.itemMasterId',
            model: 'inventoryItemMaster',
            populate: {
                path: 'itemImages.documentID',
                model: 'inventoryDocumentMaster'
            }
        }).lean()
        if (getKitDetails.userWhislisted != undefined && getKitDetails.userWhislisted.includes(userId)) {
            getKitDetails.isWishlisted = true
        } else {
            getKitDetails.isWishlisted = false
        }
        return {
            success: true,
            message: 'Kit Details Fetched Successfully!',
            code: 200,
            data: getKitDetails
        };
    } else {
        let updateItemViewCount = await InventoryItem.findOneAndUpdate({ _id: body.itemId }, { $inc: { itemViewCount: 1 } }, { new: true })
        let itemDetails = await InventoryItem.findById(body.itemId).populate("itemImages.documentID").lean().populate('categoryId').populate('subCategoryId')
        if (itemDetails.userWhislisted != undefined && itemDetails.userWhislisted.includes(userId)) {
            itemDetails.isWishlisted = true
        } else {
            itemDetails.isWishlisted = false
        }
        return {
            success: true,
            message: 'Item Details Fetched Successfully!',
            code: 200,
            data: itemDetails
        };
    }

}

const notifyItemStock = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    let createObj = {}
    let dataArr = []
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        createObj.studentId = data.studentId
        for (let sz of body.size) {
            createObj.instituteId = data.instituteId
            createObj.itemId = body.itemId
            createObj.size = sz
            let checkDuplicate = await InventoryItemNotify.countDocuments(createObj)
            if (checkDuplicate <= 0) {
                let storeNotifyDetails = await InventoryItemNotify.create(createObj)
                dataArr.push({ size: sz, message: `Thank you for your interest! We'll notify you when the item is back in stock` })
            } else {
                dataArr.push({ size: sz, message: `You're already registered for item size notification` })
            }
        }
    } else {
        createObj.StaffId = data.staffId
        for (let sz of body.size) {
            createObj.instituteId = data.instituteId
            createObj.itemId = body.itemId
            createObj.size = sz
            let checkDuplicate = await InventoryItemNotify.countDocuments(createObj)
            if (checkDuplicate <= 0) {
                let storeNotifyDetails = await InventoryItemNotify.create(createObj)
                dataArr.push({ size: sz, message: `Thank you for your interest! We'll notify you when the item is back in stock` })
            } else {
                dataArr.push({ size: sz, message: `You're already registered for item size notification` })
            }
        }
    }

    return {
        success: true,
        message: `Success`,
        code: 200,
        data: dataArr
    };
}

const addOrRemoveWishlist = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    let createObj = {}
    let countObj = {}
    let userTypeId;
    let checkObj = { instituteId: data.instituteId }
    createObj.instituteId = data.instituteId
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        userTypeId = data.studentId
        createObj.studentId = data.studentId
        countObj.studentId = data.studentId
        checkObj.studentId = data.studentId
    } else {
        userTypeId = data.staffId
        createObj.staffId = data.staffId
        countObj.staffId = data.staffId
        checkObj.staffId = data.staffId
    }

    if (body.itemFrom == 'ITEM_KIT') {
        checkObj.kitItemId = body.itemId
    } else {
        checkObj.itemId = body.itemId
    }
    let checkWishlistCount = await InventoryItemWishList.countDocuments(checkObj)

    if (checkWishlistCount <= 0) {
        if (body.itemFrom == 'ITEM_KIT') {
            createObj.kitItemId = body.itemId
            let createWishList = await InventoryItemWishList.create(createObj)
            let updateItem = await InventoryItemKitMaster.findOneAndUpdate({ _id: body.itemId }, { $push: { userWhislisted: userTypeId } }, { new: true })
            let checkWishlistCount = await InventoryItemWishList.countDocuments(countObj)
            return {
                success: true,
                message: `Kit Added To Wishlist!`,
                code: 200,
                data: { count: checkWishlistCount }
            };
        } else {
            createObj.itemId = body.itemId
            let createWishList = await InventoryItemWishList.create(createObj)
            let updateItem = await InventoryItem.findOneAndUpdate({ _id: body.itemId }, { $push: { userWhislisted: userTypeId } }, { new: true })
            let checkWishlistCount = await InventoryItemWishList.countDocuments(countObj)
            return {
                success: true,
                message: `Item Added To Wishlist!`,
                code: 200,
                data: { count: checkWishlistCount }
            };
        }
    } else {
        if (body.itemFrom == 'ITEM_KIT') {
            createObj.kitItemId = body.itemId
            let createWishList = await InventoryItemWishList.deleteMany(createObj)
            let updateItem = await InventoryItemKitMaster.findOneAndUpdate({ _id: body.itemId }, { $pull: { userWhislisted: userTypeId } }, { new: true })
            let checkWishlistCount = await InventoryItemWishList.countDocuments(countObj)
            return {
                success: true,
                message: `Kit Removed From Wishlist!`,
                code: 200,
                data: { count: checkWishlistCount }
            };
        } else {
            createObj.itemId = body.itemId
            let createWishList = await InventoryItemWishList.deleteMany(createObj)
            let updateItem = await InventoryItem.findOneAndUpdate({ _id: body.itemId }, { $pull: { userWhislisted: userTypeId } }, { new: true })
            let checkWishlistCount = await InventoryItemWishList.countDocuments(countObj)
            return {
                success: true,
                message: `Item Removed From Wishlist!`,
                code: 200,
                data: { count: checkWishlistCount }
            };
        }
    }
}

const getWishlist = async (req, res) => {
    const data = req.authData.data;
    let createObj = {}
    let userTypeId;
    let pageNo = req.query.pageNo;// Page number
    let pageSize = req.query.pageSize; // Number of items per page
    const skip = (pageNo - 1) * pageSize;// Calculate the number of documents to skip
    createObj.instituteId = data.instituteId
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        userTypeId = data.studentId
        createObj.studentId = data.studentId
    } else {
        userTypeId = data.staffId
        createObj.staffId = data.staffId
    }
    let wishlistCount = await InventoryItemWishList.countDocuments(createObj)

    let wishlistDetails = await InventoryItemWishList.find(createObj).populate({
        path: 'itemId',
        model: 'inventoryItemMaster',
        populate: {
            path: 'itemImages.documentID',
            model: 'inventoryDocumentMaster'
        }
    }).populate({
        path: 'kitItemId',
        model: 'inventoryItemKitMaster',
        populate: {
            path: 'itemListingData.itemMasterId',
            model: 'inventoryItemMaster',
            populate: {
                path: 'itemImages.documentID',
                model: 'inventoryDocumentMaster'
            }
        }
    }).sort({ createdAt: -1 }).skip(skip).limit(pageSize)

    let retrunObj = {
        total: wishlistCount,
        rows: wishlistDetails
    }
    return {
        success: true,
        message: `Wishlisted Items Fetched`,
        code: 200,
        data: retrunObj
    };
}

const createOrder = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    const orderId = await generateOrderID(data.instituteId);
    let arrayOfIds = []
    let itemNameArr = []
    let count = 0;
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        for (let ordr of body.orders) {
            if (ordr.itemFrom == 'ITEM_KIT') {
                let checkInventoryQuantity = await InventoryItemKitMaster.findById({ _id: ordr.itemId }).lean()
                if (ordr.quantity > checkInventoryQuantity.kitQuantity.quantity) {
                    count++
                    itemNameArr.push(ordr.itemName)
                }
            } else {
                let checkInventoryQuantity = await InventoryItem.findById({ _id: ordr.itemId }).lean()
                let indexOfSize = checkInventoryQuantity.itemSizes.findIndex(obj => obj.size === ordr.size)
                let quantityinSize = checkInventoryQuantity.itemSizes[indexOfSize].itemQuantity.quantity
                if (ordr.quantity > quantityinSize) {
                    count++
                    itemNameArr.push(ordr.itemName)
                }
            }
            if (count > 0) {
                return {
                    success: true,
                    message: `One or more items or kit in cart is out of stock.`,
                    code: 200,
                    data: itemNameArr
                };
            } else {
                for (let ordr of body.orders) {
                    if (ordr.itemFrom == 'ITEM_KIT') {
                        let statusCodArr = [
                            {
                                status: "Student Order",
                                colorCode: "#C45806"
                            },
                            {
                                status: "Offline Payment Pending",
                                colorCode: "#C45806"
                            },
                            {
                                status: "Awaiting Pickup",
                                colorCode: "#C45806"
                            },
                        ]
                        let statusOnlineArr = [
                            {
                                status: "Student Order",
                                colorCode: "#C45806"
                            },
                            {
                                status: "Online Payment Pending",
                                colorCode: "#C45806"
                            },
                            {
                                status: "Awaiting Pickup",
                                colorCode: "#C45806"
                            },
                        ]
                        let appStatusCod = { status: "Payment Pending", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" }
                        let createObj = {
                            instituteId: data.instituteId,
                            itemKitMasterId: ordr.itemId,
                            itemName: ordr.itemName,
                            itemFrom: ordr.itemFrom,
                            orderId: orderId,
                            studentId: data.studentId,
                            configurationId: ordr.configurationId,
                            subSessionId: ordr.subSessionId,
                            subSessionId: ordr.subSessionId,
                            classId: ordr.classId,
                            batch: ordr.batchId,
                            orderedQuantity: [
                                {
                                    size: ordr.size,
                                    quantity: ordr.quantity,
                                    orderedItemPricePerUnit: ordr.orderedItemPricePerUnit,
                                    unit: ordr.unit
                                }
                            ],
                            orderedItemPrice: ordr.orderedItemPrice,
                            // estimatedPickUpDate: ordr.estimatedPickUpDate,
                            estimatedPickUpDate: new Date().setDate(new Date().getDate() + ordr.estimatedPickUpDate),
                            orderDate: new Date(),
                            orderStatusWeb: body.paymentMode == 'COD' ? statusCodArr : statusOnlineArr,
                            orderStatusApp: appStatusCod,
                            paymentMode: body.paymentMode
                        }
                        let createOrder = await InventoryStudentOrder.create(createObj)
                        let createManualPaymentForOrder = await inventoryManualPaymentService.createManualPayment(data.studentId, "STUDENT", createOrder._id, ordr.orderedItemPrice, ordr.orderedItemPrice, data.instituteId)
                        console.log(createManualPaymentForOrder)
                        if (!createManualPaymentForOrder) {
                            return {
                                success: false,
                                message: `Manual Payment Not Created`,
                                code: 400,
                                data: {}
                            };
                        }
                        arrayOfIds.push(createOrder._id)
                        let updateItemCount = await InventoryItemKitMaster.findOneAndUpdate(
                            { _id: ordr.itemId },
                            { $inc: { [`kitQuantity.quantity`]: -ordr.quantity } },
                            { new: true }
                        )
                        //delete from cart 
                        let deleteFromCart = await InventoryCart.findOneAndDelete(
                            {
                                instituteId: data.instituteId,
                                kitItemId: ordr.itemId,
                                itemName: ordr.itemName,
                                studentId: data.studentId,
                                size: ordr.size,
                                quantity: ordr.quantity
                            }
                        )
                    } else {
                        let checkInventoryQuantity = await InventoryItem.findById({ _id: ordr.itemId }).lean()
                        let indexOfSize = checkInventoryQuantity.itemSizes.findIndex(obj => obj.size === ordr.size)
                        let quantityinSize = checkInventoryQuantity.itemSizes[indexOfSize].itemQuantity.quantity
                        let statusCodArr = [
                            {
                                status: "Student Order",
                                colorCode: "#C45806"
                            },
                            {
                                status: "Offline Payment Pending",
                                colorCode: "#C45806"
                            },
                            {
                                status: "Awaiting Pickup",
                                colorCode: "#C45806"
                            },
                        ]
                        let statusOnlineArr = [
                            {
                                status: "Student Order",
                                colorCode: "#C45806"
                            },
                            {
                                status: "Online Payment Pending",
                                colorCode: "#C45806"
                            },
                            {
                                status: "Awaiting Pickup",
                                colorCode: "#C45806"
                            },
                        ]
                        let appStatusCod = { status: "Payment Pending", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" }
                        let createObj = {
                            instituteId: data.instituteId,
                            itemMasterId: ordr.itemId,
                            itemName: ordr.itemName,
                            itemFrom: ordr.itemFrom,
                            orderId: orderId,
                            studentId: data.studentId,
                            configurationId: ordr.configurationId,
                            subSessionId: ordr.subSessionId,
                            subSessionId: ordr.subSessionId,
                            classId: ordr.classId,
                            batch: ordr.batchId,
                            orderedQuantity: [
                                {
                                    size: ordr.size,
                                    quantity: ordr.quantity,
                                    orderedItemPricePerUnit: ordr.orderedItemPricePerUnit,
                                    unit: ordr.unit
                                }
                            ],
                            orderedItemPrice: ordr.orderedItemPrice,
                            // estimatedPickUpDate: ordr.estimatedPickUpDate,
                            estimatedPickUpDate: new Date().setDate(new Date().getDate() + ordr.estimatedPickUpDate),
                            orderDate: new Date(),
                            orderStatusWeb: body.paymentMode == 'COD' ? statusCodArr : statusOnlineArr,
                            orderStatusApp: appStatusCod,
                            paymentMode: body.paymentMode
                        }
                        let createOrder = await InventoryStudentOrder.create(createObj)
                        let createManualPaymentForOrder = await inventoryManualPaymentService.createManualPayment(data.studentId, "STUDENT", createOrder._id, ordr.orderedItemPrice, ordr.orderedItemPrice, data.instituteId)
                        if (!createManualPaymentForOrder) {
                            return {
                                success: false,
                                message: `Manual Payment Not Created`,
                                code: 400,
                                data: {}
                            };
                        }
                        arrayOfIds.push(createOrder._id)
                        let updateItemCount = await InventoryItem.findOneAndUpdate(
                            { _id: ordr.itemId },
                            { $inc: { [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: -ordr.quantity, 'quantityInHand.quantityInHand': -ordr.quantity } },
                            { new: true }
                        )
                        //delete from cart 
                        let deleteFromCart = await InventoryCart.findOneAndDelete(
                            {
                                instituteId: data.instituteId,
                                itemId: ordr.itemId,
                                itemName: ordr.itemName,
                                studentId: data.studentId,
                                size: ordr.size,
                                quantity: ordr.quantity
                            }
                        )
                    }
                }
                return {
                    success: true,
                    message: `Student Order Created Successfully!`,
                    code: 200,
                    data: arrayOfIds
                };
            }
        }
    } else {
        for (let ordr of body.orders) {
            let checkInventoryQuantity = await InventoryItem.findById({ _id: ordr.itemId }).lean()
            let indexOfSize = checkInventoryQuantity.itemSizes.findIndex(obj => obj.size === ordr.size)
            let quantityinSize = checkInventoryQuantity.itemSizes[indexOfSize].itemQuantity.quantity
            if (ordr.quantity > quantityinSize) {
                count++
                itemNameArr.push(ordr.itemName)
            }
        }
        if (count > 0) {
            return {
                success: true,
                message: `One or more items in cart is out of stock.`,
                code: 200,
                data: itemNameArr
            };
        } else {
            for (let ordr of body.orders) {
                let checkInventoryQuantity = await InventoryItem.findById({ _id: ordr.itemId }).lean()
                let indexOfSize = checkInventoryQuantity.itemSizes.findIndex(obj => obj.size === ordr.size)
                let quantityinSize = checkInventoryQuantity.itemSizes[indexOfSize].itemQuantity.quantity
                let checkPriceIsApplicableOrNot = await inventoryItemMasterModel.findOne(
                    {
                        _id: ordr.itemId
                    }
                )
                let statusCodArr = checkPriceIsApplicableOrNot.priceApplicableToStaff ? [
                    {
                        status: "Staff-Order",
                        colorCode: "#C45806"
                    },
                    {
                        status: "Offline Payment Pending",
                        colorCode: "#C45806"
                    },
                    {
                        status: "Awaiting Pickup",
                        colorCode: "#C45806"
                    },
                ] : [
                    {
                        status: "Staff-Order",
                        colorCode: "#C45806"
                    },
                    {
                        status: "Awaiting Pickup",
                        colorCode: "#C45806"
                    },
                ]
                let statusOnlineArr = checkPriceIsApplicableOrNot.priceApplicableToStaff ? [
                    {
                        status: "Staff-Order",
                        colorCode: "#C45806"
                    },
                    {
                        status: "Online Payment Pending",
                        colorCode: "#C45806"
                    },
                    {
                        status: "Awaiting Pickup",
                        colorCode: "#C45806"
                    },
                ] : [
                    {
                        status: "Staff-Order",
                        colorCode: "#C45806"
                    },
                    {
                        status: "Awaiting Pickup",
                        colorCode: "#C45806"
                    },
                ]
                let appStatusCod = { status: checkPriceIsApplicableOrNot.priceApplicableToStaff ? "Payment Pending" : "Payment Completed", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" }
                let createObj = {
                    instituteId: data.instituteId,
                    itemMasterId: ordr.itemId,
                    itemName: ordr.itemName,
                    itemFrom: ordr.itemFrom,
                    orderId: orderId,
                    staffId: data.staffId,
                    isPriceApplicable: checkPriceIsApplicableOrNot.priceApplicableToStaff,
                    // configurationId: ordr.configurationId,
                    // subSessionId: ordr.subSessionId,
                    // subSessionId: ordr.subSessionId,
                    // classId: ordr.classId,
                    // batch: ordr.batchId,
                    orderedQuantity: [
                        {
                            size: ordr.size,
                            quantity: ordr.quantity,
                            orderedItemPricePerUnit: ordr.orderedItemPricePerUnit,
                            unit: ordr.unit
                        }
                    ],
                    orderedItemPrice: ordr.orderedItemPrice,
                    estimatedPickUpDate: new Date().setDate(new Date().getDate() + ordr.estimatedPickUpDate),
                    orderDate: new Date(),
                    orderStatusWeb: body.paymentMode == 'COD' ? statusCodArr : statusOnlineArr,
                    orderStatusApp: appStatusCod,
                    paymentMode: body.paymentMode,
                    isPaymentDone : checkPriceIsApplicableOrNot.priceApplicableToStaff ? false : true
                }
                let createOrder = await InventoryStaffOrder.create(createObj)
                let createManualPaymentForOrder = await inventoryManualPaymentService.createManualPayment(data.staffId, "STAFF", createOrder._id, ordr.orderedItemPrice, ordr.orderedItemPrice, data.instituteId)
                if (!createManualPaymentForOrder) {
                    return {
                        success: false,
                        message: `Manual Payment Not Created`,
                        code: 400,
                        data: {}
                    };
                }
                arrayOfIds.push(createOrder._id)
                let updateItemCount = await InventoryItem.findOneAndUpdate(
                    { _id: ordr.itemId },
                    { $inc: { [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: -ordr.quantity, 'quantityInHand.quantityInHand': -ordr.quantity } },
                    { new: true }
                )
                //delete from cart 
                let deleteFromCart = await InventoryCart.findOneAndDelete(
                    {
                        instituteId: data.instituteId,
                        itemId: ordr.itemId,
                        itemName: ordr.itemName,
                        staffId: data.staffId,
                        size: ordr.size,
                        quantity: ordr.quantity
                    }
                )
            }
            return {
                success: true,
                message: `Staff Order Created Successfully!`,
                code: 200,
                data: arrayOfIds
            };
        }
    }
    // if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
    //     for (let ordr of body.orders) {
    //         let checkInventoryQuantity = await InventoryItem.findById({ _id: ordr.itemId }).lean()
    //         let indexOfSize = checkInventoryQuantity.itemSizes.findIndex(obj => obj.size === ordr.size)
    //         let quantityinSize = checkInventoryQuantity.itemSizes[indexOfSize].itemQuantity.quantity
    //         if (ordr.quantity > quantityinSize) {
    //             count++
    //             itemNameArr.push(ordr.itemName)
    //         }
    //     }
    //     if (count > 0) {
    //         return {
    //             success: true,
    //             message: `One or more items in cart is out of stock.`,
    //             code: 200,
    //             data: itemNameArr
    //         };
    //     } else {
    //         for (let ordr of body.orders) {
    //             let checkInventoryQuantity = await InventoryItem.findById({ _id: ordr.itemId }).lean()
    //             let indexOfSize = checkInventoryQuantity.itemSizes.findIndex(obj => obj.size === ordr.size)
    //             let quantityinSize = checkInventoryQuantity.itemSizes[indexOfSize].itemQuantity.quantity
    //             let statusCodArr = [
    //                 {
    //                     status: "Student Order",
    //                     colorCode: "#C45806"
    //                 },
    //                 {
    //                     status: "Offline Payment Pending",
    //                     colorCode: "#C45806"
    //                 },
    //                 {
    //                     status: "Awaiting Pickup",
    //                     colorCode: "#C45806"
    //                 },
    //             ]
    //             let statusOnlineArr = [
    //                 {
    //                     status: "Student Order",
    //                     colorCode: "#C45806"
    //                 },
    //                 {
    //                     status: "Online Payment Pending",
    //                     colorCode: "#C45806"
    //                 },
    //                 {
    //                     status: "Awaiting Pickup",
    //                     colorCode: "#C45806"
    //                 },
    //             ]
    //             let appStatusCod = { status: "Payment Pending", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" }
    //             let createObj = {
    //                 instituteId: data.instituteId,
    //                 itemMasterId: ordr.itemId,
    //                 itemName: ordr.itemName,
    //                 itemFrom: ordr.itemFrom,
    //                 orderId: orderId,
    //                 studentId: data.studentId,
    //                 configurationId: ordr.configurationId,
    //                 subSessionId: ordr.subSessionId,
    //                 subSessionId: ordr.subSessionId,
    //                 classId: ordr.classId,
    //                 batch: ordr.batchId,
    //                 orderedQuantity: [
    //                     {
    //                         size: ordr.size,
    //                         quantity: ordr.quantity,
    //                         orderedItemPricePerUnit: ordr.orderedItemPricePerUnit,
    //                         unit: ordr.unit
    //                     }
    //                 ],
    //                 orderedItemPrice: ordr.orderedItemPrice,
    //                 // estimatedPickUpDate: ordr.estimatedPickUpDate,
    //                 estimatedPickUpDate: new Date().setDate(new Date().getDate() + ordr.estimatedPickUpDate),
    //                 orderDate: new Date(),
    //                 orderStatusWeb: body.paymentMode == 'COD' ? statusCodArr : statusOnlineArr,
    //                 orderStatusApp: appStatusCod,
    //                 paymentMode: body.paymentMode
    //             }
    //             let createOrder = await InventoryStudentOrder.create(createObj)
    //             let createManualPaymentForOrder = await inventoryManualPaymentService.createManualPayment(data.studentId, "STUDENT", createOrder._id, ordr.orderedItemPrice, ordr.orderedItemPrice, data.instituteId)
    //             if (!createManualPaymentForOrder) {
    //                 return {
    //                     success: false,
    //                     message: `Manual Payment Not Created`,
    //                     code: 400,
    //                     data: {}
    //                 };
    //             }
    //             arrayOfIds.push(createOrder._id)
    //             let updateItemCount = await InventoryItem.findOneAndUpdate(
    //                 { _id: ordr.itemId },
    //                 { $inc: { [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: -ordr.quantity, 'quantityInHand.quantityInHand': -ordr.quantity } },
    //                 { new: true }
    //             )
    //             //delete from cart 
    //             let deleteFromCart = await InventoryCart.findOneAndDelete(
    //                 {
    //                     instituteId: data.instituteId,
    //                     itemId: ordr.itemId,
    //                     itemName: ordr.itemName,
    //                     studentId: data.studentId,
    //                     size: ordr.size,
    //                     quantity: ordr.quantity
    //                 }
    //             )
    //         }
    //         return {
    //             success: true,
    //             message: `Student Order Created Successfully!`,
    //             code: 200,
    //             data: arrayOfIds
    //         };
    //     }
    // } else {
    //     for (let ordr of body.orders) {
    //         let checkInventoryQuantity = await InventoryItem.findById({ _id: ordr.itemId }).lean()
    //         let indexOfSize = checkInventoryQuantity.itemSizes.findIndex(obj => obj.size === ordr.size)
    //         let quantityinSize = checkInventoryQuantity.itemSizes[indexOfSize].itemQuantity.quantity
    //         if (ordr.quantity > quantityinSize) {
    //             count++
    //             itemNameArr.push(ordr.itemName)
    //         }
    //     }
    //     if (count > 0) {
    //         return {
    //             success: true,
    //             message: `One or more items in cart is out of stock.`,
    //             code: 200,
    //             data: itemNameArr
    //         };
    //     } else {
    //         for (let ordr of body.orders) {
    //             let checkInventoryQuantity = await InventoryItem.findById({ _id: ordr.itemId }).lean()
    //             let indexOfSize = checkInventoryQuantity.itemSizes.findIndex(obj => obj.size === ordr.size)
    //             let quantityinSize = checkInventoryQuantity.itemSizes[indexOfSize].itemQuantity.quantity
    //             let checkPriceIsApplicableOrNot = await inventoryItemMasterModel.findOne(
    //                 {
    //                     _id: ordr.itemId
    //                 }
    //             )
    //             let statusCodArr = [
    //                 {
    //                     status: "Staff-Order",
    //                     colorCode: "#C45806"
    //                 },
    //                 {
    //                     status: checkPriceIsApplicableOrNot.priceApplicableToStaff ? "Offline Payment Pending" : "Offline Payment Received",
    //                     colorCode: "#C45806"
    //                 },
    //                 {
    //                     status: "Awaiting Pickup",
    //                     colorCode: "#C45806"
    //                 },
    //             ]
    //             let statusOnlineArr = [
    //                 {
    //                     status: "Staff-Order",
    //                     colorCode: "#C45806"
    //                 },
    //                 {
    //                     status: checkPriceIsApplicableOrNot.priceApplicableToStaff ? "Online Payment Pending" : "Online Payment Received",
    //                     colorCode: "#C45806"
    //                 },
    //                 {
    //                     status: "Awaiting Pickup",
    //                     colorCode: "#C45806"
    //                 },
    //             ]
    //             let appStatusCod = { status: checkPriceIsApplicableOrNot.priceApplicableToStaff ? "Payment Pending" : "Payment Completed", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" }
    //             let createObj = {
    //                 instituteId: data.instituteId,
    //                 itemMasterId: ordr.itemId,
    //                 itemName: ordr.itemName,
    //                 itemFrom: ordr.itemFrom,
    //                 orderId: orderId,
    //                 staffId: data.staffId,
    //                 // configurationId: ordr.configurationId,
    //                 // subSessionId: ordr.subSessionId,
    //                 // subSessionId: ordr.subSessionId,
    //                 // classId: ordr.classId,
    //                 // batch: ordr.batchId,
    //                 orderedQuantity: [
    //                     {
    //                         size: ordr.size,
    //                         quantity: ordr.quantity,
    //                         orderedItemPricePerUnit: ordr.orderedItemPricePerUnit,
    //                         unit: ordr.unit
    //                     }
    //                 ],
    //                 orderedItemPrice: ordr.orderedItemPrice,
    //                 estimatedPickUpDate: new Date().setDate(new Date().getDate() + ordr.estimatedPickUpDate),
    //                 orderDate: new Date(),
    //                 orderStatusWeb: body.paymentMode == 'COD' ? statusCodArr : statusOnlineArr,
    //                 orderStatusApp: appStatusCod,
    //                 paymentMode: body.paymentMode
    //             }
    //             let createOrder = await InventoryStaffOrder.create(createObj)
    //             let createManualPaymentForOrder = await inventoryManualPaymentService.createManualPayment(data.staffId, "STAFF", createOrder._id, ordr.orderedItemPrice, ordr.orderedItemPrice, data.instituteId)
    //             if (!createManualPaymentForOrder) {
    //                 return {
    //                     success: false,
    //                     message: `Manual Payment Not Created`,
    //                     code: 400,
    //                     data: {}
    //                 };
    //             }
    //             arrayOfIds.push(createOrder._id)
    //             let updateItemCount = await InventoryItem.findOneAndUpdate(
    //                 { _id: ordr.itemId },
    //                 { $inc: { [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: -ordr.quantity, 'quantityInHand.quantityInHand': -ordr.quantity } },
    //                 { new: true }
    //             )
    //             //delete from cart 
    //             let deleteFromCart = await InventoryCart.findOneAndDelete(
    //                 {
    //                     instituteId: data.instituteId,
    //                     itemId: ordr.itemId,
    //                     itemName: ordr.itemName,
    //                     staffId: data.staffId,
    //                     size: ordr.size,
    //                     quantity: ordr.quantity
    //                 }
    //             )
    //         }
    //         return {
    //             success: true,
    //             message: `Staff Order Created Successfully!`,
    //             code: 200,
    //             data: arrayOfIds
    //         };
    //     }
    // }


}

const getMyOrders = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    let pageNo = req.query.pageNo;// Page number
    let pageSize = req.query.pageSize; // Number of items per page
    const skip = (pageNo - 1) * pageSize;// Calculate the number of documents to skip
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        let searchObj = {}
        let conditionObj = {}
        if (body.orderStatus == 'Picked Up') {
            conditionObj.isItemPickedUp = true
        } else if (body.orderStatus == 'Not Picked Up') {
            conditionObj.isItemPickedUp = false
        } else if (body.orderStatus == 'Item Rejected/Cancelled') {
            conditionObj.isItemRejected = true
        } else if (body.orderStatus == 'Exchange Requested') {
            conditionObj.isExchangeRequested = true
        } else if (body.orderStatus == 'Exchange Completed') {
            conditionObj['exchangeData.isExchangeAccepted'] = true
        } else if (body.orderStatus == 'Exchange Rejected') {
            conditionObj['exchangeData.isExchangeRejected'] = true
        }
        if (body.paymentStatus == 'Payment Done') {
            conditionObj.isPaymentDone = true
        }
        if (body.paymentStatus == 'Payment Not Done') {
            conditionObj.isPaymentDone = false
        }
        if (body.orderTime == 1) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                $lt: new Date()
            }
        }
        if (body.orderTime == 2) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                $lt: new Date()
            }
        }
        if (body.orderTime == 3) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                $lt: new Date()
            }
        }
        if (req.query.search) {
            searchObj = {
                $or: [
                    { 'itemName': { $regex: new RegExp(req.query.search, 'i') } },
                    // { 'orderDetails.itemDetails.description': { $regex: new RegExp(searchQuery, 'i') } },
                    // Add more fields for search as needed
                ]
            }
        }
        console.log(conditionObj, "DUDU")
        let totalCount = await InventoryStudentOrder.countDocuments({
            instituteId: data.instituteId,
            studentId: data.studentId,
            configurationId: body.configurationId,
            subSessionId: body.subSessionId,
            classId: body.classId,
            batch: body.batchId,
            orderBy: 'ME',
            ...conditionObj,
            ...searchObj
        })
        let getMyOrder = await InventoryStudentOrder.find({
            instituteId: data.instituteId,
            studentId: data.studentId,
            configurationId: body.configurationId,
            subSessionId: body.subSessionId,
            classId: body.classId,
            batch: body.batchId,
            orderBy: 'ME',
            ...conditionObj,
            ...searchObj
        }).populate({
            path: 'itemMasterId',
            model: 'inventoryItemMaster',
            populate: {
                path: 'itemImages.documentID',
                model: 'inventoryDocumentMaster'
            }
        }).populate({
            path: 'itemKitMasterId',
            model: 'inventoryItemKitMaster',
            populate: {
                path: 'itemListingData.itemMasterId',
                model: 'inventoryItemMaster',
                populate: {
                    path: 'itemImages.documentID',
                    model: 'inventoryDocumentMaster'
                }
            }
        }).sort({ createdAt: -1 }).skip(skip).limit(pageSize)
        // .populate('itemMasterId')
        return {
            success: true,
            message: `Student Order List Fetched Successfully!`,
            code: 200,
            data: {
                total: totalCount,
                rows: getMyOrder
            }
        };
    } else {
        let searchObj = {}
        let conditionObj = {}
        if (body.orderStatus == 'Picked Up') {
            conditionObj.isItemPickedUp = true
        } else if (body.orderStatus == 'Not Picked Up') {
            conditionObj.isItemPickedUp = false
        } else if (body.orderStatus == 'Item Rejected/Cancelled') {
            conditionObj.isItemRejected = true
        } else if (body.orderStatus == 'Exchange Requested') {
            conditionObj.isExchangeRequested = true
        } else if (body.orderStatus == 'Exchange Completed') {
            conditionObj['exchangeData.isExchangeAccepted'] = true
        } else if (body.orderStatus == 'Exchange Rejected') {
            conditionObj['exchangeData.isExchangeRejected'] = true
        }
        if (body.paymentStatus == 'Payment Done') {
            conditionObj.isPaymentDone = true
        }
        if (body.paymentStatus == 'Payment Not Done') {
            conditionObj.isPaymentDone = false
        }
        if (body.orderTime == 1) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                $lt: new Date()
            }
        }
        if (body.orderTime == 2) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                $lt: new Date()
            }
        }
        if (body.orderTime == 3) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                $lt: new Date()
            }
        }
        if (req.query.search) {
            searchObj = {
                $or: [
                    { 'itemName': { $regex: new RegExp(req.query.search, 'i') } },
                    // { 'orderDetails.itemDetails.description': { $regex: new RegExp(searchQuery, 'i') } },
                    // Add more fields for search as needed
                ]
            }
        }
        let totalCount = await InventoryStaffOrder.countDocuments({
            instituteId: data.instituteId,
            staffId: data.staffId,
            orderBy: 'ME',
            ...conditionObj,
            ...searchObj
        })
        let getMyOrder = await InventoryStaffOrder.find({
            instituteId: data.instituteId,
            staffId: data.staffId,
            orderBy: 'ME',
            ...conditionObj,
            ...searchObj
        }).populate({
            path: 'itemMasterId',
            model: 'inventoryItemMaster',
            populate: {
                path: 'itemImages.documentID',
                model: 'inventoryDocumentMaster'
            }
        }).sort({ createdAt: -1 }).skip(skip).limit(pageSize)
        return {
            success: true,
            message: `Staff Order List Fetched Successfully!`,
            code: 200,
            data: {
                total: totalCount,
                rows: getMyOrder
            }
        };
    }
}

const getAdminOrders = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    let pageNo = req.query.pageNo;// Page number
    let pageSize = req.query.pageSize; // Number of items per page
    const skip = (pageNo - 1) * pageSize;// Calculate the number of documents to skip
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        let searchObj = {}
        let conditionObj = {}
        if (body.orderStatus == 'Picked Up') {
            conditionObj.isItemPickedUp = true
        } else if (body.orderStatus == 'Not Picked Up') {
            conditionObj.isItemPickedUp = false
        } else if (body.orderStatus == 'Item Rejected/Cancelled') {
            conditionObj.isItemRejected = true
        } else if (body.orderStatus == 'Exchange Requested') {
            conditionObj.isExchangeRequested = true
        } else if (body.orderStatus == 'Exchange Completed') {
            conditionObj['exchangeData.isExchangeAccepted'] = true
        } else if (body.orderStatus == 'Exchange Rejected') {
            conditionObj['exchangeData.isExchangeRejected'] = true
        }
        if (body.paymentStatus == 'Payment Done') {
            conditionObj.isPaymentDone = true
        }
        if (body.paymentStatus == 'Payment Not Done') {
            conditionObj.isPaymentDone = false
        }
        if (body.orderTime == 1) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                $lt: new Date()
            }
        }
        if (body.orderTime == 2) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                $lt: new Date()
            }
        }
        if (body.orderTime == 3) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                $lt: new Date()
            }
        }
        if (req.query.search) {
            searchObj = {
                $or: [
                    { 'itemName': { $regex: new RegExp(req.query.search, 'i') } },
                    // { 'orderDetails.itemDetails.description': { $regex: new RegExp(searchQuery, 'i') } },
                    // Add more fields for search as needed
                ]
            }
        }
        console.log(conditionObj)

        let countOrders = await InventoryStudentOrder.countDocuments({
            instituteId: data.instituteId,
            studentId: data.studentId,
            configurationId: body.configurationId,
            subSessionId: body.subSessionId,
            classId: body.classId,
            batch: body.batchId,
            orderBy: 'ASSIGN_BY_ADMIN',
            ...conditionObj,
            ...searchObj
        })
        let getMyOrder = await InventoryStudentOrder.find({
            instituteId: data.instituteId,
            studentId: data.studentId,
            configurationId: body.configurationId,
            subSessionId: body.subSessionId,
            classId: body.classId,
            batch: body.batchId,
            orderBy: 'ASSIGN_BY_ADMIN',
            ...conditionObj,
            ...searchObj
        }).populate({
            path: 'itemMasterId',
            model: 'inventoryItemMaster',
            populate: {
                path: 'itemImages.documentID',
                model: 'inventoryDocumentMaster'
            }
        }).populate({
            path: 'itemKitMasterId',
            model: 'inventoryItemKitMaster',
            populate: {
                path: 'itemListingData.itemMasterId',
                model: 'inventoryItemMaster',
                populate: {
                    path: 'itemImages.documentID',
                    model: 'inventoryDocumentMaster'
                }
            }
        }).sort({ createdAt: -1 }).sort({ createdAt: -1 }).skip(skip).limit(pageSize)
        // .populate('itemMasterId').sort({ createdAt: -1 }).skip(skip).limit(pageSize)
        return {
            success: true,
            message: `Student Admin Order List Fetched Successfully!`,
            code: 200,
            data: {
                total: countOrders,
                rows: getMyOrder
            }
        };
    } else {
        let searchObj = {}
        let conditionObj = {}
        if (body.orderStatus == 'Picked Up') {
            conditionObj.isItemPickedUp = true
        } else if (body.orderStatus == 'Not Picked Up') {
            conditionObj.isItemPickedUp = false
        } else if (body.orderStatus == 'Item Rejected/Cancelled') {
            conditionObj.isItemRejected = true
        } else if (body.orderStatus == 'Exchange Requested') {
            conditionObj.isExchangeRequested = true
        } else if (body.orderStatus == 'Exchange Completed') {
            conditionObj['exchangeData.isExchangeAccepted'] = true
        } else if (body.orderStatus == 'Exchange Rejected') {
            conditionObj['exchangeData.isExchangeRejected'] = true
        }
        if (body.paymentStatus == 'Payment Done') {
            conditionObj.isPaymentDone = true
        }
        if (body.paymentStatus == 'Payment Not Done') {
            conditionObj.isPaymentDone = false
        }
        if (body.orderTime == 1) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                $lt: new Date()
            }
        }
        if (body.orderTime == 2) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                $lt: new Date()
            }
        }
        if (body.orderTime == 3) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                $lt: new Date()
            }
        }
        console.log(conditionObj)
        if (req.query.search) {
            searchObj = {
                $or: [
                    { 'itemName': { $regex: new RegExp(req.query.search, 'i') } },
                    // { 'orderDetails.itemDetails.description': { $regex: new RegExp(searchQuery, 'i') } },
                    // Add more fields for search as needed
                ]
            }
        }
        let countOrders = await InventoryStaffOrder.countDocuments({
            instituteId: data.instituteId,
            staffId: data.staffId,
            orderBy: 'ASSIGN_BY_ADMIN',
            ...conditionObj,
            ...searchObj
        })
        let getMyOrder = await InventoryStaffOrder.find({
            instituteId: data.instituteId,
            staffId: data.staffId,
            orderBy: 'ASSIGN_BY_ADMIN',
            ...conditionObj,
            ...searchObj
        }).populate({
            path: 'itemMasterId',
            model: 'inventoryItemMaster',
            populate: {
                path: 'itemImages.documentID',
                model: 'inventoryDocumentMaster'
            }
        }).sort({ createdAt: -1 }).sort({ createdAt: -1 }).skip(skip).limit(pageSize)
        // .populate('itemMasterId').sort({ createdAt: -1 }).skip(skip).limit(pageSize)
        return {
            success: true,
            message: `Staff Admin Order List Fetched Successfully!`,
            code: 200,
            data: {
                total: countOrders,
                rows: getMyOrder
            }
        };
    }


}

const getOrderDetails = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        let myOrderDetails = await InventoryStudentOrder.findOne(
            {
                _id: body.orderId
            }
        ).populate({
            path: 'itemMasterId',
            model: 'inventoryItemMaster',
            populate: {
                path: 'itemImages.documentID',
                model: 'inventoryDocumentMaster'
            }
        }).populate({
            path: 'itemKitMasterId',
            model: 'inventoryItemKitMaster',
            populate: {
                path: 'itemListingData.itemMasterId',
                model: 'inventoryItemMaster',
                populate: {
                    path: 'itemImages.documentID',
                    model: 'inventoryDocumentMaster'
                }
            }
        })

        return {
            success: true,
            message: `Student Order Details Fetched Successfully!`,
            code: 200,
            data: myOrderDetails
        };
    } else {
        let myOrderDetails = await InventoryStaffOrder.findOne(
            {
                _id: body.orderId
            }
        ).populate({
            path: 'itemMasterId',
            model: 'inventoryItemMaster',
            populate: {
                path: 'itemImages.documentID',
                model: 'inventoryDocumentMaster'
            }
        })
        return {
            success: true,
            message: `Staff Order Details Fetched Successfully!`,
            code: 200,
            data: myOrderDetails
        };
    }
}

const getKitsAssigned = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    let pageNo = req.query.pageNo;// Page number
    let pageSize = req.query.pageSize; // Number of items per page
    const skip = (pageNo - 1) * pageSize;// Calculate the number of documents to skip
    let sortOptions = {
        itemKitViewCount: -1,
    }
    if (req.query.finalSellingPrice == -1) {
        sortOptions = { finalSellingPrice: -1 }
    } else if (req.query.finalSellingPrice == 1) {
        sortOptions = { finalSellingPrice: 1 }
    }
    let kitcount = await InventoryItemKitMaster.countDocuments({
        instituteId: data.instituteId,
        classIds: body.classId,
        // castIds: body.castId
    })
    let getKitList = await InventoryItemKitMaster.find({
        instituteId: data.instituteId,
        classIds: body.classId,
        // castIds: body.castId
    }).sort(sortOptions).skip(skip).limit(pageSize).populate({
        path: 'itemListingData.itemMasterId',
        model: 'inventoryItemMaster',
        populate: {
            path: 'itemImages.documentID',
            model: 'inventoryDocumentMaster'
        }
    }).lean()
    // populate('itemListingData.itemMasterId')
    // populate({
    //     path: 'itemListingData',
    //     model: 'inventoryItemMaster',
    //     populate: {
    //         path: 'itemImages.documentID',
    //         model: 'inventoryDocumentMaster'
    //     }
    // })
    getKitList.forEach(e => {
        if (e.userWhislisted != undefined && e.userWhislisted.includes(data.studentId)) {
            e["isWishlisted"] = true
        } else {
            e["isWishlisted"] = false
        }
    })
    let returnObj = {
        count: kitcount,
        rows: getKitList
    }

    return {
        success: true,
        message: `Kits Fetched Successfully!`,
        code: 200,
        data: returnObj
    };
}

const updatePaymentStatusOrder = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        let orderStatus = {}
        let orderStatusWeb = [
            {
                status: "Student Order",
                colorCode: "#007A1C"
            },
            {
                status: "Online Payment Received",
                colorCode: "#007A1C"
            },
            {
                status: "Item Picked up",
                colorCode: "#007A1C"
            },
        ]
        let orderStatusApp = { status: "Payment Completed", colorCode: "#024700", backgroundColorCode: "#E8FFED" }
        if (body.paymentStatus == "paid") {
            // orderStatus.orderStatus = "STUDENT_ORDER_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP"
            orderStatus.paymentStatus = "SUCCESS"
            orderStatus.isPaymentDone = true
        } else {
            // orderStatus.orderStatus = "STUDENT_ORDER_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP"
            orderStatus.paymentStatus = "PENDING"
            orderStatus.isPaymentDone = false
        }
        for (let uo of body.orderIds) {
            let updateOrder = await InventoryStudentOrder.findByIdAndUpdate({ _id: uo }, { $set: { paymentStatus: orderStatus.paymentStatus, orderStatusWeb: orderStatusWeb, orderStatusApp: orderStatusApp, isPaymentDone: orderStatus.isPaymentDone } }, { new: true })
        }
        return {
            success: true,
            message: `Order Status Updated Successfully.`,
            code: 200,
            data: orderStatus
        };
    } else {
        let orderStatus = {}
        let orderStatusWeb = [
            {
                status: "Staff Order",
                colorCode: "#007A1C"
            },
            {
                status: "Online Payment Received",
                colorCode: "#007A1C"
            },
            {
                status: "Item Picked up",
                colorCode: "#007A1C"
            },
        ]
        let orderStatusApp = { status: "Payment Completed", colorCode: "#024700", backgroundColorCode: "#E8FFED" }
        if (body.paymentStatus == "paid") {
            // orderStatus.orderStatus = "STAFF_ORDER_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP"
            orderStatus.paymentStatus = "SUCCESS"
            orderStatus.isPaymentDone = true

        } else {
            // orderStatus.orderStatus = "STAFF_ORDER_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP"
            orderStatus.paymentStatus = "PENDING"
            orderStatus.isPaymentDone = false

        }
        for (let uo of body.orderIds) {
            let updateOrder = await InventoryStaffOrder.findByIdAndUpdate({ _id: uo }, { $set: { paymentStatus: orderStatus.paymentStatus, orderStatusWeb: orderStatusWeb, orderStatusApp: orderStatusApp, isPaymentDone: orderStatus.isPaymentDone } }, { new: true })
        }
        return {
            success: true,
            message: `Order Status Updated Successfully.`,
            code: 200,
            data: orderStatus
        };
    }

}

const cancelOrder = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        let webstatusArr = [
            {
                status: "Student Order",
                colorCode: "#DC3545"
            },
            {
                status: "Rejected",
                colorCode: "#DC3545"
            },
        ]
        let orderDetails = await InventoryStudentOrder.findById(
            {
                _id: body.orderId
            }
        )
        let itemFrom = orderDetails.itemFrom
        if (itemFrom == "ITEM_MASTER") {
            let itemDetails = await inventoryItemMasterModel.findById(
                {
                    _id: orderDetails.itemMasterId
                }
            )
            let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderDetails.orderedQuantity[0].size)
            let updateItemStock = await inventoryItemMasterModel.findOneAndUpdate(
                {
                    _id: orderDetails.itemMasterId
                },
                {
                    $inc: { [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: +orderDetails.orderedQuantity[0].quantity, 'quantityInHand.quantityInHand': +orderDetails.orderedQuantity[0].quantity }
                }
            )
        } else {
            let updateItemCount = await InventoryItemKitMaster.findOneAndUpdate(
                { _id: orderDetails.itemKitMasterId },
                { $inc: { 'kitQuantity.quantity': +orderDetails.orderedQuantity[0].quantity } },
                { new: true }
            )
        }
        let updateOrder = await InventoryStudentOrder.findByIdAndUpdate({ _id: body.orderId }, { $set: { orderStatusApp: { status: "Order Cancelled", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" }, orderStatusWeb: webstatusArr, isItemRejected: true, orderRejectDate: new Date() } }, { new: true })
        //update manual payment
        let manualPaymentDetails = await inventoryManualPaymentModel.findOne(
            {
                orderedUserType: 'STUDENT',
                orderId: body.orderId
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
        return {
            success: true,
            message: `Order Cancelled Successfully.`,
            code: 200,
            data: {}
        };
    } else {
        let webstatusArr = [
            {
                status: "Staff Order",
                colorCode: "#DC3545"
            },
            {
                status: "Rejected",
                colorCode: "#DC3545"
            },
        ]
        let orderDetails = await InventoryStaffOrder.findById(
            {
                _id: body.orderId
            }
        )
        let itemDetails = await inventoryItemMasterModel.findById(
            {
                _id: orderDetails.itemMasterId
            }
        )
        let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderDetails.orderedQuantity[0].size)
        let updateItemStock = await inventoryItemMasterModel.findOneAndUpdate(
            {
                _id: orderDetails.itemMasterId
            },
            {
                $inc: { [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: +orderDetails.orderedQuantity[0].quantity, 'quantityInHand.quantityInHand': +orderDetails.orderedQuantity[0].quantity }
            }
        )
        let updateOrder = await InventoryStaffOrder.findByIdAndUpdate({ _id: body.orderId }, { $set: { orderStatusApp: { status: "Order Cancelled", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" }, orderStatusWeb: webstatusArr, isItemRejected: true, orderRejectDate: new Date() } }, { new: true })
        //update manual payment
        let manualPaymentDetails = await inventoryManualPaymentModel.findOne(
            {
                orderedUserType: 'STAFF',
                orderId: body.orderId
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
        return {
            success: true,
            message: `Order Cancelled Successfully.`,
            code: 200,
            data: {}
        };
    }

}

const addToCart = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    let userTypeId;
    let createObj = {
        instituteId: data.instituteId,
        totalPrice: body.price,
        price: body.price,
        itemName: body.itemName,
        size: body.size,
        quantity: body.quantity,
        pickupPeriod: body.pickupPeriod
        // ...body
    }

    // let checkCount
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        if (body.itemFrom == 'ITEM_KIT') {
            let checkCount = await InventoryCart.findOne({ instituteId: data.instituteId, studentId: data.studentId, kitItemId: body.itemId })
            if (checkCount != null && checkCount.quantity > 0 && checkCount.quantity < 5) {
                console.log(checkCount.quantity)
                let currentCount = checkCount.quantity
                let calculateTotalPrice = checkCount.price * (currentCount + 1)
                let updateQuantity = await InventoryCart.updateOne({
                    instituteId: data.instituteId, studentId: data.studentId, kitItemId: body.itemId
                }, {
                    $inc: { quantity: 1 }, totalPrice: calculateTotalPrice
                })
                let cartListCount = await InventoryCart.countDocuments({ instituteId: data.instituteId, studentId: data.studentId })
                return {
                    success: true,
                    message: `Kit already in cart, Quantity updated!`,
                    code: 200,
                    data: { count: cartListCount }
                }
            } else if (checkCount != null && checkCount.quantity >= 5) {
                console.log(checkCount.quantity)
                let cartListCount = await InventoryCart.countDocuments({ instituteId: data.instituteId, studentId: data.studentId })
                return {
                    success: true,
                    message: `Cannot add one kit of greater quantity than 5.`,
                    code: 200,
                    data: { count: cartListCount }
                }
            } else {
                userTypeId = data.studentId
                createObj.studentId = data.studentId
                createObj.kitItemId = body.itemId
                let createCart = await InventoryCart.create(createObj)
                let cartListCount = await InventoryCart.countDocuments({ instituteId: data.instituteId, studentId: data.studentId })
                return {
                    success: true,
                    message: `Kit added to Cart Successfully!`,
                    code: 200,
                    data: { count: cartListCount }
                };
            }
        } else {
            let checkCount = await InventoryCart.findOne({ instituteId: data.instituteId, studentId: data.studentId, itemId: body.itemId, size: body.size })
            if (checkCount != null && checkCount.quantity > 0 && checkCount.quantity < 5) {
                let currentCount = checkCount.quantity
                let calculateTotalPrice = checkCount.price * (currentCount + 1)
                let updateQuantity = await InventoryCart.updateOne({
                    instituteId: data.instituteId, studentId: data.studentId, itemId: body.itemId, size: body.size
                }, {
                    $inc: { quantity: 1 }, totalPrice: calculateTotalPrice
                })
                let cartListCount = await InventoryCart.countDocuments({ instituteId: data.instituteId, studentId: data.studentId })

                return {
                    success: true,
                    message: `Item already in cart, Quantity updated!`,
                    code: 200,
                    data: { count: cartListCount }
                }
            } else if (checkCount != null && checkCount.quantity >= 5) {
                let cartListCount = await InventoryCart.countDocuments({ instituteId: data.instituteId, studentId: data.studentId })
                return {
                    success: true,
                    message: `Cannot add one item of greater quantity than 5.`,
                    code: 200,
                    data: { count: cartListCount }
                }
            } else {
                userTypeId = data.studentId
                createObj.studentId = data.studentId
                createObj.itemId = body.itemId
                let createCart = await InventoryCart.create(createObj)
                let cartListCount = await InventoryCart.countDocuments({ instituteId: data.instituteId, studentId: data.studentId })
                return {
                    success: true,
                    message: `Item added to Cart Successfully!`,
                    code: 200,
                    data: { count: cartListCount }
                };
            }
        }
    } else {
        let checkCount = await InventoryCart.findOne({ instituteId: data.instituteId, staffId: data.staffId, itemId: body.itemId, size: body.size })
        if (checkCount != null && checkCount.quantity > 0) {
            let currentCount = checkCount.quantity
            let calculateTotalPrice = checkCount.price * (currentCount + 1)
            let updateQuantity = await InventoryCart.updateOne({
                instituteId: data.instituteId, staffId: data.staffId, itemId: body.itemId, size: body.size
            }, {
                $inc: { quantity: 1 }, totalPrice: calculateTotalPrice
            })
            let cartListCount = await InventoryCart.countDocuments({ instituteId: data.instituteId, staffId: data.staffId })
            return {
                success: true,
                message: `Item already in cart, Quantity updated!`,
                code: 200,
                data: { count: cartListCount }
            }
        } else if (checkCount != null && checkCount.quantity == 5) {
            let cartListCount = await InventoryCart.countDocuments({ instituteId: data.instituteId, staffId: data.staffId })
            return {
                success: true,
                message: `Cannot add one item of greater quantity than 5.`,
                code: 200,
                data: { count: cartListCount }
            }
        } else {
            userTypeId = data.staffId
            createObj.staffId = data.staffId
            createObj.itemId = body.itemId
            let createCart = await InventoryCart.create(createObj)
            let cartListCount = await InventoryCart.countDocuments({ instituteId: data.instituteId, staffId: data.staffId })
            return {
                success: true,
                message: `Item added to Cart Successfully!`,
                code: 200,
                data: { count: cartListCount }
            };
        }

    }

}

const removeFromCart = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        let removeCart = await InventoryCart.findByIdAndDelete({ _id: body.cartId })
        let cartListCount = await InventoryCart.countDocuments({ instituteId: data.instituteId, studentId: data.studentId })
        return {
            success: true,
            message: `Item removed from Cart Successfully!`,
            code: 200,
            data: { count: cartListCount }
        };
    } else {
        let removeCart = await InventoryCart.findByIdAndDelete({ _id: body.cartId })
        let cartListCount = await InventoryCart.countDocuments({ instituteId: data.instituteId, staffId: data.staffId })
        return {
            success: true,
            message: `Item removed from Cart Successfully!`,
            code: 200,
            data: { count: cartListCount }
        };
    }

}

const getCartList = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        let totalSum = 0
        let totalQuantity = 0
        let cartList = await InventoryCart.find({ instituteId: data.instituteId, studentId: data.studentId }).sort({ createdAt: -1 }).populate({
            path: 'itemId',
            model: 'inventoryItemMaster',
            populate: {
                path: 'itemImages.documentID',
                model: 'inventoryDocumentMaster'
            }
        }).populate({
            path: 'kitItemId',
            model: 'inventoryItemKitMaster',
            populate: {
                path: 'itemListingData.itemMasterId',
                model: 'inventoryItemMaster',
                populate: {
                    path: 'itemImages.documentID',
                    model: 'inventoryDocumentMaster'
                }
            }
        }).lean()
        cartList.forEach(e => {
            if (e?.itemId?.userWhislisted != undefined && e?.itemId?.userWhislisted.includes(data.studentId)) {
                e["isWishlisted"] = true
            } else {
                e["isWishlisted"] = false
            }
            totalSum = e.totalPrice + totalSum
            totalQuantity = e.quantity + totalQuantity
        })
        cartList.forEach(e => {
            if (e?.kitItemId?.userWhislisted != undefined && e?.kitItemId?.userWhislisted.includes(data.studentId)) {
                e["isWishlisted"] = true
            } else {
                e["isWishlisted"] = false
            }
            totalSum = e.totalPrice + totalSum
            totalQuantity = e.quantity + totalQuantity
        })
        let retrunObj = {
            total: cartList.length,
            rows: cartList,
            totalAmount: totalSum,
            totalQuantity: totalQuantity
        }
        return {
            success: true,
            message: `Cart Fetched Successfully!`,
            code: 200,
            data: retrunObj
        };
    } else {
        let totalSum = 0
        let totalQuantity = 0
        let cartList = await InventoryCart.find({ instituteId: data.instituteId, staffId: data.staffId }).sort({ createdAt: -1 }).populate({
            path: 'itemId',
            model: 'inventoryItemMaster',
            populate: {
                path: 'itemImages.documentID',
                model: 'inventoryDocumentMaster'
            }
        }).lean()
        cartList.forEach(e => {
            if (e.itemId.userWhislisted != undefined && e.itemId.userWhislisted.includes(data.staffId)) {
                e["isWishlisted"] = true
            } else {
                e["isWishlisted"] = false
            }
            totalSum = e.totalPrice + totalSum
            totalQuantity = e.quantity + totalQuantity
        })
        let retrunObj = {
            total: cartList.length,
            rows: cartList,
            totalAmount: totalSum,
            totalQuantity: totalQuantity
        }
        return {
            success: true,
            message: `Cart Fetched Successfully!`,
            code: 200,
            data: retrunObj
        };
    }

}

const updateCart = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    let updateCartDetails = await InventoryCart.findByIdAndUpdate({ _id: body.cartId }, { ...body }, { new: true })
    return {
        success: true,
        message: `Cart Updated Successfully!`,
        code: 200,
        data: {}
    };
}

const getReasonForExchange = async (req, res) => {
    const data = req.authData.data;
    // const body = req.body
    let reasonsArr = ["Received a damaged item", "Size/ Fit/ Color issues.", "Wrong item received", "Change of mind or not satisfied with the item", "Item functionality issues"]
    // let updateCartDetails = await InventoryCart.findByIdAndUpdate({ _id: body.cartId }, { ...body }, { new: true })
    return {
        success: true,
        message: `Reasons Fetched Successfully!`,
        code: 200,
        data: reasonsArr
    };
}

const createExchange = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        if (body.itemFrom == 'ITEM_KIT') {
            let itemDetails = await InventoryItemKitMaster.findById(
                {
                    _id: body.itemId
                }
            )
            if (!itemDetails) return {
                success: true,
                message: `Kit of this id not present!`,
                code: 404,
                data: {}
            };
            let exchangeArr = [
                {
                    size: body.exchangeItems.size,
                    quantity: body.exchangeItems.quantity,
                    unit: body.exchangeItems.unit,
                    exchangeItemPrice: body.exchangeItems.exchangeItemPrice,
                    exchangeStatusApp: {
                        status: "Exchange Requested",
                        colorCode: "#CF8E00",
                        backgroundColorCode: "#FFFBF1"
                    },
                    exchangeEstimatedPickupDate: new Date().setDate(new Date().getDate() + itemDetails.exchangePeriod)
                }
            ]
            let createAndUpdateExchangeData = await InventoryStudentOrder.findOneAndUpdate(
                {
                    _id: body.orderId
                },
                {
                    exchangeRaisedBy: 'STUDENT',
                    exchangeRequestDate: new Date(),
                    commentForExchange: body.comment,
                    reasonForExchange: body.reasonForExchange,
                    isExchangeRequested: true,
                    // $inc: {
                    //     'exchangeData.exchangeEstimatedPickupDate': addNumber * 24 * 60 * 60 * 1000
                    // },
                    $set: {
                        exchangeData: exchangeArr,
                        orderStatusApp: {
                            status: "Exchange Requested",
                            colorCode: "#CF8E00",
                            backgroundColorCode: "#FFFBF1"
                        }
                    }
                },
                {
                    new: true
                }
            )
            return {
                success: true,
                message: `Exchanged Successfully!`,
                code: 200,
                data: exchangeArr
            };
        } else {
            let itemDetails = await inventoryItemMasterModel.findById(
                {
                    _id: body.itemId
                }
            )
            if (!itemDetails) return {
                success: true,
                message: `Item of this id not present!`,
                code: 404,
                data: {}
            };
            let exchangeArr = [
                {
                    size: body.exchangeItems.size,
                    quantity: body.exchangeItems.quantity,
                    unit: body.exchangeItems.unit,
                    exchangeItemPrice: body.exchangeItems.exchangeItemPrice,
                    exchangeStatusApp: {
                        status: "Exchange Requested",
                        colorCode: "#CF8E00",
                        backgroundColorCode: "#FFFBF1"
                    },
                    exchangeEstimatedPickupDate: new Date().setDate(new Date().getDate() + itemDetails.exchangePeriodForStudent)
                }
            ]
            // let addNumber = itemDetails.exchangePeriodForStudent
            let createAndUpdateExchangeData = await InventoryStudentOrder.findOneAndUpdate(
                {
                    _id: body.orderId
                },
                {
                    exchangeRaisedBy: 'STUDENT',
                    exchangeRequestDate: new Date(),
                    commentForExchange: body.comment,
                    reasonForExchange: body.reasonForExchange,
                    isExchangeRequested: true,
                    // $inc: {
                    //     'exchangeData.exchangeEstimatedPickupDate': addNumber * 24 * 60 * 60 * 1000
                    // },
                    $set: {
                        exchangeData: exchangeArr,
                        orderStatusApp: {
                            status: "Exchange Requested",
                            colorCode: "#CF8E00",
                            backgroundColorCode: "#FFFBF1"
                        }
                    }
                },
                {
                    new: true
                }
            )
            return {
                success: true,
                message: `Exchanged Successfully!`,
                code: 200,
                data: exchangeArr
            };
        }

    } else {

        let itemDetails = await inventoryItemMasterModel.findById(
            {
                _id: body.itemId
            }
        )
        if (!itemDetails) return {
            success: true,
            message: `Item of this id not present!`,
            code: 404,
            data: {}
        };
        let exchangeArr = [
            {
                size: body.exchangeItems.size,
                quantity: body.exchangeItems.quantity,
                unit: body.exchangeItems.unit,
                exchangeItemPrice: body.exchangeItems.exchangeItemPrice,
                exchangeStatusApp: {
                    status: "Exchange Requested",
                    colorCode: "#CF8E00",
                    backgroundColorCode: "#FFFBF1"
                },
                exchangeEstimatedPickupDate: new Date().setDate(new Date().getDate() + itemDetails.exchangePeriodForStudent)
            }
        ]
        let createAndUpdateExchangeData = await InventoryStaffOrder.findOneAndUpdate(
            {
                _id: body.orderId
            },
            {
                exchangeRaisedBy: 'STAFF',
                exchangeRequestDate: new Date(),
                commentForExchange: body.comment,
                reasonForExchange: body.reasonForExchange,
                isExchangeRequested: true,
                // $inc: {
                //     'exchangeData.exchangeEstimatedPickupDate': addNumber * 24 * 60 * 60 * 1000
                // },
                $set: {
                    exchangeData: exchangeArr,
                    orderStatusApp: {
                        status: "Exchange Requested",
                        colorCode: "#CF8E00",
                        backgroundColorCode: "#FFFBF1"
                    }
                }
            },
            {
                new: true
            }
        )

        return {
            success: true,
            message: `Exchanged Successfully!`,
            code: 200,
            data: exchangeArr
        };
    }

}

const filterSubCategory = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    let conditionObj = {
        subCategoryId: body.subCategoryId,
        instituteId: data.instituteId,
    }
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        conditionObj['$or'] = [{ itemAvailableTo: 'all' },
        { itemAvailableTo: 'student' }]
    } else {
        conditionObj['$or'] = [{ itemAvailableTo: 'all' },
        { itemAvailableTo: 'staff' }]
    }
    let itemsAvailableCount = await InventoryItem.countDocuments({
        ...conditionObj,
        'quantityInHand.quantityInHand': { $gt: 0 }
    })

    let itemsUnAvailableCount = await InventoryItem.countDocuments({
        ...conditionObj,
        'quantityInHand.quantityInHand': 0
    })

    let totalItems = await InventoryItem.countDocuments({
        ...conditionObj,
    })

    let avaliability = {
        'All': totalItems,
        'Available': itemsAvailableCount,
        'Not Available': itemsUnAvailableCount
    }

    if (body.avaliability == 0) {
        conditionObj['quantityInHand.quantityInHand'] = 0
    }
    if (body.avaliability == 1) {
        conditionObj['quantityInHand.quantityInHand'] = { $gt: 0 }
    }
    if (body.size.length > 0) {
        conditionObj['itemSizes.size'] = body.size
    }
    if (body.material.length > 0) {
        conditionObj.materialType = body.material
    }
    // let test = await InventoryItem.countDocuments({
    //     ...conditionObj
    // })
    let filteredItems = await InventoryItem.find(
        {
            ...conditionObj
        }
    )
    let sizeArr = []
    let materialArr = []

    for (let i = 0; i < filteredItems.length; i++) {
        if (materialArr.length == 0 && filteredItems[i].materialType != "") {
            materialArr.push({ materialName: filteredItems[i].materialType, count: 1 })
        } else if (materialArr.length > 0 && filteredItems[i].materialType != "") {
            if (materialArr.some(e => e['materialName'] === filteredItems[i].materialType)) {
                let index = materialArr.findIndex(item => item.materialName === filteredItems[i].materialType)
                let count = materialArr[index].count + 1
                materialArr.splice(index, 1, { materialName: filteredItems[i].materialType, count: count })
            } else {
                materialArr.push({ materialName: filteredItems[i].materialType, count: 1 })
            }
        }
        for (let j = 0; j < filteredItems[i].itemSizes.length; j++) {
            // if (!sizeArr.includes(filteredItems[i].itemSizes[j].size) && filteredItems[i].itemSizes[j].size != "") {
            //     sizeArr.push(filteredItems[i].itemSizes[j].size)
            // }
            // sizeArr.push({ sizeName: filteredItems[i].itemSizes[j].size, count: 1 })
            if (sizeArr.length == 0) {
                sizeArr.push({ sizeName: filteredItems[i].itemSizes[j].size, count: filteredItems[i].itemSizes[j].itemQuantity.quantity })
            } else if (sizeArr.length > 0) {
                if (sizeArr.some(e => e['sizeName'] === filteredItems[i].itemSizes[j].size)) {
                    let index = sizeArr.findIndex(item => item.sizeName === filteredItems[i].itemSizes[j].size)
                    let count = sizeArr[index].count + filteredItems[i].itemSizes[j].itemQuantity.quantity
                    sizeArr.splice(index, 1, { sizeName: filteredItems[i].itemSizes[j].size, count: count })
                } else {
                    sizeArr.push({ sizeName: filteredItems[i].itemSizes[j].size, count: filteredItems[i].itemSizes[j].itemQuantity.quantity })
                }
            }
        }
    }


    let returnObj = {
        "avaliability": avaliability,
        "size": sizeArr,
        "material": materialArr
    }

    return {
        success: true,
        message: `Filtered Data Fetched Successfully!`,
        code: 200,
        data: returnObj
    };
}

const filterOrder = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        //Basic condition
        // let conditionObj = {
        //     instituteId: data.instituteId, studentId: data.studentId, orderBy: body.orderBy
        // }
        let conditionObj = {
            instituteId: data.instituteId,
            studentId: data.studentId,
            configurationId: body.configurationId,
            subSessionId: body.subSessionId,
            classId: body.classId,
            batch: body.batchId,
            orderBy: body.orderBy,
        }
        if (body.orderStatus == 'Picked Up') {
            conditionObj.isItemPickedUp = true
        } else if (body.orderStatus == 'Not Picked Up') {
            conditionObj.isItemPickedUp = false
        } else if (body.orderStatus == 'Item Rejected/Cancelled') {
            conditionObj.isItemRejected = true
        } else if (body.orderStatus == 'Exchange Requested') {
            conditionObj.isExchangeRequested = true
        } else if (body.orderStatus == 'Exchange Completed') {
            conditionObj['exchangeData.isExchangeAccepted'] = true
        } else if (body.orderStatus == 'Exchange Rejected') {
            conditionObj['exchangeData.isExchangeRejected'] = true
        }
        if (body.paymentStatus == 'Payment Done') {
            conditionObj.isPaymentDone = true
        }
        if (body.paymentStatus == 'Payment Not Done') {
            conditionObj.isPaymentDone = false
        }
        if (body.orderTime == 1) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                $lt: new Date()
            }
        }
        if (body.orderTime == 2) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                $lt: new Date()
            }
        }
        if (body.orderTime == 3) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                $lt: new Date()
            }
        }
        //====================get totalorders=======================
        let totalOrders = await InventoryStudentOrder.countDocuments(conditionObj)
        // let totalOrdersww = await InventoryStudentOrder.find(conditionObj) 
        //=======================order status======================================
        const combinedStatusCounts = await InventoryStudentOrder.aggregate([
            {
                $match: conditionObj
            },
            {
                $facet: {
                    pickupStatusCounts: [
                        {
                            $group: {
                                _id: "$isItemPickedUp",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                status: {
                                    $cond: {
                                        if: { $eq: ["$_id", true] },
                                        then: "Picked Up",
                                        else: "Not Picked Up"
                                    }
                                },
                                count: 1,
                                _id: 0
                            }
                        }
                    ],
                    rejectionStatusCounts: [
                        {
                            $group: {
                                _id: "$isItemRejected",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $match: {
                                _id: true
                            }
                        },
                        {
                            $project: {
                                status: "Item Rejected/Cancelled",
                                count: 1,
                                _id: 0
                            }
                        }
                    ],
                    exchangeRequestedStatusCounts: [
                        {
                            $group: {
                                _id: "$isExchangeRequested",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $match: {
                                _id: true
                            }
                        },
                        {
                            $project: {
                                status: "Exchange Requested",
                                count: 1,
                                _id: 0
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    combinedStatusCounts: {
                        $concatArrays: ["$pickupStatusCounts", "$rejectionStatusCounts","$exchangeRequestedStatusCounts"]
                    }
                }
            },
            {
                $unwind: "$combinedStatusCounts"
            },
            {
                $replaceRoot: { newRoot: "$combinedStatusCounts" }
            }
        ]);
        const exchangeStatusCounts = await InventoryStudentOrder.aggregate([
            {
                $match: conditionObj
            },
            {
                $unwind: "$exchangeData"
            },
            {
                $match: {
                    "exchangeData.isExchangeAccepted": true
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "Exchange Completed",
                    count: 1
                }
            }
        ]);
        const exchangeStatusCountsRejected = await InventoryStudentOrder.aggregate([
            {
                $match: conditionObj
            },
            {
                $unwind: "$exchangeData"
            },
            {
                $match: {
                    "exchangeData.isExchangeRejected": true
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "Exchange Rejected",
                    count: 1
                }
            }
        ]);
        let orderStatusObj = [
            {
                status: "All",
                count: totalOrders
            },
            ...combinedStatusCounts,
            ...exchangeStatusCounts,
            ...exchangeStatusCountsRejected
        ]
        //=====================payment count========================================
        const paymentStatusCounts = await InventoryStudentOrder.aggregate([
            {
                $match: conditionObj
            },
            {
                $group: {
                    _id: "$isPaymentDone",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: {
                        $cond: {
                            if: { $eq: ["$_id", true] },
                            then: "Payment Done",
                            else: "Payment Not Done"
                        }
                    },
                    count: 1,
                    _id: 0
                }
            }
        ]);
        let paymentStatus = [
            {
                status: "All",
                count: totalOrders
            },
            ...paymentStatusCounts
        ]
        //=====================order time=================================================
        let orderTime = [
            {
                status: "Anytime",
                id: 0
            },
            {
                status: "Last 30 days",
                id: 1
            },
            {
                status: "Last 6 months",
                id: 2
            },
            {
                status: 'Last Year',
                id: 3
            }
        ]
        let returnObj = {
            orderStatus: orderStatusObj,
            paymentStatus: paymentStatus,
            orderTime: orderTime
        }
        return {
            success: true,
            message: `Filtered Order Fetched Successfully!`,
            code: 200,
            data: returnObj
        };
    } else {
        //Basic condition
        let conditionObj = {
            instituteId: data.instituteId, staffId: data.staffId, orderBy: body.orderBy
        }

        if (body.orderStatus == 'Picked Up') {
            conditionObj.isItemPickedUp = true
        } else if (body.orderStatus == 'Not Picked Up') {
            conditionObj.isItemPickedUp = false
        } else if (body.orderStatus == 'Item Rejected/Cancelled') {
            conditionObj.isItemRejected = true
        } else if (body.orderStatus == 'Exchange Requested') {
            conditionObj.isExchangeRequested = true
        } else if (body.orderStatus == 'Exchange Completed') {
            conditionObj['exchangeData.isExchangeAccepted'] = true
        } else if (body.orderStatus == 'Exchange Rejected') {
            conditionObj['exchangeData.isExchangeRejected'] = true
        }
        if (body.paymentStatus == 'Payment Done') {
            conditionObj.isPaymentDone = true
        }
        if (body.paymentStatus == 'Payment Not Done') {
            conditionObj.isPaymentDone = false
        }
        if (body.orderTime == 1) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                $lt: new Date()
            }
        }
        if (body.orderTime == 2) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                $lt: new Date()
            }
        }
        if (body.orderTime == 3) {
            conditionObj.createdAt = {
                $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                $lt: new Date()
            }
        }
        //====================get totalorders=======================
        let totalOrders = await InventoryStaffOrder.countDocuments(conditionObj)
        // let totalOrdersww = await InventoryStudentOrder.find(conditionObj) 
        //=======================order status======================================
        const combinedStatusCounts = await InventoryStaffOrder.aggregate([
            {
                $match: conditionObj
            },
            {
                $facet: {
                    pickupStatusCounts: [
                        {
                            $group: {
                                _id: "$isItemPickedUp",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                status: {
                                    $cond: {
                                        if: { $eq: ["$_id", true] },
                                        then: "Picked Up",
                                        else: "Not Picked Up"
                                    }
                                },
                                count: 1,
                                _id: 0
                            }
                        }
                    ],
                    rejectionStatusCounts: [
                        {
                            $group: {
                                _id: "$isItemRejected",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $match: {
                                _id: true
                            }
                        },
                        {
                            $project: {
                                status: "Item Rejected/Cancelled",
                                count: 1,
                                _id: 0
                            }
                        }
                    ],
                    exchangeRequestedStatusCounts: [
                        {
                            $group: {
                                _id: "$isExchangeRequested",
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $match: {
                                _id: true
                            }
                        },
                        {
                            $project: {
                                status: "Exchange Requested",
                                count: 1,
                                _id: 0
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    combinedStatusCounts: {
                        $concatArrays: ["$pickupStatusCounts", "$rejectionStatusCounts","$exchangeRequestedStatusCounts"]
                    }
                }
            },
            {
                $unwind: "$combinedStatusCounts"
            },
            {
                $replaceRoot: { newRoot: "$combinedStatusCounts" }
            }
        ]);

        const exchangeStatusCounts = await InventoryStaffOrder.aggregate([
            {
                $match: conditionObj
            },
            {
                $unwind: "$exchangeData"
            },
            {
                $match: {
                    "exchangeData.isExchangeAccepted": true
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "Exchange Completed",
                    count: 1
                }
            }
        ]);
        const exchangeStatusCountsRejected = await InventoryStaffOrder.aggregate([
            {
                $match: conditionObj
            },
            {
                $unwind: "$exchangeData"
            },
            {
                $match: {
                    "exchangeData.isExchangeRejected": true
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: "Exchange Rejected",
                    count: 1
                }
            }
        ]);

        let orderStatusObj = [
            {
                status: "All",
                count: totalOrders
            },
            ...combinedStatusCounts,
            ...exchangeStatusCounts,
            ...exchangeStatusCountsRejected
        ]
        //=====================payment count========================================
        const paymentStatusCounts = await InventoryStaffOrder.aggregate([
            {
                $match: conditionObj
            },
            {
                $group: {
                    _id: "$isPaymentDone",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: {
                        $cond: {
                            if: { $eq: ["$_id", true] },
                            then: "Payment Done",
                            else: "Payment Not Done"
                        }
                    },
                    count: 1,
                    _id: 0
                }
            }
        ]);
        let paymentStatus = [
            {
                status: "All",
                count: totalOrders
            },
            ...paymentStatusCounts
        ]
        //=====================order time=================================================
        let orderTime = [
            {
                status: "Anytime",
                id: 0
            },
            {
                status: "Last 30 days",
                id: 1
            },
            {
                status: "Last 6 months",
                id: 2
            },
            {
                status: 'Last Year',
                id: 3
            }
        ]
        let returnObj = {
            orderStatus: orderStatusObj,
            paymentStatus: paymentStatus,
            orderTime: orderTime
        }
        return {
            success: true,
            message: `Filtered Order Fetched Successfully!`,
            code: 200,
            data: returnObj
        };
    }


}

const filteredListItems = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    let pageNo = req.query.pageNo;// Page number
    let pageSize = req.query.pageSize; // Number of items per page
    const skip = (pageNo - 1) * pageSize;// Calculate the number of documents to skip
    let sortOptions = { itemViewCount: -1 }
    if (req.query.highestSellingPrice == -1) {
        sortOptions = { highestSellingPrice: -1 }
    } else if (req.query.highestSellingPrice == 1) {
        sortOptions = { highestSellingPrice: 1 }
    }
    let conditionObj = {
        subCategoryId: body.subCategoryId,
        instituteId: data.instituteId,
    }

    if (body.avaliability == 0) {
        conditionObj['quantityInHand.quantityInHand'] = 0
    }
    if (body.avaliability == 1) {
        conditionObj['quantityInHand.quantityInHand'] = { $gt: 0 }
    }
    if (body.size.length > 0) {
        conditionObj['itemSizes.size'] = body.size
    }
    if (body.material.length > 0) {
        conditionObj.materialType = body.material
    }
    let countOfItems = await InventoryItem.countDocuments({
        ...conditionObj
    })
    let filteredItems = await InventoryItem.find(
        {
            ...conditionObj
        }
    ).sort(sortOptions).populate("itemImages.documentID").skip(skip).limit(pageSize).lean()
    filteredItems.forEach(e => {
        if (e.userWhislisted != undefined && e.userWhislisted.includes(userId)) {
            e["isWishlisted"] = true
        } else {
            e["isWishlisted"] = false
        }
    })
    let dataObj = {
        total: countOfItems,
        rows: filteredItems
    }
    return {
        success: true,
        message: `Filtered Items Fetched Successfully!`,
        code: 200,
        data: dataObj
    };
}

const deleteOrderOnOrderCancel = async (req, res) => {
    const data = req.authData.data;
    const body = req.body
    if (data.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
        for (let ordrs of body.orderId) {
            let orderDetails = await InventoryStudentOrder.findById(
                {
                    _id: ordrs
                }
            )
            let orderType = orderDetails.itemFrom
            let orderedSize = orderDetails.orderedQuantity[0].size
            let orderedQuantity = orderDetails.orderedQuantity[0].quantity
            if (orderType == 'ITEM_MASTER') {
                let itemDetails = await InventoryItem.findById(
                    { _id: orderDetails.itemMasterId }
                )
                let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderedSize)
                let updateInventoryItem = await InventoryItem.findOneAndUpdate(
                    { _id: orderDetails.itemMasterId },
                    { $inc: { [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: orderedQuantity, 'quantityInHand.quantityInHand': orderedQuantity } },
                    { new: true }
                )
                let deleteOrder = await InventoryStudentOrder.findByIdAndDelete(
                    {
                        _id: ordrs
                    }
                )
            } else {
                let updateInventoryItem = await InventoryItemKitMaster.findOneAndUpdate(
                    { _id: orderDetails.itemMasterId },
                    { $inc: { [`kitQuantity.quantity`]: orderedQuantity } },
                    { new: true }
                )
                let deleteOrder = await InventoryStudentOrder.findByIdAndDelete(
                    {
                        _id: ordrs
                    }
                )
            }
        }

        return {
            success: true,
            message: `Order Deleted Successfully!`,
            code: 200,
            data: {}
        }
    } else {
        for (let ordrs of body.orderId) {
            let orderDetails = await InventoryStaffOrder.findById(
                {
                    _id: ordrs
                }
            )
            console.log(orderDetails)
            // let orderType = orderDetails.itemFrom
            let orderedSize = orderDetails.orderedQuantity[0].size
            let orderedQuantity = orderDetails.orderedQuantity[0].quantity
            let itemDetails = await InventoryItem.findById(
                { _id: orderDetails.itemMasterId }
            )
            let indexOfSize = itemDetails.itemSizes.findIndex(obj => obj.size === orderedSize)
            let updateInventoryItem = await InventoryItem.findOneAndUpdate(
                { _id: orderDetails.itemMasterId },
                { $inc: { [`itemSizes.${indexOfSize}.itemQuantity.quantity`]: orderedQuantity, 'quantityInHand.quantityInHand': orderedQuantity } },
                { new: true }
            )
            let deleteOrder = await InventoryStaffOrder.findByIdAndDelete(
                {
                    _id: ordrs
                }
            )
            return {
                success: true,
                message: `Order Deleted Successfully!`,
                code: 200,
                data: {}
            }
        }
    }
}


export default {
    getCategories,
    getSubCategories,
    getSearchedList,
    searchSuggestions,
    getSearchedItems,
    getItemDetails,
    notifyItemStock,
    addOrRemoveWishlist,
    getWishlist,
    createOrder,
    getMyOrders,
    getAdminOrders,
    getOrderDetails,
    getKitsAssigned,
    updatePaymentStatusOrder,
    cancelOrder,
    addToCart,
    removeFromCart,
    getCartList,
    updateCart,
    getReasonForExchange,
    createExchange,
    filterSubCategory,
    filteredListItems,
    filterOrder,
    deleteOrderOnOrderCancel,
    // receiptPdfOfItemForStudentService,
    // receiptPdfOfItemForStaffService
};