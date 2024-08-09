/* eslint-disable no-unused-vars */
import oldStockSellOut from '../models/oldStockSellOut.model.js';
import inventoryItemMaster from '../models/inventoryItemMaster.model.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';

const oldStockSellCountService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;

    let financialYear = req.query
      ? req.query.financialYear
        ? req.query.financialYear
        : ''
      : '';
    let categoryId = req.query
      ? req.query.categoryId
        ? req.query.categoryId
        : ''
      : '';
    let subCatId = req.query
      ? req.query.subCatId
        ? req.query.subCatId
        : ''
      : '';

    financialYear = JSON.parse(financialYear);
    let startYear = financialYear[0];
    let endYear = financialYear[1];

    startYear = new Date(Date.UTC(startYear, 0, 1, 0, 0, 0)).toISOString();
    endYear = new Date(Date.UTC(endYear, 0, 1, 0, 0, 0)).toISOString();
    // console.log(startYear,'-----',endYear);
    // process.exit(0);

    /* calculating total item counting start-->*/
    let conditionObjForTotalItems = { status: true, instituteId: instituteId };
    if (categoryId) {
      conditionObjForTotalItems.categoryId = categoryId;
    }
    if (subCatId) {
      conditionObjForTotalItems.subCategoryId = subCatId;
    }
    if (startYear && endYear) {
      conditionObjForTotalItems.createdAt = {
        $gte: startYear,
        $lte: endYear
      };
    }

    let totalItems = await inventoryItemMaster.countDocuments(
      conditionObjForTotalItems
    );

    /*Total number of old stock items and amount received*/
    let condForOldStock = { status: true, instituteId: instituteId };
    if (categoryId) {
      condForOldStock.categoryId = categoryId;
    }
    if (subCatId) {
      condForOldStock.subCategoryId = subCatId;
    }
    if (startYear && endYear) {
      condForOldStock.createdAt = {
        $gte: startYear,
        $lte: endYear
      };
    }

    let oldStockData = await oldStockSellOut.find(condForOldStock, {
      _id: 1,
      totalSellingPrice: 1
    });
    const totalOldStockCount = oldStockData.length;
    const totalAmountReceivedByOldStock = oldStockData.reduce(
      (sum, data) => sum + data.totalSellingPrice,
      0
    );
    /* final result */
    let result = [
      {
        label: 'Total No. of Items in the Inventory',
        value: totalItems,
        img: 'images/dashboard/total-item.svg',
        alt: 'item icon'
      },
      {
        label: 'Total No. of Old Stock items',
        value: totalOldStockCount,
        img: 'images/dashboard/total-order.svg',
        alt: 'order icon'
      },
      {
        label: 'Amount Received from old stock sale',
        value: totalAmountReceivedByOldStock,
        img: 'images/dashboard/total-pickup.svg',
        alt: 'pickup icon'
      }
    ];

    return await apiresponse(true, 'DATA FOUND!', 201, result);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const oldStockoldStockGraphData = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const dateChoice = req.query.dateChoice;
    // console.log(dateChoice, 'dateChoice');
    // process.exit(0);
    const currentDate = new Date(); // Current date
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Month is 0-based
    const currentWeek = getWeekNumber(currentDate);
    const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;

    function getWeekNumber(date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
      return weekNo;
    }

    let matchCondition = { instituteId: instituteId, status: true };
    if (dateChoice === 'thisMonth') {
      matchCondition.createdAt = {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1)
      };
    } else if (dateChoice === 'previousMonth') {
      matchCondition.createdAt = {
        $gte: new Date(currentYear, currentMonth - 2, 1),
        $lt: new Date(currentYear, currentMonth - 1, 1)
      };
    } else if (dateChoice === 'thisWeek') {
      matchCondition.createdAt = {
        $gte: new Date(currentYear, currentMonth - 2, 1),
        $lt: new Date(currentYear, currentMonth - 1, 1)
      };
    } else if (dateChoice === 'previousWeek') {
      matchCondition.createdAt = {
        $gte: new Date(currentYear, currentMonth - 2, 1),
        $lt: new Date(currentYear, currentMonth - 1, 1)
      };
    } else if (dateChoice === 'thisQuater') {
      matchCondition.createdAt = {
        $gte: new Date(currentYear, (currentQuarter - 1) * 3, 1),
        $lt: new Date(currentYear, currentQuarter * 3, 1)
      };
    } else if (dateChoice === 'previousQuater') {
      matchCondition.createdAt = {
        $gte: new Date(currentYear, (currentQuarter - 2) * 3, 1),
        $lt: new Date(currentYear, (currentQuarter - 1) * 3, 1)
      };
    } else if (dateChoice === 'thisYear') {
      matchCondition.createdAt = {
        $gte: new Date(currentYear, 0, 1), // Start of this year
        $lt: new Date(currentYear + 1, 0, 1) // Start of next year
      };
    }
    // console.log(matchCondition);
    // process.exit(0);

    const aggregationPipeline = [
      {
        $match: matchCondition
      },
      {
        $group: {
          _id: { $dateToString: { format: '%d/%m/%Y', date: '$createdAt' } },
          itemMasterId: { $sum: 1 },
          totalAmount: { $sum: '$totalSellingPrice' }
        }
      },
      {
        $project: {
          _id: 1,
          totalItemCount: '$itemMasterId',
          totalAmountReceived: '$totalAmount'
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const result = await oldStockSellOut.aggregate(aggregationPipeline);

    return await apiresponse(true, 'DATA FOUND!', 201, result);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

export default {
  oldStockSellCountService,
  oldStockoldStockGraphData
};
