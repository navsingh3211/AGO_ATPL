/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
import SubCatMaster from '../services/inventorySubCategory.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */
// console.log(CategotyMaster);
export const createInventorySubCat = async (req, res, next) => {
  try {
    const data = await SubCatMaster.createInventorySubCategoryService(req, res);
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

export const editInventorySubCat = async (req, res, next) => {
  try {
    const data = await SubCatMaster.updateInventorySubCatService(req, res);
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

export const deleteInventorySubCat = async (req, res, next) => {
  try {
    const data = await SubCatMaster.deleteInventorySubCatService(req, res);
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

export const getSubCatList = async (req, res, next) => {
  try {
    const data = await SubCatMaster.getInventorySubCatService(req, res);
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
