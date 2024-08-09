/* eslint-disable prettier/prettier */
import { Schema, model } from 'mongoose';

const _schema = new Schema(
    {
        type: {
            type: String
        },
        etag: {
            type: String
        },
        fileName: {
            type: String
        },
        filePath: {
            type: String
        },
        fullPath: {
            type: String
        },
        originalFileName: {
            type: String
        },
        fileExtension: {
            type: String
        },
        size: {
            type: Number
        },
        mimeType: {
            type: String
        },
        status: {
            type: Boolean,
            default: true,
            index: true
        },
    },
    {
        timestamps: true
    }
);

export default model('inventoryDocumentMaster', _schema);
