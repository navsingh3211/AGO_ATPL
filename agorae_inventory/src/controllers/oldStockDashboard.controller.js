/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
import oldStockSellOutMaster from '../services/oldStockSellOutDashboard.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */

export const oldStockSellCount = async (req, res, next) => {
  try {
    const data = await oldStockSellOutMaster.oldStockSellCountService(req, res);
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

export const oldStockGraphData = async (req, res, next) => {
  try {
    const data = await oldStockSellOutMaster.oldStockoldStockGraphData(
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
