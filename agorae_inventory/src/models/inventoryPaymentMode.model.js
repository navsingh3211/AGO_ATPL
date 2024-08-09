import { Schema, model } from 'mongoose';

const _schema = new Schema(
    {
        instituteId: {
            type: Number,
            index: true,
            select: false,
            required : false
        },
        paymentModeName: {
            type: String,
            required : true,
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

export default model('inventoryPaymentMode', _schema);
