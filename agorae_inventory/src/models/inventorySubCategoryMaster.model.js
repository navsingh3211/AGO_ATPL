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
    subCategoryName: {
      type: String,
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
    },
    editedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);
// _schema.index({ id: 1, status: 1 });
export default model('inventorySubCategoryMaster', _schema);
