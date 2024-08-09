import { Schema, model } from 'mongoose';

const _schema = new Schema(
  {
    instituteId: {
      type: Number,
      index: true,
      select: false
    },
    unitName: {
      type: String
    },
    isStatic: {
      type: Boolean,
      default: false,
      index: true
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

export default model('inventoryUnitMaster', _schema);
