/* eslint-disable prettier/prettier */
import { Schema, model } from 'mongoose';

const orderedQuantity = new Schema({
    size: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        required: true
    },
    orderedItemPricePerUnit: {
        type: Number,
        required: true
    },
    unit: {
        type: Schema.Types.ObjectId,
        ref: 'inventoryUnitMaster'
    }
});

const exchangeQuantity = new Schema({
    size: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: Schema.Types.ObjectId,
        ref: 'inventoryUnitMaster',
        required: false,
        default: null
    },
    exchangeItemPrice: {
        type: Number,
        required: true
    },
    exchangeStatusApp: {
        status: {
            type: String,
            required: false,
        },
        colorCode: {
            type: String,
            required: false,
        },
        backgroundColorCode: {
            type: String,
            required: false,
        }
        // enum: [
        //     'ADMIN_ISSUED_AWAITING_PICKEDUP',
        //     'ADMIN_ISSUED_EXCHANGE_DONE',
        //     'STUDENT_REQ_AWAITING_PICKEDUP',
        //     'STUDENT_REQ_EXCHANGE_DONE',
        //     'EXCHANGE_REJECTED'
        // ],
        // default: 'PENDING_EXCHANGE'
    },
    exchangeStatusWeb: [
        {
            status: {
                type: String,
                required: true
            },
            colorCode: {
                type: String,
                required: true
            }
        }
    ],
    exchangeEstimatedPickupDate: {
        type: Date,
        default: Date.now
    },
    isExchangeAccepted : {
        type : Boolean,
        default : false
    },
    isExchangeRejected : {
        type : Boolean,
        default : false
    }
});

const _schema = new Schema(
    {
        instituteId: {
            type: Number,
            index: true,
            select: false
        },
        itemFrom: {
            type: String,
            required: false,
            enum: ['ITEM_MASTER', 'ITEM_KIT'],
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
            default: null
        },
        itemName: {
            type: String,
            required: true
        },
        orderId: {
            type: String,
            required: true,
            index: true
        },
        transactionId: {
            type: String,
            required: false,
            default: "NA",
            index: true
        },
        studentId: {
            type: Number,
            required: true
        },
        configurationId: {
            type: Number,
            required: true
        },
        subSessionId: {
            type: [Number],
            required: true
        },
        classId: {
            type: Number,
            required: true
        },
        batch: {
            type: Number,
            required: true
        },
        orderedQuantity: [orderedQuantity],
        itemInStock: {
            type: Number,
            required: false
        },//not required delete later
        orderedItemPrice: {
            type: Number,
            required: true
        },
        paymentMode: {
            type: String,
            enum: ['COD', 'ONLINE'],
            required: true,
            default: 'COD'
        },
        paymentStatus: {
            type: String,
            enum: ['SUCCESS', 'FAIL', 'PENDING'],
            required: true,
            default: 'PENDING'
        },
        estimatedPickUpDate: {
            type: Date,
            default: Date.now
        },
        pickUpDate: {
            type: Date,
            default: Date.now
        },
        orderDate: {
            type: Date,
            default: Date.now
        },
        orderRejectDate: {
            type: Date,
            default: Date.now
        },
        exchangeRejectDate: {
            type: Date,
            default: Date.now
        },
        exchangeCompleteDate: {
            type: Date,
            default: Date.now
        },
        // orderStatus: {
        //     type: String,
        //     enum: [
        //         'ADMIN_ISSUED_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP',
        //         'ADMIN_ISSUED_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP',
        //         'ADMIN_ISSUED_ONLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP',
        //         'ADMIN_ISSUED_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP',
        //         'ADMIN_ISSUED_OFFLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP',

        //         'STUDENT_ORDER_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP',
        //         'STUDENT_ORDER_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP',
        //         'STUDENT_ORDER_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP',
        //         'STUDENT_ORDER_REJECTED',
        //         'ORDER_CREATED',
        //         'STUDENT_ORDER_ONLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP',
        //         'STUDENT_ORDER_OFFLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP',
        //         'STUDENT_CANCELLED_ORDER'
        //     ],
        //     required: true,
        //     default: 'ORDER_CREATED'
        // },
        isPaymentDone: {
            type: Boolean,
            required: false,
            default: false,
        },
        isItemPickedUp: {
            type: Boolean,
            required: false,
            default: false,
        },
        isItemRejected: {
            type: Boolean,
            required: false,
            default: false,
        },
        isExchangeRequested: {
            type: Boolean,
            required: false,
            default: false,
        },
        orderStatusWeb: [
            {
                status: {
                    type: String,
                    required: true
                },
                colorCode: {
                    type: String,
                    required: true
                }
            }
        ],
        orderStatusApp:
        {
            status: {
                type: String,
                required: true
            },
            colorCode: {
                type: String,
                required: true
            },
            backgroundColorCode: {
                type: String,
                required: true
            }
        }
        ,
        orderBy: {
            type: String,
            enum: [
                'ME',
                'ASSIGN_BY_ADMIN'
            ],
            required: false,
            default: 'ME'
        },
        exchangeData: [exchangeQuantity],
        reasonForExchange: {
            type: String,
            required: false,
            default: ''
        },
        commentForExchange: {
            type: String,
            required: false,
            default: ''
        },
        exchangeRequestDate: {
            type: Date,
            default: ''
        },
        exchangeRaisedBy: {
            type: String,
            enum: [
                'STUDENT',
                'ADMIN',
                'NO_EXCHANGE_RAISED'
            ],
            required: false,
            default: 'NO_EXCHANGE_RAISED'
        },
        isMarkedAsDamage: {
            type: Boolean,
            required: false,
            default: false,
            index: true
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
export default model('inventoryStudentOrderMaster', _schema);
