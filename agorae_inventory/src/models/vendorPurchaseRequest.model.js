import { Schema, model } from 'mongoose';

const imageSchema = new Schema({
  documentID: {
    type: Schema.Types.ObjectId,
    ref: 'inventoryDocumentMaster',
    required: true
  },
  isPrimary: {
    type: Boolean,
    required: true
  }
});

const ItemQuantitySchema = new Schema({
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

const weightDataSchema = new Schema({
  weight: {
    type: Number
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'inventoryUnitMaster'
  }
});

const quantityInHandSchema = new Schema({
  quantityInHand: {
    type: Number
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'inventoryUnitMaster'
  }
});

const reorderPointSchema = new Schema({
  reorderPoint: {
    type: Number
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'inventoryUnitMaster'
  }
});

const itemSizeSchema = new Schema({
  size: {
    type: String
  },
  itemQuantity: {
    type: ItemQuantitySchema,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  costPrice: {
    type: Number,
    required: true
  },
  sellingPrice: {
    type: Number
  },
  totalSellingPrice: {
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
    itemImages: {
      type: [imageSchema],
      default: null
    },
    itemRequirementId: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryItemRequirement',
      required: true
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
    fixedVendorId: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryVendorMaster',
      required: false,
      default: null
    },
    itemId: {
      type: String,
      default: null
    },
    itemName: {
      type: String,
      required: true
    },
    taxRate: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryTaxRateMaster',
      required: false,
      default: null
    },
    itemSizes: {
      type: [itemSizeSchema]
    },
    proposedQty: {
      quantity: {
        type: Number,
        required: true,
        default: 0
      },
      unit: {
        type: Schema.Types.ObjectId,
        ref: 'inventoryUnitMaster'
      }
    },
    receivedQty: {
      quantity: {
        type: Number,
        default: 0
      },
      unit: {
        type: Schema.Types.ObjectId,
        ref: 'inventoryUnitMaster',
        default: null
      }
    },
    weightData: {
      type: weightDataSchema,
      required: false,
      default: null
    },
    materialType: {
      type: String,
      default: null
    },
    otherDetails: {
      type: String,
      default: null
    },
    enableTracking: {
      type: Boolean,
      default: false,
      index: true
    },
    quantityInHand: {
      type: quantityInHandSchema,
      default: null
    },
    reorderPointData: {
      type: reorderPointSchema,
      default: null
    },
    uploadedDocumentID: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryDocumentMaster',
      required: false,
      default: null
    },
    preferredVendor: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryVendorMaster',
      required: false,
      default: null
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    vendorPurchaseStatus: {
      type: String,
      enum: ['PENDING', 'RECEIVED'],
      default: 'PENDING'
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

export default model('vendorPurchaseRequest', _schema);
