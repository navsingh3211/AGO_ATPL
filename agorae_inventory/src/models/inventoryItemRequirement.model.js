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
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'inventorySubCategoryMaster',
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    itemSize: {
      type: String
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryUnitMaster',
      required: true
    },
    pricePerUnit: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryVendorMaster',
      required: false,
      default: null
    },
    description: {
      type: String,
      required: false,
      default: null
    },
    approvalStatus: {
      type: String,
      // enum: [
      //   'PENDING APPROVAL',
      //   'APPROVED PENDING TRANSFER',
      //   'APPROVAL REJECTED',
      //   'APPROVED TRANSFER DONE'
      // ],
      enum: [
        'PENDING APPROVAL',
        'APPROVED L1 PENDING L2',
        'APPROVED L2 PENDING TRANSFER',
        'APPROVED PENDING TRANSFER',
        'APPROVAL REJECTED',
        'APPROVED TRANSFER DONE'
      ],
      default: 'PENDING APPROVAL'
    },
    approvedBY: {
      type: String,
      default: ''
    },
    approvalActionDate: {
      type: Date,
      default: Date.now
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

export default model('inventoryItemRequirement', _schema);
