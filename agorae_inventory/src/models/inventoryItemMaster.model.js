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
    type: String,
    required: true
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
    type: Number,
    required: true
  },
  totalSellingPrice: {
    type: Number
  }
});

const objectIdSetter = (value) => (value === '' ? null : value);

const _schema = new Schema(
  {
    instituteId: {
      type: Number,
      index: true,
      select: false
    },
    itemImages: {
      type: [imageSchema]
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
      type: String
    },
    itemType: {
      type: String,
      enum: ['NORMAL_STOCK', 'DONATION_STOCK'],
      default: 'NORMAL_STOCK'
    },
    donationStockDetails: {
      donorName: {
        type: String
      },
      donationNote: {
        type: String
      }
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryStoreMaster',
      default: null
    },
    itemName: {
      type: String,
      required: true
    },
    itemAvailableTo: {
      type: String,
      enum: ['all', 'student', 'staff'],
      required: true,
      default: 'all'
    },
    priceApplicableToStaff: {
      type: Boolean,
      required: true,
      default: false,
      index: true
    },
    exchangeableItemFor: {
      type: String,
      enum: ['all', 'student', 'staff', 'none', 'notForStudent', 'notForStaff'],
      required: true,
      default: 'all'
    },
    exchangePeriodForStudent: {
      type: Number,
      required: function () {
        if (this.exchangeableItemFor === 'student') {
          return true;
        } else if (this.exchangeableItemFor === 'staff') {
          return false;
        } else if (this.exchangeableItemFor === 'all') {
          return true;
        } else {
          return false;
        }
      }
    },
    exchangePeriodForStaff: {
      type: Number,
      required: function () {
        if (this.exchangeableItemFor === 'student') {
          return false;
        } else if (this.exchangeableItemFor === 'staff') {
          return true;
        } else if (this.exchangeableItemFor === 'all') {
          return true;
        } else {
          return false;
        }
      }
    },
    pickupPeriodForStudent: {
      type: Number,
      required: false
    },
    pickupPeriodForStaff: {
      type: Number,
      required: false
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
    weightData: {
      type: weightDataSchema,
      required: false
    },
    materialType: {
      type: String
    },
    otherDetails: {
      type: String
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
    preferredVendor: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryVendorMaster',
      required: false,
      default: null,
      set: objectIdSetter
    },
    dateOfPurchase: {
      type: Date,
      default: Date.now
    },
    itemTransferStatus: {
      type: String,
      enum: ['DIRECTLY_ADDED_TO_ITEM_MASTER', 'TRANSFERED_FROM_ITEM_REQ'],
      required: false,
      default: 'DIRECTLY_ADDED_TO_ITEM_MASTER'
    },
    itemFrom: {
      type: String,
      required: false,
      default: 'ITEM_MASTER'
    },
    itemViewCount: {
      type: Number,
      required: false,
      default: 0
    },
    highestSellingPrice: {
      type: Number,
      required: false
    },
    userWhislisted: {
      type: Array,
      default: []
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

export default model('inventoryItemMaster', _schema);
