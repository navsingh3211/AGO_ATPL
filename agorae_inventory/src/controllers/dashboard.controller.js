import dashboard from '../services/dashboard.service.js';

export const getTotalCountForDashboard = async (req, res, next) => {
  try {
    const data = await dashboard.getTotalCountForDashboardService(req, res);
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

export const getItemDetailsChart = async (req, res, next) => {
  try {
    const data = await dashboard.getItemDetailsChartService(req, res);
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

export const getViewDataForLowStockItem = async (req, res, next) => {
  try {
    const data = await dashboard.getViewDataForLowStockItemService(req, res);
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

export const orderLifeCycle = async (req, res, next) => {
  try {
    const data = await dashboard.orderLifeCycle(req, res);
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

export const orderDetailsTimewise = async (req, res, next) => {
  try {
    const data = await dashboard.orderDetailsTimewise(req, res);
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
