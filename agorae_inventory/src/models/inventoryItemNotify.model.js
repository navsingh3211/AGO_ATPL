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
            required: false
        },
        staffId: {
            type: Number,
            required: false
        },
        size: {
            type: String,
            required: false
        },
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'inventoryItemMaster',
            required: false
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

export default model('inventoryItemNotify', _schema);
