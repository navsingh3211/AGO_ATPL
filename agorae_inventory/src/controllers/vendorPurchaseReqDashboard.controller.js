/* eslint-disable max-len */
import vendorPurchaseReqDash from '../services/vendorPurchaseReqDashboard.service.js';
export const vendorPurchaseReqCount = async (req, res, next) => {
  try {
    const data = await vendorPurchaseReqDash.vendorPurchaseReqCountService(
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

export const vendorPurchaseReqGraphData = async (req, res, next) => {
  try {
    const data = await vendorPurchaseReqDash.vendorPurchaseReqGraphDataService(
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
