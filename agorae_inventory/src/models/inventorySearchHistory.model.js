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
            required : false
        },
        staffId : {
            type: Number,
            required : false
        },
        searchText : {
            type: String,
            required : false
        },
        subCategoryId : {
            type: mongoose.Schema.Types.ObjectId,
            required : false
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

export default model('inventorySearchHistory', _schema);
