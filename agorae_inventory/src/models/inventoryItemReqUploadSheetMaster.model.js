import { Schema, model } from 'mongoose';

const _schema = new Schema(
  {
    instituteId: {
      type: Number,
      index: true,
      select: false
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'InventoryCategoryMaster',
      required: true
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryDocumentMaster',
      default: null
    },
    noOfItems: {
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

export default model('inventoryItemReqUploadSheetMaster', _schema);
