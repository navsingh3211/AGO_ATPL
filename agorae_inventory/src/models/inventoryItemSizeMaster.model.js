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
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'inventorySubCategoryMaster',
      required: true
    },
    itemSize: {
      type: [String], // Array of strings for itemSize
      required: true
    },
    isAlreadyUsed: {
      type: Boolean,
      default: false,
      index: true
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

export default model('inventoryItemSizeMaster', _schema);
