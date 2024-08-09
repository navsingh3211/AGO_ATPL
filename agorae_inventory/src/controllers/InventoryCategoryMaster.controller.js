/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
// import { createInventoryCategoryService } from '../services/inventoryCategory.service.js';
import CategotyMaster from '../services/inventoryCategory.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */
// console.log(CategotyMaster);
export const createInventoryCategory = async (req, res, next) => {
  try {
    const data = await CategotyMaster.createInventoryCategoryService(req, res);
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

export const editInventoryCategory = async (req, res, next) => {
  try {
    const data = await CategotyMaster.updateInventoryCategoryService(req, res);
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

export const deleteInventoryCategory = async (req, res, next) => {
  try {
    const data = await CategotyMaster.deleteInventoryCategoryService(req, res);
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

export const getCategoryList = async (req, res, next) => {
  try {
    const data = await CategotyMaster.getInventoryCategoryService(req, res);
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
