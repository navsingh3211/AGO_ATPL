import { Schema, model } from 'mongoose';

const _schema = new Schema(
  {
    instituteId: {
      type: Number,
      index: true,
      select: false
    },
    storeName: {
      type: String
    },
    storeDesc: {
      type: String
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

export default model('inventoryStoreMaster', _schema);
