/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
import locationMaster from '../services/locationMaster.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */

export const createLocationMaster = async (req, res, next) => {
  try {
    const data = await locationMaster.createLocationMasterService(req, res);
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

export const getLocationList = async (req, res, next) => {
  try {
    const data = await locationMaster.getLocationListService(req, res);
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

export const editLocationMaster = async (req, res, next) => {
  try {
    const data = await locationMaster.editLocationMasterService(req, res);
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

export const deleteLocationMaster = async (req, res, next) => {
  try {
    const data = await locationMaster.deleteLocationMasterService(req, res);
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

export const assignItemToLocation = async (req, res, next) => {
  try {
    const data = await locationMaster.assignItemToLocationService(req, res);
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

export const assignedItemToLocationListing = async (req, res, next) => {
  try {
    const data = await locationMaster.assignedItemToLocationListingService(
      req,
      res
    );
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

export const editAssignItemToLocation = async (req, res, next) => {
  try {
    const data = await locationMaster.editAssignItemToLocationService(req, res);
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

export const deleteAssignItemToLocation = async (req, res, next) => {
  try {
    const data = await locationMaster.deleteAssignItemToLocationService(
      req,
      res
    );
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
