/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
// import { createInventoryCategoryService } from '../services/inventoryCategory.service.js';
import StoreMaster from '../services/inventoryStore.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */
// console.log(CategotyMaster);
export const createInventoryStore = async (req, res, next) => {
  try {
    const data = await StoreMaster.createInventoryStoreService(req, res);
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

export const editInventoryStore = async (req, res, next) => {
  try {
    const data = await StoreMaster.editInventoryStoreService(req, res);
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

export const deleteInventoryStore = async (req, res, next) => {
  try {
    const data = await StoreMaster.deleteInventoryStoreService(req, res);
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

export const getInventoryStoreListing = async (req, res, next) => {
  try {
    const data = await StoreMaster.getInventoryStoreListingService(req, res);
    // console.log(data);
    res.status(HttpStatus.OK).json({
      success: data.success,
      code: data.code,
      data: data.data,
      message: data.message
    });
    // console.log("nfeujf");
  } catch (error) {
    next(error);
  }
};
