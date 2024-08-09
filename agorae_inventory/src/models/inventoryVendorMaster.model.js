import { Schema, model } from 'mongoose';

const _schema = new Schema(
  {
    instituteId: {
      type: Number,
      index: true,
      select: false
    },
    vendorName: {
      type: String,
      required: true,
      index: true
    },
    contactPersonName: {
      type: String,
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: Number,
      required: true
    },
    address: {
      type: String
    },
    gstNo: {
      type: String
    },
    panNo: {
      type: String
    },
    licenseNo: {
      type: String
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
// _schema.index({ id: 1, status: 1 });

export default model('inventoryVendorMaster', _schema);
