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
  }
});

const _schema = new Schema(
  {
    instituteId: {
      type: Number,
      index: true,
      select: false
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: 'locationMaster',
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
export default model('assignItemToLocation', _schema);
