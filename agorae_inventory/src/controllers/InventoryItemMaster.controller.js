/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
import itemMaster from '../services/inventoryItemMaster.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */

export const createInventoryItemItemMaster = async (req, res, next) => {
  try {
    const data = await itemMaster.createInventoryNewItemService(req, res);
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

export const editInventoryItemItemMaster = async (req, res, next) => {
  try {
    const data = await itemMaster.editInventoryNewItemService(req, res);
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

export const deleteInventoryItemItemMaster = async (req, res, next) => {
  try {
    const data = await itemMaster.deleteInventoryNewItemService(req, res);
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

export const getItemDetails = async (req, res, next) => {
  try {
    const data = await itemMaster.getItemDetailsByIdService(req, res);
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

export const getItemListing = async (req, res, next) => {
  try {
    const data = await itemMaster.getItemListingService(req, res);
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

export const updateHighestSellingPriceForOldData = async (req, res, next) => {
  try {
    const data = await itemMaster.updateHighestSellingPriceForOldData(req, res);
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
