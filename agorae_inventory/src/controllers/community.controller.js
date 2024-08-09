/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
import communityMaster from '../services/community.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */

export const createCommunityMaster = async (req, res, next) => {
  try {
    const data = await communityMaster.createCommunityMasterService(req, res);
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

export const getCommunityList = async (req, res, next) => {
  try {
    const data = await communityMaster.getCommunityListService(req, res);
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

export const assignItemToCommunity = async (req, res, next) => {
  try {
    const data = await communityMaster.assignItemToCommunityService(req, res);
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

export const getAssignedItemCommunityList = async (req, res, next) => {
  try {
    const data = await communityMaster.getAssignedItemCommunityListService(
      req,
      res
    );
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

export const editAssignItemToCommunity = async (req, res, next) => {
  try {
    const data = await communityMaster.editAssignItemToCommunityService(
      req,
      res
    );
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

export const releaseAssignItemToCommunity = async (req, res, next) => {
  try {
    const data = await communityMaster.releaseAssignItemToCommunityService(
      req,
      res
    );
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

export const editCommunityMaster = async (req, res, next) => {
  try {
    const data = await communityMaster.editCommunityMasterService(req, res);
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

export const deleteCommunityMaster = async (req, res, next) => {
  try {
    const data = await communityMaster.deleteCommunityMasterService(req, res);
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
