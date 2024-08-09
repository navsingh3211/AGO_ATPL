/* eslint-disable prettier/prettier */
import { Schema, model } from 'mongoose';

const _schema = new Schema(
    {
        gstType: {
            type: String,
            required: true
        },
        percentage: {
            type: Number,
            required: true
        },
        percentageDecimal: {
            type: Number,
            required: true
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

export default model('inventoryTaxRateMaster', _schema);
