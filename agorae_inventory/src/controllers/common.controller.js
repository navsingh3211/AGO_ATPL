/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
import CommomMaster from '../services/common.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */

export const getStateListing = async (req, res, next) => {
  try {
    const data = await CommomMaster.getStateListingService(req, res);
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

export const getCityListing = async (req, res, next) => {
  try {
    const data = await CommomMaster.getCityListingService(req, res);
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

export const getImageByDocumentId = async (req, res, next) => {
  try {
    const data = await CommomMaster.getImageByDocumentIdService(req, res);
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

export const deleteFile = async (req, res, next) => {
  try {
    const data = await CommomMaster.deleteFileService(req, res);
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
