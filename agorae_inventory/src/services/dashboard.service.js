/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import CONSTANTS from '../utils/constants.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';
import mongoose from 'mongoose';
import { getUnitNameAndIdById } from '../utils/commonFunction.util.js';
import inventoryItemMaster from '../models/inventoryItemMaster.model.js';
import inventoryStudentOrderMaster from '../models/inventoryStudentOrderMaster.model.js';
import inventoryStaffOrderMaster from '../models/inventoryStaffOrderMaster.model.js';
import inventoryDamagedItemMaster from '../models/inventoryDamagedItemMaster.model.js';

const getTotalCountForDashboardService = async (req, res) => {
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

    let userType = req.query
      ? req.query.userType
        ? req.query.userType
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
    /* calculating total item counting <---end*/

    /* calculating total item counting start-->*/
    //a.)student order counting
    let matchTopObjStudent = {
      status: true,
      instituteId: instituteId,
      itemFrom: 'ITEM_MASTER',
      paymentStatus: { $ne: 'FAIL' },
      orderStatusWeb: {
        $not: {
          $elemMatch: {
            status: {
              $in: [
                'Rejected',
                'Online Payment Pending',
                'Offline Payment Pending'
              ]
            }
          }
        }
      },
      'orderStatusApp.status': { $ne: 'Order Cancelled' }
    };

    if (startYear && endYear) {
      matchTopObjStudent.createdAt = {
        $gte: new Date(startYear),
        $lte: new Date(endYear)
      };
    }

    let studentPipeline = [
      {
        $match: matchTopObjStudent
      },
      {
        $lookup: {
          from: 'inventoryitemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $unwind: '$itemDetails'
      }
    ];
    if (categoryId && subCatId) {
      studentPipeline.push({
        $match: {
          'itemDetails.categoryId': new mongoose.Types.ObjectId(categoryId),
          'itemDetails.subCategoryId': new mongoose.Types.ObjectId(subCatId)
        }
      });
    }

    if (categoryId && !subCatId) {
      studentPipeline.push({
        $match: {
          'itemDetails.categoryId': new mongoose.Types.ObjectId(categoryId)
        }
      });
    }

    studentPipeline.push({
      $project: {
        _id: 1
      }
    });

    //b.)staff order counting
    let matchTopObjStaff = {
      status: true,
      instituteId: instituteId,
      paymentStatus: { $ne: 'FAIL' },
      orderStatusWeb: {
        $not: {
          $elemMatch: {
            status: {
              $in: [
                'Rejected',
                'Online Payment Pending',
                'Offline Payment Pending'
              ]
            }
          }
        }
      },
      'orderStatusApp.status': { $ne: 'Order Cancelled' }
    };

    if (startYear && endYear) {
      matchTopObjStaff.createdAt = {
        $gte: new Date(startYear),
        $lte: new Date(endYear)
      };
    }

    let staffPipeline = [
      {
        $match: matchTopObjStaff
      },
      {
        $lookup: {
          from: 'inventoryitemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $unwind: '$itemDetails'
      }
    ];
    if (categoryId && subCatId) {
      staffPipeline.push({
        $match: {
          'itemDetails.category': new mongoose.Types.ObjectId(categoryId),
          'itemDetails.subCategoryId': new mongoose.Types.ObjectId(subCatId)
        }
      });
    }

    if (categoryId && !subCatId) {
      staffPipeline.push({
        $match: {
          'itemDetails.categoryId': new mongoose.Types.ObjectId(categoryId)
        }
      });
    }

    staffPipeline.push({
      $project: {
        _id: 1
      }
    });

    let totalOrdersReceived = 0;
    if (userType === 'STUDENT') {
      let totalStudentOrders = await inventoryStudentOrderMaster.aggregate(
        studentPipeline
      );
      // console.log(totalStudentOrders, 'totalStudentOrders');
      totalOrdersReceived = totalOrdersReceived + totalStudentOrders.length;
    }

    if (userType === 'STAFF') {
      let totalStaffOrders = await inventoryStaffOrderMaster.aggregate(
        staffPipeline
      );
      totalOrdersReceived = totalOrdersReceived + totalStaffOrders.length;
    }

    if (userType === 'ALL') {
      let totalStudentOrders = await inventoryStudentOrderMaster.aggregate(
        studentPipeline
      );
      let totalStaffOrders = await inventoryStaffOrderMaster.aggregate(
        staffPipeline
      );
      totalOrdersReceived =
        totalOrdersReceived +
        totalStudentOrders.length +
        totalStaffOrders.length;
    }

    /* pending orders */
    //a.)student pending order counting
    let matchTopPendingObjStudent = {
      status: true,
      instituteId: instituteId,
      itemFrom: 'ITEM_MASTER',
      paymentStatus: { $ne: 'FAIL' },
      orderStatusWeb: {
        $elemMatch: {
          status: 'Awaiting Pickup'
        }
      }
    };

    if (startYear && endYear) {
      matchTopPendingObjStudent.createdAt = {
        $gte: new Date(startYear),
        $lte: new Date(endYear)
      };
    }

    let studentPendingPipeline = [
      {
        $match: matchTopPendingObjStudent
      },
      {
        $lookup: {
          from: 'inventoryitemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $unwind: '$itemDetails'
      }
    ];
    if (categoryId && subCatId) {
      studentPendingPipeline.push({
        $match: {
          'itemDetails.categoryId': new mongoose.Types.ObjectId(categoryId),
          'itemDetails.subCategoryId': new mongoose.Types.ObjectId(subCatId)
        }
      });
    }

    if (categoryId && !subCatId) {
      studentPendingPipeline.push({
        $match: {
          'itemDetails.categoryId': new mongoose.Types.ObjectId(categoryId)
        }
      });
    }

    studentPendingPipeline.push({
      $project: {
        _id: 1
      }
    });

    //b.)staff order counting
    let matchTopObjPendingStaff = {
      status: true,
      instituteId: instituteId,
      paymentStatus: { $ne: 'FAIL' },
      orderStatusWeb: {
        $elemMatch: {
          status: 'Awaiting Pickup'
        }
      }
    };

    if (startYear && endYear) {
      matchTopObjPendingStaff.createdAt = {
        $gte: new Date(startYear),
        $lte: new Date(endYear)
      };
    }

    let staffPendingPipeline = [
      {
        $match: matchTopObjPendingStaff
      },
      {
        $lookup: {
          from: 'inventoryitemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $unwind: '$itemDetails'
      }
    ];
    if (categoryId && subCatId) {
      staffPendingPipeline.push({
        $match: {
          'itemDetails.category': new mongoose.Types.ObjectId(categoryId),
          'itemDetails.subCategoryId': new mongoose.Types.ObjectId(subCatId)
        }
      });
    }

    if (categoryId && !subCatId) {
      staffPendingPipeline.push({
        $match: {
          'itemDetails.categoryId': new mongoose.Types.ObjectId(categoryId)
        }
      });
    }

    staffPendingPipeline.push({
      $project: {
        _id: 1
      }
    });

    let totalOrdersReceivedPending = 0;
    if (userType === 'STUDENT') {
      let totalStudentOrdersPend = await inventoryStudentOrderMaster.aggregate(
        studentPendingPipeline
      );

      totalOrdersReceivedPending =
        totalOrdersReceivedPending + totalStudentOrdersPend.length;
    }

    if (userType === 'STAFF') {
      let totalStaffOrdersPend = await inventoryStaffOrderMaster.aggregate(
        staffPendingPipeline
      );
      totalOrdersReceivedPending =
        totalOrdersReceivedPending + totalStaffOrdersPend.length;
    }

    if (userType === 'ALL') {
      let totalStudentOrdersPend = await inventoryStudentOrderMaster.aggregate(
        studentPendingPipeline
      );
      let totalStaffOrdersPend = await inventoryStaffOrderMaster.aggregate(
        staffPendingPipeline
      );
      totalOrdersReceivedPending =
        totalOrdersReceivedPending +
        totalStudentOrdersPend.length +
        totalStaffOrdersPend.length;
    }

    /* Total amount received from order */
    //a.)student amount received
    let matchTopObjStudentAmount = {
      status: true,
      instituteId: instituteId,
      isPaymentDone: true
    };

    if (startYear && endYear) {
      matchTopObjStudentAmount.createdAt = {
        $gte: new Date(startYear),
        $lte: new Date(endYear)
      };
    }

    let studentReceivedAmountPipeline = [
      {
        $match: matchTopObjStudentAmount
      },
      {
        $lookup: {
          from: 'inventoryitemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $unwind: '$itemDetails'
      }
    ];
    if (categoryId && subCatId) {
      studentReceivedAmountPipeline.push({
        $match: {
          'itemDetails.categoryId': new mongoose.Types.ObjectId(categoryId),
          'itemDetails.subCategoryId': new mongoose.Types.ObjectId(subCatId)
        }
      });
    }

    if (categoryId && !subCatId) {
      studentReceivedAmountPipeline.push({
        $match: {
          'itemDetails.categoryId': new mongoose.Types.ObjectId(categoryId)
        }
      });
    }

    studentReceivedAmountPipeline.push({
      $project: {
        _id: 1,
        orderedItemPrice: 1
      }
    });
    // console.log(studentReceivedAmountPipeline,'studentReceivedAmountPipeline')

    //b.)staff order counting
    let matchTopObjAmountStaff = {
      status: true,
      instituteId: instituteId,
      isPaymentDone: true
    };

    if (startYear && endYear) {
      matchTopObjAmountStaff.createdAt = {
        $gte: new Date(startYear),
        $lte: new Date(endYear)
      };
    }

    let staffAmountPipeline = [
      {
        $match: matchTopObjAmountStaff
      },
      {
        $lookup: {
          from: 'inventoryitemmasters',
          localField: 'itemMasterId',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $unwind: '$itemDetails'
      }
    ];
    if (categoryId && subCatId) {
      staffAmountPipeline.push({
        $match: {
          'itemDetails.category': new mongoose.Types.ObjectId(categoryId),
          'itemDetails.subCategoryId': new mongoose.Types.ObjectId(subCatId)
        }
      });
    }

    if (categoryId && !subCatId) {
      staffAmountPipeline.push({
        $match: {
          'itemDetails.categoryId': new mongoose.Types.ObjectId(categoryId)
        }
      });
    }

    staffAmountPipeline.push({
      $project: {
        _id: 1,
        orderedItemPrice: 1
      }
    });

    let totalOrdersAmountRec = 0;
    if (userType === 'STUDENT') {
      let totalStudentOrdersAmount =
        await inventoryStudentOrderMaster.aggregate(
          studentReceivedAmountPipeline
        );
      let totalAmountCal = totalStudentOrdersAmount.reduce(
        (total, order) => total + order.orderedItemPrice,
        0
      );
      totalOrdersAmountRec = totalOrdersAmountRec + totalAmountCal;
    }

    if (userType === 'STAFF') {
      let totalStaffOrdersAmount = await inventoryStaffOrderMaster.aggregate(
        staffAmountPipeline
      );
      let totalAmountCal1 = totalStaffOrdersAmount.reduce(
        (total, order) => total + order.orderedItemPrice,
        0
      );

      totalOrdersAmountRec = totalOrdersAmountRec + totalAmountCal1;
    }

    if (userType === 'ALL') {
      let totalStudentOrdersAmount =
        await inventoryStudentOrderMaster.aggregate(
          studentReceivedAmountPipeline
        );
      let totalAmountCal = totalStudentOrdersAmount.reduce(
        (total, order) => total + order.orderedItemPrice,
        0
      );

      let totalStaffOrdersAmount = await inventoryStaffOrderMaster.aggregate(
        staffAmountPipeline
      );
      let totalAmountCal1 = totalStaffOrdersAmount.reduce(
        (total, order) => total + order.orderedItemPrice,
        0
      );

      totalOrdersAmountRec =
        totalOrdersAmountRec + totalAmountCal + totalAmountCal1;
    }

    /* final result */
    let result = [
      {
        label: 'Total No. of Items in the Inventory',
        value: totalItems,
        img: 'images/dashboard/total-item.svg',
        alt: 'item icon'
      },
      {
        label: 'Total No. of Orders Received',
        value: totalOrdersReceived,
        img: 'images/dashboard/total-order.svg',
        alt: 'order icon'
      },
      {
        label: 'Total No. of Pending Order Pickup',
        value: totalOrdersReceivedPending,
        img: 'images/dashboard/total-pickup.svg',
        alt: 'pickup icon'
      },
      {
        label: 'Total Amount Received from Orders',
        value: totalOrdersAmountRec,
        img: 'images/dashboard/total-received.svg',
        alt: 'received icon'
      }
    ];

    return await apiresponse(true, 'DATA FOUND!', 201, result);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const getItemDetailsChartService = async (req, res) => {
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

    let conditionObjForTotalItems = { status: true, instituteId: instituteId };
    if (categoryId) {
      conditionObjForTotalItems.categoryId = categoryId;
    }
    if (subCatId) {
      conditionObjForTotalItems.subCategoryId = subCatId;
    }
    if (startYear && endYear) {
      conditionObjForTotalItems.createdAt = {
        $gte: new Date(startYear),
        $lte: new Date(endYear)
      };
    }

    let totalItems = await inventoryItemMaster.countDocuments(
      conditionObjForTotalItems
    );
    // console.log(conditionObjForTotalItems)
    let totalLowStockItems = await inventoryItemMaster.aggregate([
      {
        $match: conditionObjForTotalItems
      },
      {
        $project: {
          itemSizes: 1,
          reorderPointData: 1
        }
      },
      {
        $unwind: '$itemSizes'
      },
      {
        $group: {
          _id: '$_id',
          itemSizes: { $push: '$itemSizes' }, // Reconstruct the itemSizes array
          totalQuantity: { $sum: '$itemSizes.itemQuantity.quantity' },
          reorderPoint: { $first: '$reorderPointData.reorderPoint' } // Capture reorderPoint for comparison
        }
      },
      {
        $addFields: {
          isBelowReorderPoint: { $lt: ['$totalQuantity', '$reorderPoint'] } // Add a field to determine if totalQuantity is less than reorderPoint
        }
      },
      {
        $match: {
          isBelowReorderPoint: true // Filter documents where totalQuantity is less than reorderPoint
        }
      }
    ]);
    let totalLowStockItemsCount = totalLowStockItems.length;

    //total damage items not for kit
    conditionObjForTotalItems.itemFrom = 'ITEM_MASTER';
    console.log([
      {
        $match: conditionObjForTotalItems
      },
      {
        $project: {
          _id: 1,
          damagedQuantity: 1
        }
      },
      { $unwind: '$damagedQuantity' },
      {
        $match: {
          'damagedQuantity.status': true // Add the condition for the status field here
        }
      }
    ]);
    let DamageItemsListing = await inventoryDamagedItemMaster.aggregate([
      {
        $match: conditionObjForTotalItems
      },
      {
        $project: {
          _id: 1,
          damagedQuantity: 1
        }
      },
      { $unwind: '$damagedQuantity' },
      {
        $match: {
          'damagedQuantity.status': true // Add the condition for the status field here
        }
      }
    ]);

    let totalDamageItems = DamageItemsListing.length;

    let totalInStockItems = totalItems - totalLowStockItemsCount;

    let InStockItemPercentage = totalItems
      ? Math.round((totalInStockItems / totalItems) * 100)
      : 0;

    let LowStockItemPercentage = totalItems
      ? Math.round((totalLowStockItemsCount / totalItems) * 100)
      : 0;

    // console.log(LowStockItemPercentage, 'totalInStockItemPercentage');
    // process.exit(0);
    let result = {
      totalInStockItems,
      InStockItemPercentage,
      totalLowStockItemsCount,
      LowStockItemPercentage,
      totalDamageItems
    };
    return await apiresponse(true, 'DATA FOUND!', 201, result);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const getViewDataForLowStockItemService = async (req, res) => {
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
    let searchKey = req.query
      ? req.query.searchKey
        ? req.query.searchKey
        : ''
      : '';

    financialYear = JSON.parse(financialYear);
    let startYear = financialYear[0];
    let endYear = financialYear[1];

    startYear = new Date(Date.UTC(startYear, 0, 1, 0, 0, 0)).toISOString();
    endYear = new Date(Date.UTC(endYear, 0, 1, 0, 0, 0)).toISOString();
    // console.log(startYear,'-----',endYear);
    // process.exit(0);

    let conditionObjForTotalItems = { status: true, instituteId: instituteId };
    if (categoryId) {
      conditionObjForTotalItems.categoryId = categoryId;
    }
    if (subCatId) {
      conditionObjForTotalItems.subCategoryId = subCatId;
    }
    if (startYear && endYear) {
      conditionObjForTotalItems.createdAt = {
        $gte: new Date(startYear),
        $lte: new Date(endYear)
      };
    }

    if (searchKey && searchKey.trim()) {
      conditionObjForTotalItems.itemName = {
        $regex: searchKey,
        $options: 'i'
      };
    }

    // console.log(conditionObjForTotalItems)
    let queryArray = [
      {
        $match: conditionObjForTotalItems
      },
      {
        $lookup: {
          from: 'inventorycategorymasters',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $lookup: {
          from: 'inventorysubcategorymasters',
          localField: 'subCategoryId',
          foreignField: '_id',
          as: 'subcategoryData'
        }
      },
      {
        $project: {
          itemName: 1,
          itemId: 1,
          categoryData: 1,
          subcategoryData: 1,
          itemSizes: 1,
          reorderPointData: 1,
          purchaseData: '$createdAt'
        }
      },
      {
        $unwind: '$categoryData'
      },
      {
        $unwind: '$subcategoryData'
      },
      {
        $unwind: '$itemSizes'
      },
      {
        $group: {
          _id: '$_id',
          purchaseData: { $first: '$purchaseData' },
          itemName: { $first: '$itemName' },
          itemId: { $first: '$itemId' },
          categoryData: { $first: '$categoryData' },
          subcategoryData: { $first: '$subcategoryData' },
          itemSizes: { $push: '$itemSizes' }, // Reconstruct the itemSizes array
          totalQuantity: { $sum: '$itemSizes.itemQuantity.quantity' },
          reorderPoint: { $first: '$reorderPointData.reorderPoint' } // Capture reorderPoint for comparison
        }
      },
      {
        $addFields: {
          isBelowReorderPoint: { $lt: ['$totalQuantity', '$reorderPoint'] } // Add a field to determine if totalQuantity is less than reorderPoint
        }
      },
      {
        $match: {
          isBelowReorderPoint: true
        }
      }
    ];

    if (req.query.pageSize && req.query.pageNo) {
      queryArray.push({
        $facet: {
          total: [{ $group: { _id: null, count: { $sum: 1 } } }],
          data: [
            {
              $skip: (Number(req.query.pageNo) - 1) * Number(req.query.pageSize)
            },
            {
              $limit: Number(req.query.pageSize)
            }
          ]
        }
      });
      // console.log(queryArray, 'queryArray');
      let aggregationResult = await inventoryItemMaster.aggregate(queryArray);
      // console.log(aggregationResult, 'aggregationResult');
      let total = aggregationResult[0].total[0]
        ? aggregationResult[0].total[0].count
        : 0;
      let dataListing = aggregationResult[0].data;
      if (total) {
        dataListing = await Promise.all(
          dataListing.map(async (ele) => {
            let itemSizes = ele.itemSizes[0].itemQuantity;
            let unit = itemSizes
              ? await getUnitNameAndIdById(itemSizes.unit)
              : 'NA';
            let { totalQuantity, ...DataValues } = ele;
            return {
              ...DataValues,
              totalQuantity: {
                totalQuantity: totalQuantity,
                unit: unit
              }
            };
          })
        );
      }

      let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
      let result = {
        rows: dataListing,
        total: total
      };
      return await apiresponse(true, msg, 201, result);
    }
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const orderLifeCycle = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    let studentOrders = await inventoryStudentOrderMaster.find({
      instituteId: instituteId
    });
    const orderStatusCounts = await inventoryStudentOrderMaster.aggregate([
      { $unwind: '$orderStatusWeb' },
      {
        $match: {
          'orderStatusWeb.status': {
            $in: ['Awaiting Pickup', 'Item Picked up', 'Rejected']
          },
          itemFrom: 'ITEM_MASTER',
          instituteId: instituteId // Replace with your actual instituteId
        }
      },
      {
        $project: {
          statuses: ['Awaiting Pickup', 'Item Picked up', 'Rejected'],
          orderStatusWeb: 1
        }
      },
      { $unwind: '$statuses' },
      {
        $group: {
          _id: '$statuses',
          count: {
            $sum: {
              $cond: [{ $eq: ['$orderStatusWeb.status', '$statuses'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    const exchangeStatusCounts = await inventoryStudentOrderMaster.aggregate([
      { $unwind: '$exchangeData' },
      { $unwind: '$exchangeData.exchangeStatusWeb' },
      {
        $match: {
          'exchangeData.exchangeStatusWeb.status': {
            $in: ['Awaiting Pickup', 'Exchange Done', 'Exchange Rejected']
          },
          itemFrom: 'ITEM_MASTER',
          instituteId: instituteId
        }
      },
      {
        $group: {
          _id: '$exchangeData.exchangeStatusWeb.status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: '$count',
          _id: 0
        }
      },
      {
        $facet: {
          AwaitingPickup: [{ $match: { status: 'Awaiting Pickup' } }],
          ExchangeDone: [{ $match: { status: 'Exchange Done' } }],
          ExchangeRejected: [{ $match: { status: 'Exchange Rejected' } }]
        }
      },
      {
        $project: {
          counts: {
            $concatArrays: [
              '$AwaitingPickup',
              '$ExchangeDone',
              '$ExchangeRejected'
            ]
          }
        }
      },
      {
        $set: {
          counts: {
            $map: {
              input: [
                'Exchange Awaiting Pickup',
                'Exchange Done',
                'Exchange Rejected'
              ],
              as: 'status',
              in: {
                count: {
                  $ifNull: [
                    {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$counts',
                            as: 'c',
                            cond: { $eq: ['$$c.status', '$$status'] }
                          }
                        },
                        0
                      ]
                    },
                    0
                  ]
                },
                status: '$$status'
              }
            }
          }
        }
      }
    ]);
    const orderStatusCountsStaff = await inventoryStaffOrderMaster.aggregate([
      { $unwind: '$orderStatusWeb' },
      {
        $match: {
          'orderStatusWeb.status': {
            $in: ['Awaiting Pickup', 'Item Picked up', 'Rejected']
          },
          instituteId: instituteId // Replace with your actual instituteId
        }
      },
      {
        $project: {
          statuses: ['Awaiting Pickup', 'Item Picked up', 'Rejected'],
          orderStatusWeb: 1
        }
      },
      { $unwind: '$statuses' },
      {
        $group: {
          _id: '$statuses',
          count: {
            $sum: {
              $cond: [{ $eq: ['$orderStatusWeb.status', '$statuses'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    const exchangeStatusCountsStaff = await inventoryStaffOrderMaster.aggregate(
      [
        { $unwind: '$exchangeData' },
        { $unwind: '$exchangeData.exchangeStatusWeb' },
        {
          $match: {
            'exchangeData.exchangeStatusWeb.status': {
              $in: ['Awaiting Pickup', 'Exchange Done', 'Exchange Rejected']
            },
            instituteId: instituteId
          }
        },
        {
          $group: {
            _id: '$exchangeData.exchangeStatusWeb.status',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            status: '$_id',
            count: '$count',
            _id: 0
          }
        },
        {
          $facet: {
            AwaitingPickup: [{ $match: { status: 'Awaiting Pickup' } }],
            ExchangeDone: [{ $match: { status: 'Exchange Done' } }],
            ExchangeRejected: [{ $match: { status: 'Exchange Rejected' } }]
          }
        },
        {
          $project: {
            counts: {
              $concatArrays: [
                '$AwaitingPickup',
                '$ExchangeDone',
                '$ExchangeRejected'
              ]
            }
          }
        },
        {
          $set: {
            counts: {
              $map: {
                input: [
                  'Exchange Awaiting Pickup',
                  'Exchange Done',
                  'Exchange Rejected'
                ],
                as: 'status',
                in: {
                  count: {
                    $ifNull: [
                      {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$counts',
                              as: 'c',
                              cond: { $eq: ['$$c.status', '$$status'] }
                            }
                          },
                          0
                        ]
                      },
                      0
                    ]
                  },
                  status: '$$status'
                }
              }
            }
          }
        }
      ]
    );
    const combinedArray = orderStatusCounts.map(
      ({ count: count1, status: status1 }) => {
        const matchingItem = orderStatusCountsStaff.find(
          ({ status: status2 }) => status1 === status2
        );
        const count2 = matchingItem ? matchingItem.count : 0;
        return {
          count: count1 + count2,
          status: status1
        };
      }
    );
    const combinedArray2 = exchangeStatusCounts[0].counts.map(
      ({ count: count1, status: status1 }) => {
        const matchingItem = exchangeStatusCountsStaff[0].counts.find(
          ({ status: status2 }) => status1 === status2
        );
        const count2 = matchingItem ? matchingItem.count : 0;
        return {
          count: count1 + count2,
          status: status1
        };
      }
    );
    let outputObject = [...combinedArray, ...combinedArray2];
    return await apiresponse(true, 'DATA FOUND!', 201, outputObject);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const orderDetailsTimewise = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const body = req.body;
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

    let matchCondition = {};
    if (body.dateChoice == 'thisMonth') {
      matchCondition = {
        orderDate: {
          $gte: new Date(currentYear, currentMonth - 1, 1),
          $lt: new Date(currentYear, currentMonth, 1)
        }
      };
    } else if (body.dateChoice == 'previousMonth') {
      matchCondition = {
        orderDate: {
          $gte: new Date(currentYear, currentMonth - 2, 1),
          $lt: new Date(currentYear, currentMonth - 1, 1)
        }
      };
    } else if (body.dateChoice == 'thisWeek') {
      matchCondition = {
        orderDate: {
          $gte: new Date(currentYear, currentMonth - 2, 1),
          $lt: new Date(currentYear, currentMonth - 1, 1)
        }
      };
    } else if (body.dateChoice == 'previousWeek') {
      matchCondition = {
        orderDate: {
          $gte: new Date(currentYear, currentMonth - 2, 1),
          $lt: new Date(currentYear, currentMonth - 1, 1)
        }
      };
    } else if (body.dateChoice == 'thisQuater') {
      matchCondition = {
        orderDate: {
          $gte: new Date(currentYear, (currentQuarter - 1) * 3, 1),
          $lt: new Date(currentYear, currentQuarter * 3, 1)
        }
      };
    } else if (body.dateChoice == 'previousQuater') {
      matchCondition = {
        orderDate: {
          $gte: new Date(currentYear, (currentQuarter - 2) * 3, 1),
          $lt: new Date(currentYear, (currentQuarter - 1) * 3, 1)
        }
      };
    } else if (body.dateChoice == 'thisYear') {
      matchCondition = {
        orderDate: {
          $gte: new Date(currentYear, 0, 1), // Start of this year
          $lt: new Date(currentYear + 1, 0, 1) // Start of next year
        }
      };
    }

    const aggregationPipeline = [
      {
        $match: {
          orderDate: {
            $gte: new Date(currentYear, currentMonth - 1, 1), // Start of this month
            $lt: new Date(currentYear, currentMonth, 1) // Start of next month
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%d/%m/%Y', date: '$orderDate' } },
          totalAmount: { $sum: '$orderedItemPrice' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ];

    const result = await inventoryStudentOrderMaster.aggregate(
      aggregationPipeline
    );
    // const startOfMonth = new Date(2024, 1, 1); // Change the year and month accordingly
    // const endOfMonth = new Date(2024, 1, 29); // Change the year and month accordingly

    // const aggregationPipeline = [
    //   {
    //     $match: {
    //       orderDate: {
    //         $gte: startOfMonth,
    //         $lt: endOfMonth
    //       }
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: { $dayOfMonth: "$orderDate" },
    //       totalOrderedItemPrice: { $sum: "$orderedItemPrice" }
    //     }
    //   },
    //   {
    //     $sort: { _id: 1 } // Sort by day of the month if needed
    //   }
    // ];
    // const result = await inventoryStudentOrderMaster.aggregate(aggregationPipeline);
    return await apiresponse(true, 'DATA FOUND!', 201, result);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

export default {
  getTotalCountForDashboardService,
  getItemDetailsChartService,
  getViewDataForLowStockItemService,
  orderLifeCycle,
  orderDetailsTimewise
};
