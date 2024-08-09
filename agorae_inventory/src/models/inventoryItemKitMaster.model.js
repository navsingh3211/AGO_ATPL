import { Schema, model } from 'mongoose';

const kitQuantitySchema = new Schema({
  quantity: {
    type: Number
  },
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'inventoryUnitMaster'
  }
});

const itemListingDataSchema = new Schema({
  itemMasterId: {
    type: Schema.Types.ObjectId,
    ref: 'inventoryItemMaster',
    required: true
  },
  size: {
    type: String
  },
  quantity: {
    type: Number,
    required: true
  },
  sellingPrice: {
    type: Number,
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
    itemKitName: {
      type: String,
      required: true
    },
    kitQuantity: {
      type: kitQuantitySchema,
      required: true
    },
    itemKitId: {
      type: String
    },
    store: {
      type: Schema.Types.ObjectId,
      ref: 'inventoryStoreMaster',
      default: null
    },
    categoryIds: {
      type: [String],
      required: true
    },
    subCategoryIds: {
      type: [String],
      required: true
    },
    itemListingData: {
      type: [itemListingDataSchema]
    },
    combinedSellingPrice: {
      type: Number,
      required: true
    },
    finalSellingPrice: {
      type: Number,
      required: true
    },
    reorderPoint: {
      type: Number,
      required: true
    },
    configurationId: {
      type: Number,
      required: true
    },
    classIds: {
      type: [Number],
      required: true
    },
    castIds: {
      type: [Number],
      required: true
    },
    isItemExchangable: {
      type: Boolean,
      required: true,
      default: true
    },
    pickupPeriod: {
      type: Number,
      required: false
    },
    exchangePeriod: {
      type: Number,
      required: false
    },
    itemKitViewCount: {
      type: Number,
      required: false,
      default: 0
    },
    itemFrom: {
      type: String,
      required: false,
      default: 'ITEM_KIT'
    },
    userWhislisted: {
      type: Array,
      default: []
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
export default model('inventoryItemKitMaster', _schema);
