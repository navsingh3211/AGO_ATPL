import { Schema, model } from 'mongoose';

const imageSchema = new Schema({
  documentID: {
    type: Schema.Types.ObjectId,
    ref: 'inventoryDocumentMaster',
    required: true
  }
});

const _schema = new Schema(
  {
    instituteId: {
      type: Number,
      index: true,
      select: false
    },
    lastEditedBy: {
      type: Number
    },
    instituteCode: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    transactionNumber: {
      type: String,
      required: true
    },
    logo: {
      type: [imageSchema]
    },
    billingName: {
      type: String,
      required: true
    },
    stateId: {
      type: Number,
      required: true
    },
    cityId: {
      type: Number,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    mobileNo: {
      type: String
    },
    email: {
      type: String
    },
    gstNumber: {
      type: String
    },
    note: {
      type: String
    },
    signatureName: {
      type: String
    },
    designation: {
      type: String
    },
    signatureImages: {
      type: [imageSchema]
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
export default model('inventoryReceiptSetting', _schema);
