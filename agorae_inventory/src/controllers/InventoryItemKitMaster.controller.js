/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import itemKitMaster from '../services/inventoryItemKitMaster.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */

export const createInventoryItemKitMaster = async (req, res, next) => {
  try {
    const data = await itemKitMaster.createInventoryItemKitMasterService(
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

export const getSubCategoryByCategoriesId = async (req, res, next) => {
  try {
    const data = await itemKitMaster.getSubCategoryByCategoriesIdService(
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

export const getItemListingByCategoriesAndSubCats = async (req, res, next) => {
  try {
    const data =
      await itemKitMaster.getItemListingByCategoriesAndSubCatsService(req, res);
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

export const getItemKitListing = async (req, res, next) => {
  try {
    const data = await itemKitMaster.getItemKitListingService(req, res);
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

export const getItemKitDetailsById = async (req, res, next) => {
  try {
    const data = await itemKitMaster.getItemKitDetailsByIdService(req, res);
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

export const editInventoryItemKitMaster = async (req, res, next) => {
  try {
    const data = await itemKitMaster.editInventoryItemKitMasterService(req, res);
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
