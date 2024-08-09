/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
// import { createInventoryCategoryService } from '../services/inventoryCategory.service.js';
import UnitMaster from '../services/inventoryUnit.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */
// console.log(CategotyMaster);
export const createInventoryUnit = async (req, res, next) => {
  try {
    const data = await UnitMaster.createInventoryUnitService(req, res);
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

export const editInventoryUnit = async (req, res, next) => {
  try {
    const data = await UnitMaster.updateInventoryUnitService(req, res);
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

export const deleteInventoryUnit = async (req, res, next) => {
  try {
    const data = await UnitMaster.deleteInventoryUnitService(req, res);
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

export const getUnitList = async (req, res, next) => {
  try {
    const data = await UnitMaster.getInventoryUnitService(req, res);
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
