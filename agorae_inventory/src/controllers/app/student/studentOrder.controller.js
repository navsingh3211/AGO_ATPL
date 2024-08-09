/* eslint-disable max-len */
import studentService from '../../../services/app/student/studentOrder.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */

export const createAnOrder = async (req, res, next) => {
  try {
    const data = await studentService.createAnOrderService(req, res);
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

export const createRequestForExchange = async (req, res, next) => {
  try {
    const data = await studentService.createRequestForExchangeService(req, res);
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

export const markAsDamageItem = async (req, res, next) => {
  try {
    const data = await studentService.markAsDamageItemService(req, res);
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
