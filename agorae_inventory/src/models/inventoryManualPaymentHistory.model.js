import { Schema, model } from 'mongoose';
import mongoose from 'mongoose'
const _schema = new Schema(
    {
        instituteId: {
            type: Number,
            index: true,
            select: false
        },
        manualPaymentId: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
            required : true,
            ref : 'inventoryManualPayment'
        },
        cancellationStatus : {
            type: String,
            required : false
        },
        cancellationReason : {
            type: String,
            required : false
        },
        isCancelled : {
            type: Boolean,
            required : true
        },
        paymentMode : {
            type: String,
            required : false,
            default : "Offline"
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

export default model('inventoryManualPaymentHistory', _schema);
