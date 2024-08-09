/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import inventoryReceiptSetting from '../services/inventoryReceiptSetting.service.js';

/**
 * Controller to get receipt setting
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */

export const createInventoryReceiptSetting = async (req, res, next) => {
  try {
    const data = await inventoryReceiptSetting.createInventoryReceiptSettingService(
      req,
      res
    );
    res.status(data.code).json({
      success: data.success,
      code: data.code,
      data: data.data,
      message: data.message
    });
  } catch (error) {
    next(error);
  }
};

export const getWhoHasLastEditedReceipt = async (req, res, next) => {
  try {
    const data = await inventoryReceiptSetting.getWhoHasLastEditedReceiptService(
      req,
      res
    );
    res.status(data.code).json({
      success: data.success,
      code: data.code,
      data: data.data,
      message: data.message
    });
  } catch (error) {
    next(error);
  }
};

export const editInventoryReceiptSetting = async (req, res, next) => {
  try {
    const data = await inventoryReceiptSetting.editInventoryReceiptSettingService(
      req,
      res
    );
    res.status(data.code).json({
      success: data.success,
      code: data.code,
      data: data.data,
      message: data.message
    });
  } catch (error) {
    next(error);
  }
};

export const getReceiptDetails = async (req, res, next) => {
  try {
    const data = await inventoryReceiptSetting.getReceiptDetailsService(
      req,
      res
    );
    res.status(data.code).json({
      success: data.success,
      code: data.code,
      data: data.data,
      message: data.message
    });
  } catch (error) {
    next(error);
  }
};

export const checkInstitutionCodeExit = async (req, res, next) => {
  try {
    const data = await inventoryReceiptSetting.checkInstitutionCodeExitService(
      req,
      res
    );
    res.status(data.code).json({
      success: data.success,
      code: data.code,
      data: data.data,
      message: data.message
    });
  } catch (error) {
    next(error);
  }
};
