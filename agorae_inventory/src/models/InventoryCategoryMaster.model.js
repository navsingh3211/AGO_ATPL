import { Schema, model } from 'mongoose';

const _schema = new Schema(
  {
    instituteId: {
      type: Number,
      index: true,
      select: false
    },
    categoryName: {
      type: String,
      index: true
    },
    isAlreadyUsed: {
      type: Boolean,
      default: false,
      index: true
    },
    isStatic: {
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

export default model('InventoryCategoryMaster', _schema);
