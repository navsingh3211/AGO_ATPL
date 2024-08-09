import { Schema, model } from 'mongoose';
import mongoose from 'mongoose'

const _schema = new Schema(
  {
    instituteId: {
      type: Number,
      index: true,
      select: false
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      ref :'inventoryItemMaster'
    },
    kitItemId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
      ref :'inventoryItemKitMaster'
    },
    itemName: {
      type: String,
      required : false
    },
    price: {
      type: Number,
      required : false
    },
    totalPrice: {
      type: Number,
      required : false
    },
    studentId: {
      type: Number,
      required : false
    },
    staffId: {
      type: Number,
      required : false
    },
    size: {
      type: String,
      required : false
    },
    quantity: {
      type: Number,
      required : false
    },
    pickupPeriod : {
      type : Number,
      required : false
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

export default model('InventoryCart', _schema);
