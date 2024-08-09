/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
import ItemSizeMaster from '../services/inventoryItemSize.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */
// console.log(CategotyMaster);
export const createInventoryItemSize = async (req, res, next) => {
  try {
    const data = await ItemSizeMaster.createInventoryItemSizeService(req, res);
    // console.log(data);
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

export const editInventoryItemSize = async (req, res, next) => {
  try {
    const data = await ItemSizeMaster.editInventoryItemSizeService(req, res);
    // console.log(data);
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

export const deleteInventoryItemSize = async (req, res, next) => {
  try {
    const data = await ItemSizeMaster.deleteInventoryItemSizeService(req, res);
    // console.log(data);
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

export const getItemSizetList = async (req, res, next) => {
  try {
    const data = await ItemSizeMaster.getInventoryItemSizeService(req, res);
    // console.log(data);
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

export const getSizetList = async (req, res, next) => {
  try {
    const data = await ItemSizeMaster.getInventorySizeService(req, res);
    // console.log(data);
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
