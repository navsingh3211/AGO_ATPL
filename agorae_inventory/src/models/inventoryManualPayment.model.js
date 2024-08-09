import { Schema, model } from 'mongoose';
import mongoose from 'mongoose'
const _schema = new Schema(
    {
        instituteId: {
            type: Number,
            index: true,
            select: false
        },
        studentId: {
            type: Number,
            index: true,
        },
        staffId: {
            type: Number,
            index: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
        },
        price: {
            type: Number,
            required : false
        },
        paymentStatus: {
            type: String,
            required : false,
            default : "Not-Paid"
        },
        transactionId: {
            type: String,
            required : false,
        },
        orderedUserType: {
            type: String,
            required : false,
        },
        amountToPay: {
            type: Number,
            required : false,
        },
        paymentMode : {
            type: mongoose.Schema.Types.ObjectId,
            required : false,
            ref : 'inventoryPaymentMode'
        },
        dateOfPayment : {
            type: Date,
            required : false,
        },
        referenceNumber : {
            type: String,
            required : false,
        },
        chequeSubmitStatus: {
            type: mongoose.Schema.Types.ObjectId,
            required : false,
            ref : 'inventoryChequeStatus'
        },
        status: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true
    }
);
// _schema.index({ id: 1, status: 1 });

export default model('inventoryManualPayment', _schema);
