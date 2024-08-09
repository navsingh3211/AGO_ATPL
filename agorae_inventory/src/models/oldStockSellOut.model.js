import { Schema, model } from 'mongoose';

const avaliableQuantitySchema = new Schema({
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'inventoryUnitMaster',
    required: true
  }
});

const quantityToBeSchema = new Schema({
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'inventoryUnitMaster',
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
    itemMasterId: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryItemMaster',
      default: null
    },
    size: {
      type: String,
      required: true
    },
    avaliableQuantity: {
      type: avaliableQuantitySchema,
      required: false
    },
    quantityToBeSold: {
      type: quantityToBeSchema,
      required: false
    },
    purchasePricePerUnit: {
      type: Number,
      required: false
    },
    totalPurchasePrice: {
      type: Number,
      required: false
    },
    sellingPricePerUnit: {
      type: Number,
      required: false
    },
    totalSellingPrice: {
      type: Number,
      required: false
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryVendorMaster',
      required: true
    },
    uploadedDocumentID: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryDocumentMaster',
      required: false
    },
    note: {
      type: String,
      required: false
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

export default model('oldStockSellOut', _schema);
