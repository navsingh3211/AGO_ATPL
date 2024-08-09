/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import vendorPurchaseRequest from '../models/vendorPurchaseRequest.model.js';
import inventoryItemMaster from '../models/inventoryItemMaster.model.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';

const vendorPurchaseReqCountService = async (req, res) => {
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

    /* calculating total porposed item counting start-->*/
    let conditionObjFortotalItemProposed = {
      status: true,
      instituteId: instituteId
    };
    if (categoryId) {
      conditionObjFortotalItemProposed.categoryId = categoryId;
    }
    if (subCatId) {
      conditionObjFortotalItemProposed.subCategoryId = subCatId;
    }
    if (startYear && endYear) {
      conditionObjFortotalItemProposed.createdAt = {
        $gte: startYear,
        $lte: endYear
      };
    }

    let totalItemProposed = await vendorPurchaseRequest.countDocuments(
      conditionObjFortotalItemProposed
    );

    /*Total item received from proposed item */
    conditionObjFortotalItemProposed.vendorPurchaseStatus = 'RECEIVED';
    let totalItemProposedReceived = await vendorPurchaseRequest.countDocuments(
      conditionObjFortotalItemProposed
    );

    /*Total item pending from proposed item */
    conditionObjFortotalItemProposed.vendorPurchaseStatus = 'PENDING';
    let totalItemProposedPending = await vendorPurchaseRequest.countDocuments(
      conditionObjFortotalItemProposed
    );

    /*Total Amount spent on purchase proposed item */
    conditionObjFortotalItemProposed.vendorPurchaseStatus = 'RECEIVED';
    let totalAmountSpentData = await vendorPurchaseRequest.find(
      conditionObjFortotalItemProposed,
      {
        _id: 0,
        itemSizes: 1
      }
    );
    let totalSumOfAmount = 0;
    for (let data of totalAmountSpentData) {
      let sumData = data.itemSizes.reduce(
        (sum, ele) => sum + ele.costPrice * ele.itemQuantity.quantity,
        0
      );
      totalSumOfAmount = totalSumOfAmount + sumData;
    }

    /* final result */
    let result = [
      {
        label: 'Total No. of Item Proposed',
        value: totalItemProposed,
        img: 'images/dashboard/total-item.svg',
        alt: 'item icon'
      },
      {
        label: 'Total No. of items Received',
        value: totalItemProposedReceived,
        img: 'images/dashboard/total-order.svg',
        alt: 'order icon'
      },
      {
        label: 'Total No. of items Pending',
        value: totalItemProposedPending,
        img: 'images/dashboard/total-pickup.svg',
        alt: 'pickup icon'
      },
      {
        label: 'Total Amount spent on purchase',
        value: totalSumOfAmount,
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

const vendorPurchaseReqGraphDataService = async (req, res) => {
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

    let matchCondition = {
      instituteId: instituteId,
      status: true,
      vendorPurchaseStatus: 'RECEIVED'
    };
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
          receivedQtyTotal: { $sum: '$receivedQty.quantity' }
        }
      },
      {
        $project: {
          _id: 1,
          totalItemCount: '$itemMasterId',
          receivedQtyTotal: 1
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const result = await vendorPurchaseRequest.aggregate(aggregationPipeline);

    return await apiresponse(true, 'DATA FOUND!', 201, result);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

export default {
  vendorPurchaseReqCountService,
  vendorPurchaseReqGraphDataService
};
