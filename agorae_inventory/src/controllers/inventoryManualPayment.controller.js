import HttpStatus from 'http-status-codes';
import inventoryManualPaymentService from '../services/inventoryManualPayment.service.js';

export const getPaymentMode = async (req, res, next) => {
    try {
        const data = await inventoryManualPaymentService.getPaymentMode(req, res);
        res.status(HttpStatus.OK).json({
            success: data.success,
            code: data.code,
            data: data.data,
            message: data.message
        });
    } catch (error) {
        next(error);
    }
};

export const getChecqueStatus = async (req, res, next) => {
    try {
        const data = await inventoryManualPaymentService.getChecqueStatus(req, res);
        res.status(HttpStatus.OK).json({
            success: data.success,
            code: data.code,
            data: data.data,
            message: data.message
        });
    } catch (error) {
        next(error);
    }
};

export const createManualPayment = async (req, res, next) => {
    try {
        const data = await inventoryManualPaymentService.createManualPayment(req, res);
        res.status(HttpStatus.OK).json({
            success: data.success,
            code: data.code,
            data: data.data,
            message: data.message
        });
    } catch (error) {
        next(error);
    }
};

export const getManualPayment = async (req, res, next) => {
    try {
        const data = await inventoryManualPaymentService.getManualPayment(req, res);
        res.status(HttpStatus.OK).json({
            success: data.success,
            code: data.code,
            data: data.data,
            message: data.message
        });
    } catch (error) {
        next(error);
    }
};

export const updateManualPayment = async (req, res, next) => {
    try {
        const data = await inventoryManualPaymentService.updateManualPayment(req, res);
        res.status(HttpStatus.OK).json({
            success: data.success,
            code: data.code,
            data: data.data,
            message: data.message
        });
    } catch (error) {
        next(error);
    }
};

export const cancelManualPayment = async (req, res, next) => {
    try {
        const data = await inventoryManualPaymentService.cancelManualPayment(req, res);
        res.status(HttpStatus.OK).json({
            success: data.success,
            code: data.code,
            data: data.data,
            message: data.message
        });
    } catch (error) {
        next(error);
    }
};

export const getManualPaymentHistoryList = async (req, res, next) => {
    try {
        const data = await inventoryManualPaymentService.getManualPaymentHistoryList(req, res);
        res.status(HttpStatus.OK).json({
            success: data.success,
            code: data.code,
            data: data.data,
            message: data.message
        });
    } catch (error) {
        next(error);
    }
};