import { Schema, model } from 'mongoose';

const _schema = new Schema(
  {
    instituteId: {
      type: Number,
      index: true,
      select: false
    },
    communityName: {
      type: String,
      index: true,
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

export default model('communityMaster', _schema);
