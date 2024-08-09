/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import InventoryCategoryMaster from '../models/InventoryCategoryMaster.model.js';
import inventoryUnitMaster from '../models/inventoryUnitMaster.model.js';
import inventoryTaxRateMaster from '../models/inventoryTaxRateMaster.model.js';
import inventoryPaymentMode from '../models/inventoryPaymentMode.model.js';
import inventoryChequeStatus from '../models/inventoryChequeStatus.model.js';

//inventory
const createStaticInventoryCategory = async () => {
    try {
        let data = [
            'Stationeries',
            'Uniforms',
            'Art supplies',
            'Lab equipments',
            'Musical instruments',
            'Medical essentials',
            'Sports equipments',
            'Safety equipments',
            'Classroom decoration',
            // 'Kits'
        ];
        data.forEach(async (single) => {
            const options = {
                upsert: true, // Create a new document if not found
                new: true, // Return the updated document
                setDefaultsOnInsert: true // Apply default values for new documents
            };
            const criteria = { categoryName: single };
            const newData = { categoryName: single, isStatic: true };
            await InventoryCategoryMaster.updateOne(criteria, newData, options);
        });
    } catch (error) {
        console.log('error', error);
    }
};

const createStaticInventoryUnit = async () => {
    try {
        let data = [
            'Dozen',
            'Box',
            'Pieces',
            'Pairs',
            'Packets',
            'Gram',
            'Kilogram',
            'Meter',
            'Centimeter',
            'units'
        ];
        data.forEach(async (single) => {
            const options = {
                upsert: true, // Create a new document if not found
                new: true, // Return the updated document
                setDefaultsOnInsert: true // Apply default values for new documents
            };
            const criteria = { unitName: single };
            const newData = { unitName: single, isStatic: true };
            await inventoryUnitMaster.updateOne(criteria, newData, options);
        });
    } catch (error) {
        console.log('error', error);
    }
};

const createStaticGstFeed = async () => {
    try {
        let data = [
            { gstType: 'GST 5', percentage: 5, percentageDecimal: 0.05 },
            { gstType: 'GST 12', percentage: 12, percentageDecimal: 0.12 },
            { gstType: 'GST 18', percentage: 18, percentageDecimal: 0.18 },
            { gstType: 'GST 28', percentage: 28, percentageDecimal: 0.28 }
        ];
        data.forEach(async (gstDoc) => {
            const options = {
                upsert: true, // Create a new document if not found
                new: true, // Return the updated document
                setDefaultsOnInsert: true // Apply default values for new documents
            };
            const criteria = { gstType: gstDoc.gstType };
            const newData = gstDoc;
            await inventoryTaxRateMaster.updateOne(criteria, newData, options);
        });
    } catch (error) {
        console.log('error', error);
    }
};

const createPaymentMode = async () => {
    try {
        let data = [
            "NEFT/RTGS/IMPS",
            "UPI",
            "Debit/Credit Card",
            "Cheque",
            "Demand Draft",
            "Payment Gateways",
            "ECS",
        ];
        data.forEach(async (e) => {
            let response = await inventoryPaymentMode.findOne({
                paymentModeName: e
            })
            if (!response) {
                await inventoryPaymentMode.create({paymentModeName : e})
            }
        });
    } catch (error) {
        console.log('error', error);
    }
};
const createChequeStatus = async () => {
    try {
        let data = [
            "Cheque Cleared",
            "Cheque Received but not submitted",
            "Cheque Bounced",
        ];
        data.forEach(async (e) => {
            let response = await inventoryChequeStatus.findOne({
                chequeStatusName: e
            })
            if (!response) {
                await inventoryChequeStatus.create({chequeStatusName : e})
            }
        });
    } catch (error) {
        console.log('error', error);
    }
};

export { createStaticInventoryCategory, createStaticInventoryUnit, createStaticGstFeed, createPaymentMode , createChequeStatus };
