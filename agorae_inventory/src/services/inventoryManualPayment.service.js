/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
/* eslint-disable quotes */
import InventoryChequeStatus from "../models/inventoryChequeStatus.model.js";
import inventoryManualPayment from "../models/inventoryManualPayment.model.js";
import inventoryManualPaymentHistory from "../models/inventoryManualPaymentHistory.model.js";
import InventoryPaymentMode from "../models/inventoryPaymentMode.model.js";
import InventoryReceiptSetting from "../models/inventoryReceiptSetting.model.js";
import inventoryStaffOrderMasterModel from "../models/inventoryStaffOrderMaster.model.js";
import inventoryStudentOrderMaster from "../models/inventoryStudentOrderMaster.model.js";

const getPaymentMode = async (req, res) => {
    let paymentModeList = await InventoryPaymentMode.find({
        instituteId: null
    })
    return {
        success: true,
        message: 'Payment Modes fetched',
        code: 200,
        data: paymentModeList
    };
};

const getChecqueStatus = async (req, res) => {
    let paymentModeList = await InventoryChequeStatus.find({
        instituteId: null
    })
    return {
        success: true,
        message: 'Cheque Status fetched',
        code: 200,
        data: paymentModeList
    };
};

const createManualPayment = async (userId, uerType, orderId, price, amountToPay, instituteId) => {
    // const instituteId = req.authData.data.instituteId;
    // const body = req.body;
    let createManualPaymentObject = {
        instituteId: instituteId,
        orderId: orderId,
        price: price,
        amountToPay: amountToPay,
    }
    if (uerType == 'STAFF') {
        createManualPaymentObject.staffId = userId
        createManualPaymentObject.orderedUserType = "STAFF"
    } else {
        createManualPaymentObject.studentId = userId
        createManualPaymentObject.orderedUserType = "STUDENT"
    }
    let paymentModeList = await inventoryManualPayment.create({
        ...createManualPaymentObject
    })
    return true
    // return {
    //     success: true,
    //     message: 'Manual Payment Entry Created',
    //     code: 200,
    //     data: createManualPaymentObject
    // };
};

const generateTransactionId = async (instituteId, manualPaymentId, userId, userType) => {
    let getReceiptSettings = await InventoryReceiptSetting.findOne(
        {
            instituteId: instituteId
        }
    )
    let instituteCode = getReceiptSettings.instituteCode
    let year = getReceiptSettings.year
    let randomSix = Math.floor(100000 + Math.random() * 900000)
    let newTransactionId = instituteCode + year + randomSix
    //check if same random six and transactionId exsists or not
    if (userType == 'STUDENT') {
        let getManualPaymentDetails = await inventoryManualPayment.countDocuments(
            {
                _id: manualPaymentId,
                instituteId: instituteId,
                studentId: userId,
                transactionId: newTransactionId
            }
        )
        if (getManualPaymentDetails > 0) {
            generateTransactionId(instituteId, manualPaymentId, userId, userType)
        } else {
            return newTransactionId
        }
    } else {
        let getManualPaymentDetails = await inventoryManualPayment.countDocuments(
            {
                _id: manualPaymentId,
                instituteId: instituteId,
                staffId: userId,
                transactionId: newTransactionId
            }
        )
        if (getManualPaymentDetails > 0) {
            generateTransactionId(instituteId, manualPaymentId, userId, userType)
        } else {
            return newTransactionId
        }
    }

};

const getManualPayment = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    const body = req.body;
    let getManualPaymentObj = {
        instituteId: instituteId
    }
    if (body.staffId) {
        getManualPaymentObj.staffId = body.staffId
        getManualPaymentObj.orderedUserType = "STAFF"

        let getManualPaymentRecordDetails = await inventoryManualPayment.aggregate([
            {
                $match: {
                    ...getManualPaymentObj
                }
            },
            {
                $lookup: {
                    from: 'inventorystaffordermasters',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'orderDetails',
                }
            },
            {
                $unwind: '$orderDetails'
            },
            {
                $lookup: {
                    from: 'inventoryitemmasters',
                    localField: 'orderDetails.itemMasterId',
                    foreignField: '_id',
                    as: 'itemDetails',
                }
            },
            {
                $unwind: '$itemDetails'
            },
            {
                $lookup: {
                    from: 'inventorytaxratemasters',
                    localField: 'itemDetails.taxRate',
                    foreignField: '_id',
                    as: 'taxDetails',
                }
            },
            {
                $lookup: {
                    from: 'inventorychequestatuses',
                    localField: 'chequeSubmitStatus',
                    foreignField: '_id',
                    as: 'chequeSubmitDetails',
                }
            },
            {
                $lookup: {
                    from: 'inventorypaymentmodes',
                    localField: 'paymentMode',
                    foreignField: '_id',
                    as: 'paymentDetails',
                }
            },
            {
                $addFields: {
                    taxDetails: { $arrayElemAt: ["$taxDetails", 0] },
                    chequeSubmitDetails: { $arrayElemAt: ["$chequeSubmitDetails", 0] },
                    paymentDetails: { $arrayElemAt: ["$paymentDetails", 0] },
                }
            }
        ])
        return {
            success: true,
            message: 'Manual Payment Records Fetched',
            code: 200,
            data: getManualPaymentRecordDetails
        };
    } else {
        getManualPaymentObj.studentId = body.studentId
        getManualPaymentObj.orderedUserType = "STUDENT"

        // let getManualPaymentRecordDetails = await inventoryManualPayment.aggregate([
        //     {
        //         $match: {
        //             ...getManualPaymentObj
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'inventorystudentordermasters',
        //             localField: 'orderId',
        //             foreignField: '_id',
        //             as: 'orderDetails',
        //         }
        //     },
        //     {
        //         $unwind: '$orderDetails'
        //     },
        //     {
        //         $match : {
        //             'orderDetails.isItemRejected' : false
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'inventoryitemmasters',
        //             localField: 'orderDetails.itemMasterId',
        //             foreignField: '_id',
        //             as: 'itemDetails',
        //         }
        //     },
        //     {
        //         $unwind: '$itemDetails'
        //     },
        //     {
        //         $lookup: {
        //             from: 'inventorytaxratemasters',
        //             localField: 'itemDetails.taxRate',
        //             foreignField: '_id',
        //             as: 'taxDetails',
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'inventorychequestatuses',
        //             localField: 'chequeSubmitStatus',
        //             foreignField: '_id',
        //             as: 'chequeSubmitDetails',
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'inventorypaymentmodes',
        //             localField: 'paymentMode',
        //             foreignField: '_id',
        //             as: 'paymentDetails',
        //         }
        //     },
        //     {
        //         $addFields: {
        //             taxDetails: { $arrayElemAt: ["$taxDetails", 0] },
        //             chequeSubmitDetails: { $arrayElemAt: ["$chequeSubmitDetails", 0] },
        //             paymentDetails: { $arrayElemAt: ["$paymentDetails", 0] },
        //         }
        //     }
        // ])
        let getManualPaymentRecordDetails = await inventoryManualPayment.aggregate([
            {
                $match: {
                    ...getManualPaymentObj
                }
            },
            {
                $lookup: {
                    from: 'inventorystudentordermasters',
                    localField: 'orderId',
                    foreignField: '_id',
                    as: 'orderDetails',
                }
            },
            {
                $unwind: '$orderDetails'
            },
            {
                $match: {
                    'orderDetails.isItemRejected': false
                }
            },
            {
                $lookup: {
                    from: 'inventoryitemkitmasters',
                    localField: 'orderDetails.itemKitMasterId',
                    foreignField: '_id',
                    as: 'kititemDetails',
                }
            },
            {
                $lookup: {
                    from: 'inventoryitemmasters',
                    localField: 'orderDetails.itemMasterId',
                    foreignField: '_id',
                    as: 'itemDetails',
                }
            },
            {
                $lookup: {
                    from: 'inventorytaxratemasters',
                    localField: 'itemDetails.taxRate',
                    foreignField: '_id',
                    as: 'taxDetails',
                }
            },
            {
                $lookup: {
                    from: 'inventorychequestatuses',
                    localField: 'chequeSubmitStatus',
                    foreignField: '_id',
                    as: 'chequeSubmitDetails',
                }
            },
            {
                $lookup: {
                    from: 'inventorypaymentmodes',
                    localField: 'paymentMode',
                    foreignField: '_id',
                    as: 'paymentDetails',
                }
            },
            {
                $addFields: {
                    taxDetails: { $arrayElemAt: ["$taxDetails", 0] },
                    chequeSubmitDetails: { $arrayElemAt: ["$chequeSubmitDetails", 0] },
                    paymentDetails: { $arrayElemAt: ["$paymentDetails", 0] },
                    kititemDetails: { $arrayElemAt: ["$kititemDetails", 0] },
                    itemDetails: { $arrayElemAt: ["$itemDetails", 0] },
                }
            }
        ])
        return {
            success: true,
            message: 'Manual Payment Records Fetched',
            code: 200,
            data: getManualPaymentRecordDetails
        };
    }
    // let getManualPaymentRecordDetails = await inventoryManualPayment.find({
    //     ...getManualPaymentObj
    // })

};

const updateManualPayment = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    const body = req.body;
    let chequeBouncedId = await InventoryChequeStatus.findOne({
        chequeStatusName: "Cheque Bounced"
    })
    let chequeNotSubmittedId = await InventoryChequeStatus.findOne({
        chequeStatusName: "Cheque Received but not submitted"
    })
    // let statusArr = [
    //     {
    //         status: "Admin-Issued",
    //         colorCode: "#C45806"
    //     },
    //     {
    //         status: "Offline Payment Received",
    //         colorCode: "#C45806"
    //     },
    //     {
    //         status: "Awaiting Pickup",
    //         colorCode: "#C45806"
    //     },
    // ]
    let chequeCancelledArr = [
        {
            status: "Admin-Issued",
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
    if (body.studentId) {
        for (let i = 0; i < body.recordList.length; i++) {

            let updateManualPaymentRecordObj = {
                ...body.recordList[i]
            }
            let orderDetails = await inventoryStudentOrderMaster.findOne(
                {
                    _id: body.recordList[i].orderId
                }
            )
            if (body.recordList[i].chequeSubmitStatus === chequeBouncedId._id.toString()) {
                let updateOrderId = await inventoryStudentOrderMaster.findByIdAndUpdate(
                    {
                        _id: body.recordList[i].orderId
                    },
                    {
                        $set: {
                            orderStatusWeb: chequeCancelledArr,
                            orderStatusApp: { status: "Payment Pending", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" },
                            isPaymentDone: false
                        }
                    },
                    { new: true }
                )
                let manualRecordDetails = await inventoryManualPayment.findOne({
                    _id: body.recordList[i].recordId,
                    instituteId: instituteId,
                    studentId: body.studentId
                })
                let updateManualPaymentDetails = await inventoryManualPayment.updateOne(
                    {
                        _id: body.recordList[i].recordId,
                        instituteId: instituteId,
                        studentId: body.studentId
                    },
                    {
                        ...updateManualPaymentRecordObj,
                        paymentStatus: "Not-Paid",
                        amountToPay: manualRecordDetails.price
                    }
                )
            } else if (body.recordList[i].chequeSubmitStatus === chequeNotSubmittedId._id.toString()) {
                let updateOrderId = await inventoryStudentOrderMaster.findByIdAndUpdate(
                    {
                        _id: body.recordList[i].orderId
                    },
                    {
                        $set: {
                            orderStatusWeb: chequeCancelledArr,
                            orderStatusApp: { status: "Payment Pending", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" },
                            isPaymentDone: false
                        }
                    },
                    { new: true }
                )
                let manualRecordDetails = await inventoryManualPayment.findOne({
                    _id: body.recordList[i].recordId,
                    instituteId: instituteId,
                    studentId: body.studentId
                })
                let updateManualPaymentDetails = await inventoryManualPayment.updateOne(
                    {
                        _id: body.recordList[i].recordId,
                        instituteId: instituteId,
                        studentId: body.studentId
                    },
                    {
                        ...updateManualPaymentRecordObj,
                        paymentStatus: "Not-Paid",
                        amountToPay: manualRecordDetails.price
                    }
                )
            } else {
                let statusArr = [
                    {
                        status: orderDetails.orderStatusWeb[0].status,
                        colorCode: "#C45806"
                    },
                    {
                        status: "Offline Payment Received",
                        colorCode: "#C45806"
                    },
                    {
                        status: "Awaiting Pickup",
                        colorCode: "#C45806"
                    },
                ]
                let transactionId = await generateTransactionId(instituteId, body.recordList[i].recordId, body.studentId, 'STUDENT')
                let updateOrderId = await inventoryStudentOrderMaster.findByIdAndUpdate(
                    {
                        _id: body.recordList[i].orderId
                    },
                    {
                        $set: {
                            orderStatusWeb: statusArr,
                            orderStatusApp: { status: "Payment Completed", colorCode: "#024700", backgroundColorCode: "#E8FFED" },
                            isPaymentDone: true,
                            transactionId: transactionId
                        }
                    },
                    { new: true }
                )
                let updateManualPaymentDetails = await inventoryManualPayment.updateOne(
                    {
                        _id: body.recordList[i].recordId,
                        instituteId: instituteId,
                        studentId: body.studentId
                    },
                    {
                        ...updateManualPaymentRecordObj,
                        paymentStatus: "Paid",
                        transactionId: transactionId,
                        amountToPay: 0
                    }
                )
            }
            let createManualPaymentHistory = await inventoryManualPaymentHistory.create(
                {
                    manualPaymentId: body.recordList[i].recordId,
                    isCancelled: false,
                    instituteId: instituteId
                }
            )
        }
        return {
            success: true,
            message: 'Manual Payment Records Updated',
            code: 200,
            data: {}
        };
    } else if (body.staffId) {
        for (let i = 0; i < body.recordList.length; i++) {
            let updateManualPaymentRecordObj = {
                ...body.recordList[i]
            }

            let orderDetailsStaff = await inventoryStaffOrderMasterModel.findOne(
                {
                    _id: body.recordList[i].orderId
                }
            )
            if (body.recordList[i].chequeSubmitStatus === chequeBouncedId._id.toString()) {
                if (orderDetailsStaff?.isPriceApplicable) {
                    let updateOrderId = await inventoryStaffOrderMasterModel.findByIdAndUpdate(
                        {
                            _id: body.recordList[i].orderId
                        },
                        {
                            $set: {
                                orderStatusWeb: chequeCancelledArr,
                                orderStatusApp: { status: "Payment Pending", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" },
                                isPaymentDone: false
                            }
                        },
                        { new: true }
                    )
                }
                console.log(orderDetailsStaff)
                let manualRecordDetails = await inventoryManualPayment.findOne({
                    _id: body.recordList[i].recordId,
                    instituteId: instituteId,
                    staffId: body.staffId
                })
                let updateManualPaymentDetails = await inventoryManualPayment.updateOne(
                    {
                        _id: body.recordList[i].recordId,
                        instituteId: instituteId,
                        staffId: body.staffId
                    },
                    {
                        ...updateManualPaymentRecordObj,
                        paymentStatus: "Not-Paid",
                        amountToPay: manualRecordDetails.price
                    }
                )
            } else if (body.recordList[i].chequeSubmitStatus === chequeNotSubmittedId._id.toString()) {
                let updateOrderId = await inventoryStaffOrderMasterModel.findByIdAndUpdate(
                    {
                        _id: body.recordList[i].orderId
                    },
                    {
                        $set: {
                            orderStatusWeb: chequeCancelledArr,
                            orderStatusApp: { status: "Payment Pending", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" },
                            isPaymentDone: false
                        }
                    },
                    { new: true }
                )
                let manualRecordDetails = await inventoryManualPayment.findOne({
                    _id: body.recordList[i].recordId,
                    instituteId: instituteId,
                    studentId: body.studentId
                })
                let updateManualPaymentDetails = await inventoryManualPayment.updateOne(
                    {
                        _id: body.recordList[i].recordId,
                        instituteId: instituteId,
                        studentId: body.studentId
                    },
                    {
                        ...updateManualPaymentRecordObj,
                        paymentStatus: "Not-Paid",
                        amountToPay: manualRecordDetails.price
                    }
                )
            } else {
                console.log("hihihi")
                let statusArr = [
                    {
                        status: orderDetailsStaff.orderStatusWeb[0].status,
                        colorCode: "#C45806"
                    },
                    {
                        status: "Offline Payment Received",
                        colorCode: "#C45806"
                    },
                    {
                        status: "Awaiting Pickup",
                        colorCode: "#C45806"
                    },
                ]

                let transactionId = await generateTransactionId(instituteId, body.recordList[i].recordId, body.staffId, 'STAFF')
                console.log(orderDetailsStaff)
                if (orderDetailsStaff?.isPriceApplicable) {
                    let updateOrderId = await inventoryStaffOrderMasterModel.findByIdAndUpdate(
                        {
                            _id: body.recordList[i].orderId
                        },
                        {
                            $set: {
                                orderStatusWeb: statusArr,
                                orderStatusApp: { status: "Payment Completed", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" },
                                isPaymentDone: true,
                                transactionId: transactionId
                            }
                        },
                        { new: true }
                    )
                    console.log(updateOrderId)
                }
                let updateManualPaymentDetails = await inventoryManualPayment.updateOne(
                    {
                        _id: body.recordList[i].recordId,
                        instituteId: instituteId,
                        staffId: body.staffId
                    },
                    {
                        ...updateManualPaymentRecordObj,
                        paymentStatus: "Paid",
                        amountToPay: 0,
                        transactionId: transactionId
                    }
                )
            }
            let createManualPaymentHistory = await inventoryManualPaymentHistory.create(
                {
                    manualPaymentId: body.recordList[i].recordId,
                    isCancelled: false,
                    instituteId: instituteId
                }
            )
        }
        return {
            success: true,
            message: 'Manual Payment Records Updated',
            code: 200,
            data: {}
        };
    }
};

const cancelManualPayment = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    const body = req.body;
    const updateManualPaymentHistory = await inventoryManualPaymentHistory.updateOne(
        {
            _id: body.recordHistoryId,
            instituteId: instituteId
        },
        {
            cancellationReason: body.cancellationReason,
            isCancelled: true
        }
    )

    let manualPaymentRecordFind = await inventoryManualPayment.findById(
        {
            _id: body.manualPaymentId
        }
    )

    if (manualPaymentRecordFind.orderedUserType == 'STUDENT') {
        let getOrderDetails = await inventoryStudentOrderMaster.findOne(
            {
                _id: manualPaymentRecordFind.orderId
            }
        )
        let statusArr = [
            {
                status: getOrderDetails.orderBy == 'ASSIGN_BY_ADMIN' ? "Admin-Issued" : "Student Order",
                colorCode: "#C45806"
            },
            {
                status: getOrderDetails.paymentMode == 'COD' ? "Offline Payment Pending" : "Online Payment Pending",
                colorCode: "#C45806"
            },
            {
                status: getOrderDetails.orderStatusWeb[2].status,
                colorCode: "#C45806"
            },
        ]
        let updateOrder = await inventoryStudentOrderMaster.findByIdAndUpdate(
            {
                _id: manualPaymentRecordFind.orderId
            },
            {
                $set: {
                    orderStatusWeb: statusArr,
                    orderStatusApp: { status: "Payment Pending", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" },
                    isPaymentDone: true
                }
            },
            { new: true }
        )
    } else {
        let getOrderDetails = await inventoryStaffOrderMasterModel.findOne(
            {
                _id: manualPaymentRecordFind.orderId
            }
        )
        let statusArrOffline = [
            {
                status: getOrderDetails.orderBy == 'ASSIGN_BY_ADMIN' ? "Admin-Issued" : "Staff Order",
                colorCode: "#C45806"
            },
            {
                status: getOrderDetails.priceApplicableToStaff ? "Offline Payment Pending" : "Offline Payment Received",
                colorCode: "#C45806"
            },
            {
                status: getOrderDetails.orderStatusWeb[2].status,
                colorCode: "#C45806"
            },
        ]
        let statusArrOnline = [
            {
                status: getOrderDetails.orderBy == 'ASSIGN_BY_ADMIN' ? "Admin-Issued" : "Staff Order",
                colorCode: "#C45806"
            },
            {
                status: getOrderDetails.priceApplicableToStaff ? "Online Payment Pending" : "Online Payment Received",
                colorCode: "#C45806"
            },
            {
                status: getOrderDetails.orderStatusWeb[2].status,
                colorCode: "#C45806"
            },
        ]
        let updateOrder = await inventoryStaffOrderMasterModel.findByIdAndUpdate(
            {
                _id: manualPaymentRecordFind.orderId
            },
            {
                $set: {
                    orderStatusWeb: getOrderDetails.paymentMode == 'COD' ? statusArrOffline : statusArrOnline,
                    orderStatusApp: { status: "Payment Pending", colorCode: "#6C131C", backgroundColorCode: "#FEE7E7" },
                    isPaymentDone: true
                }
            },
            { new: true }
        )
    }

    let updateManualPayment = await inventoryManualPayment.findOneAndUpdate(
        {
            _id: body.manualPaymentId,
        },
        {
            $set: { amountToPay: manualPaymentRecordFind.price, paymentStatus: 'Not-Paid' }
        },
        { new: true, useFindAndModify: false }
    )
    if (updateManualPaymentHistory.modifiedCount > 0) {
        return {
            success: true,
            message: 'Manual Payment Cancelled',
            code: 200,
            data: {}
        };
    } else {
        return {
            success: false,
            message: 'Manual Payment Cancellation Failed',
            code: 400,
            data: {}
        };
    }
};

const getManualPaymentHistoryList = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    const body = req.body;
    if (body.staffId) {
        let getManualPaymentHistoryStaff = await inventoryManualPaymentHistory.find(
            {
                instituteId: instituteId
            }
        ).populate({
            path: 'manualPaymentId',
            model: 'inventoryManualPayment',
            match: { staffId: body.staffId },
            populate: {
                path: 'orderId',
                model: 'inventoryStaffOrderMaster',
                populate: {
                    path: 'itemMasterId',
                    model: 'inventoryItemMaster'
                }
            }
        })

        const filteredData = getManualPaymentHistoryStaff.filter(item => item.manualPaymentId !== null);

        return {
            success: true,
            message: 'Manual Payment history Fetched for Staff',
            code: 200,
            data: filteredData
        };
    } else {
        let getManualPaymentHistoryStudent = await inventoryManualPaymentHistory.find(
            {
                instituteId: instituteId
            }
        ).populate({
            path: 'manualPaymentId',
            model: 'inventoryManualPayment',
            match: { studentId: body.studentId },
            populate: {
                path: 'orderId',
                model: 'inventoryStudentOrderMaster',
                populate: {
                    path: 'itemMasterId',
                    model: 'inventoryItemMaster'
                },
                populate: {
                    path: 'itemKitMasterId',
                    model: 'inventoryItemKitMaster'
                }
            }
        })

        return {
            success: true,
            message: 'Manual Payment history Fetched for Student',
            code: 200,
            data: getManualPaymentHistoryStudent
        };
    }
};

export default {
    getPaymentMode,
    getChecqueStatus,
    createManualPayment,
    getManualPayment,
    updateManualPayment,
    cancelManualPayment,
    getManualPaymentHistoryList,
};