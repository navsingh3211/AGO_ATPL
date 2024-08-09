/* eslint-disable prettier/prettier */
import { Schema, model } from 'mongoose';

const imageSchema = new Schema({
    documentID: {
        type: String,
        required: false
    },
    isPrimary: {
        type: Boolean,
        required: false
    }
});

const ItemQuantitySchema = new Schema({
    quantity: {
        type: Number,
        required: false
    },
    unit: {
        type: Schema.Types.ObjectId,
        ref: 'inventoryUnitMaster',
        required: false,
        default: null
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

const orderByStudentDetailsSchema = new Schema({
    class: {
        type: Number,
        required: false
    },
    batch :{
        type: Number
    }
});

const orderByStaffDetailsSchema = new Schema({
    staffName: {
        type: String,
        required: false
    },
    employeeCode: {
        type: String,
        required: false
    }
});

const itemSizeSchema = new Schema({
    size: {
      type: String,
      required: false
    },
    itemQuantity: {
      type: ItemQuantitySchema,
      required: false
    },
    costPrice: {
      type: Number,
      required: false
    },
    sellingPrice: {
      type: Number,
      required: false
    },
    totalSellingPrice: {
      type: Number
    }
  });

const damagedQuantitySchema = new Schema({
    size: {
        type: String,
        required: false
    },
    quantity: {
        type: Number,
        required: true
    },
    costPrice:{
        type: Number,
        required: false
    },
    reason:{
        type: String,
        required: false
    },
    status:{
        type: Boolean,
        required: false,
        default: true,
        index: true
    }
});

const _schema = new Schema(
    {
        instituteId: {
            type: Number,
            index: true,
            select: false
        },
        itemFrom:{
            type: String,
            required: false,
            enum: ['ITEM_MASTER','ITEM_KIT'],
            default: 'ITEM_MASTER'
        },
        itemMasterId: {
            type: Schema.Types.ObjectId,
            ref: 'inventoryItemMaster',
            default: null
        },
        itemKitMasterId: {
            type: Schema.Types.ObjectId,
            ref: 'inventoryItemKitMaster',
            required: false,
            default: null
        },
        damagedQuantity:{
            type:[damagedQuantitySchema],
            required: false,
            default: null
        },
        issueType:{
            type: String,
            enum: [
                'ISSUED',
                'NONISSUED'
            ],
            default: 'NONISSUED',
            required: false
        },
        damageRaisedByUserId: {
            type: Number,
            required: true
        },
        orderByStudentDetails: {
            type: orderByStudentDetailsSchema,
            default: null,
            required: false,
        },
        orderByStaffDetails:{
            type: orderByStaffDetailsSchema,
            default: null,
            required: false
        },
        damageRaisedByUserType: {
            type: String,
            enum: [
                'ADMIN',
                'STAFF',
                'STUDENT'
            ],
            default: 'ADMIN',
            required: false
        },
        itemImages: {
            type: [imageSchema],
            default: null
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'InventoryCategoryMaster',
            default: null,
            required: false
        },
        subCategoryId: {
            type: Schema.Types.ObjectId,
            ref: 'inventorySubCategoryMaster',
            default: null,
            required: false
        },
        fixedVendorId: {
            type: Schema.Types.ObjectId,
            ref: 'inventoryVendorMaster',
            default: null,
            required: false
        },
        itemId: {
            type: String,
            default: '',
            required: false
        },
        store: {
            type: Schema.Types.ObjectId,
            ref: 'inventoryStoreMaster',
            default: null
        },
        itemName: {
            type: String,
            required: false
        },
        itemAvailableTo: {
            type: String,
            enum: ['all', 'student', 'staff'],
            required: false,
            default: 'all'
        },
        priceApplicableToStaff: {
            type: Boolean,
            required: false,
            default: false,
            index: true
        },
        exchangeableItemFor: {
            type: String,
            enum: ['all', 'student', 'staff', 'none'],
            required: false,
            default: 'all'
        },
        exchangePeriodForStudent: {
            type: Number,
            required: false,
            default: null
        },
        exchangePeriodForStaff: {
            type: Number,
            required: false,
            default: null
        },
        pickupPeriodForStudent: {
            type: Number,
            required: false,
            default: null
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
            type: [itemSizeSchema],
            default: null
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
        reorderPoint: {
            type: reorderPointSchema,
            default: null
        },
        preferredVendor: {
            type: Schema.Types.ObjectId,
            ref: 'inventoryVendorMaster',
            required: false,
            default: null
        },
        dateOfPurchase: {
            type: Date,
            default: Date.now
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

export default model('inventoryDamagedItemMaster', _schema);
