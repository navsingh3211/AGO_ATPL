import { Schema, model } from 'mongoose';

const assignedItem = new Schema({
  size: {
    type: String
  },
  quantity: {
    type: Number
  },
  sellingPrice: {
    type: Number
  },
  useStatus: {
    type: String,
    enum: ['IN_USE', 'RELEASED_ON'],
    required: false,
    default: 'IN_USE'
  }
});

const _schema = new Schema(
  {
    instituteId: {
      type: Number,
      index: true,
      select: false
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'communityMaster',
      required: true
    },
    itemMasterId: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryItemMaster',
      default: null
    },
    assignedItem: [assignedItem],
    assignedDate: {
      type: Date,
      default: Date.now
    },
    expectedReleaseDate: {
      type: Date,
      default: ''
    },
    releasedDate: {
      type: Date,
      default: ''
    },
    description: {
      type: String,
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
export default model('assignItemToCommunity', _schema);
