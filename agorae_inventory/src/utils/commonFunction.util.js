/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import InventoryCategoryMaster from '../models/InventoryCategoryMaster.model.js';
import inventoryUnitMaster from '../models/inventoryUnitMaster.model.js';
import inventorySubCategoryMaster from '../models/inventorySubCategoryMaster.model.js';
import inventoryVendorMaster from '../models/inventoryVendorMaster.model.js';
import inventoryStoreMaster from '../models/inventoryStoreMaster.model.js';
import inventoryTaxRateMaster from '../models/inventoryTaxRateMaster.model.js';
import inventoryDocumentMaster from '../models/inventoryDocumentMaster.model.js';
import inventoryStudentOrderMaster from '../models/inventoryStudentOrderMaster.model.js';
import inventoryStaffOrderMaster from '../models/inventoryStaffOrderMaster.model.js';
import inventoryItemMaster from '../models/inventoryItemMaster.model.js';
import inventoryReceiptSetting from '../models/inventoryReceiptSetting.model.js';
import inventoryItemKitMaster from '../models/inventoryItemKitMaster.model.js';
import {apiresponse} from './commonResponse.util.js';
import {getInstituteDetails} from './helperFunction.util.js';

export const getCategoryIdByName = async (categoryName, instituteId) => {
  return await InventoryCategoryMaster.findOne(
    {
      $or: [
        // First condition: categoryName and instituteId
        {
          categoryName: categoryName,
          instituteId: instituteId
        },
        // Second condition: categoryName only if instituteId field doesn't exist
        {
          categoryName: categoryName,
          instituteId: { $exists: false }
        }
      ]
    },
    { _id: 1 }
  );
};

export const getSubCategoryIdByName = async (subCategoryName, instituteId) => {
  return await inventorySubCategoryMaster.findOne(
    {
      subCategoryName: subCategoryName,
      instituteId: instituteId
    },
    { _id: 1 }
  );
};

export const getUnitIdByName = async (UnitName, instituteId) => {
  return await inventoryUnitMaster.findOne(
    {
      $or: [
        // First condition: unitName and instituteId
        {
          unitName: UnitName,
          instituteId: instituteId
        },
        // Second condition: unitName only if instituteId field doesn't exist
        {
          unitName: UnitName,
          instituteId: { $exists: false }
        }
      ]
    },
    { _id: 1 }
  );
};

export const getVendorIdByName = async (vendorName, instituteId) => {
  return await inventoryVendorMaster.findOne(
    {
      vendorName: vendorName,
      instituteId: instituteId
    },
    { _id: 1 }
  );
};

export const getStoreIdByName = async (storeName, instituteId) => {
  return await inventoryStoreMaster.findOne(
    {
      storeName: storeName,
      instituteId: instituteId
    },
    { _id: 1 }
  );
};

export const getTaxIdByName = async (percentage) => {
  return await inventoryTaxRateMaster.findOne(
    {
      percentage: percentage
    },
    { _id: 1 }
  );
};

export const getTaxPercentageById = async (id) => {
  return await inventoryTaxRateMaster.findOne(
    {
      _id: id
    },
    { percentage: 1 }
  );
};

export const getCategoryNameById = async (categoryId) => {
  return await InventoryCategoryMaster.findOne(
    { _id: categoryId },
    { categoryName: 1, _id: 0 }
  );
};

export const getSubcategoryNameById = async (subcategoryId) => {
  return await inventorySubCategoryMaster.findOne(
    { _id: subcategoryId },
    { subCategoryName: 1, _id: 0 }
  );
};

export const getVendorNameById = async (vendorId) => {
  return await inventoryVendorMaster.findOne(
    { _id: vendorId },
    { vendorName: 1, _id: 0 }
  );
};

export const getUnitNameById = async (unitId) => {
  return await inventoryUnitMaster.findOne(
    { _id: unitId },
    { unitName: 1, _id: 0 }
  );
};

export const getImageFullPathById = async (docId) => {
  return await inventoryDocumentMaster.findOne(
    { _id: docId },
    { fullPath: 1, _id: 0 }
  );
};

export const generateOrderID = async (instituteId) => {
    // Get the current date in DDMMYY format
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const yy = String(today.getFullYear()).slice(-2);
    const datePart = `${dd}${mm}${yy}`; // Combine day, month, and year

    let orderFromStudent = await getDailyOrderNumberFromStudent(instituteId); // Implement this function to get the daily order number
    let orderFromStaff = await getDailyOrderNumberFromStaff(instituteId);
    let orderNumber = orderFromStudent + orderFromStaff;
    orderNumber++;
    const orderID = `ORD${datePart}${orderNumber.toString().padStart(2, '0')}`;
    return orderID;
};


/* function to get today's current no. 0f order for a institute */
export const getDailyOrderNumberFromStudent = async(instituteId)=>{
    const today = new Date(); // Get the current date and time
    today.setHours(0, 0, 0, 0); //Set time to midnight (00:00:00.000)

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999); // Set time to end of the day (23:59:59.999)

    const ordersPlacedToday = await inventoryStudentOrderMaster.countDocuments({
        instituteId:instituteId,
        orderDate: {
            $gte: today,
            $lt: endOfDay
        }
    });
    return ordersPlacedToday;
}

/* function to get today's current no. 0f order for a institute */
export const getDailyOrderNumberFromStaff = async(instituteId)=>{
  const today = new Date(); // Get the current date and time
  today.setHours(0, 0, 0, 0); //Set time to midnight (00:00:00.000)

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999); // Set time to end of the day (23:59:59.999)

  const ordersPlacedToday = await inventoryStaffOrderMaster.countDocuments({
      instituteId:instituteId,
      orderDate: {
          $gte: today,
          $lt: endOfDay
      }
  });
  return ordersPlacedToday;
}

export const getDateFormate = (dateVal) => {
    const year = dateVal.getUTCFullYear().toString().slice(2); // Extract the last two digits of the year
    const month = (dateVal.getUTCMonth() + 1).toString().padStart(2, '0'); // Month is 0-based, so add 1, and ensure it's zero-padded
    const day = dateVal.getUTCDate().toString().padStart(2, '0'); // Ensure day is zero-padded
    const formattedDate = day + '-' + month + '-' + year;
    return formattedDate;
  }

export const getCategoriesNameByIds = async (categoryIds)=>{
    let categoriesListing = await InventoryCategoryMaster.find(
        {
            _id: { $in: categoryIds }
        },
        {
            categoryName:1,
            _id:1
        }
    );
    // const resultArray = categoriesListing.map(item => item.categoryName);
    return categoriesListing;
}

export const getSubCategoryNameByIds = async (subCategoryIds)=>{
    let subCategoriesListing = await inventorySubCategoryMaster.find(
        {
            _id: { $in: subCategoryIds }
        },
        {
            subCategoryName:1,
            _id:1
        }
    );
    // const resultArray = subCategoriesListing.map(item => item.subCategoryName);
    return subCategoriesListing;
}

export const getItemNameById = async (itemId) => {
    return await inventoryItemMaster.findOne(
      { _id: itemId },
      { itemName: 1, _id: 0 }
    );
};
export const getItemNameAndImagesById = async (itemId) => {
  return await inventoryItemMaster.findOne(
    { _id: itemId },
    { itemName: 1,itemImages:1, _id: 0 }
  );
};

export const getUnitNameAndIdById = async (unitId) => {
  return await inventoryUnitMaster.findOne(
    { _id: unitId },
    { unitName: 1, _id: 1 }
  );
};

export const getCategoryNameAndIdById = async (categoryId) => {
  return await InventoryCategoryMaster.findOne(
    { _id: categoryId },
    { categoryName: 1, _id: 1 }
  );
};

export const getSubcategoryNameAndIdById = async (subcategoryId) => {
  return await inventorySubCategoryMaster.findOne(
    { _id: subcategoryId },
    { subCategoryName: 1, _id: 1 }
  );
};

export const getItemDetailsByItemId = async (itemId)=>{
  let itemDetails =await inventoryItemMaster.findOne(
    { _id: itemId },
    { itemImages: 1, itemName: 1 }
  );
  let itemImages=itemDetails.itemImages;
  let imgFinalArray = await Promise.all(itemImages.map(async(image) => {
      const { documentID, isPrimary } = image;
      return {
        path:await getImageFullPathById(documentID),
        isPrimary:isPrimary
      };
  }));
  return {
    images:imgFinalArray,
    itemName : itemDetails.itemName
  };
}

export const hasSpecialCharacters = (str)=>{
  // Define a regular expression for special characters
  const regex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;

  // Test the string against the regular expression
  return regex.test(str);
}

/* helper funtion to check the stock */
export const checkStock = async (stock, orderRequest,noOfStudent) => {
  let errorMessage = null;
  for (const item of orderRequest) {
      const matchingStockItem = stock.find(stockItem => stockItem.size === item.size);
      // console.log(matchingStockItem,'matchingStockItem');
      if (!matchingStockItem) {
          errorMessage = `${item.size} is not in stock.`;
          return await apiresponse(false, errorMessage, 201);
      }

      if (item.quantity*noOfStudent > matchingStockItem.itemQuantity.quantity) {
          errorMessage = `Not enough ${item.size} in stock.`;
          return await apiresponse(false, errorMessage, 201);
      }
  }
  return await apiresponse(true, 'Item is in stock.', 201);
}

export const getStatusRealValueByStatusCodeForStudent = (statusCode) =>{
    let statusListing = {
        'ADMIN_ISSUED_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP':'Admin-issued,Online Payment Pending,Awaiting Pickup',
        'ADMIN_ISSUED_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP':'Admin-issued,Online Payment Received,Awaiting Pickup',
        'ADMIN_ISSUED_ONLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP':'Admin-issued,Online Payment Received,Item Picked up',
        'ADMIN_ISSUED_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP':'Admin-issued,Offline Payment Pending,Awaiting Picked up',
        'ADMIN_ISSUED_OFFLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP':'Admin-issued,Offline Payment Received,Item Picked up',

        'STUDENT_ORDER_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP':'Student order,Online Payment Pending,Awaiting Pickup',
        'STUDENT_ORDER_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP':'Student order,Online Payment Received,Awaiting Pickup',
        'STUDENT_ORDER_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP':'Student order,Offline Payment Pending,Awaiting Pickup',
        'STUDENT_ORDER_REJECTED':'Student order,Rejected',
        'STUDENT_ORDER_ONLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP':'Student order,Online Payment Received,Item Picked up',
        'STUDENT_ORDER_OFFLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP':'Student order,Offline Payment Received,Item Picked up',
        'STUDENT_CANCELLED_ORDER':'Student cancelled order'
    };
    return statusListing[statusCode];
}

export const getStatusRealValueByStatusCodeForStaff = (statusCode) => {
    let statusListing = {
         'ADMIN_ISSUED_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP':'Admin-issued,Online Payment Pending,Awaiting Pickup',
        'ADMIN_ISSUED_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP':'Admin-issued,Online Payment Received,Awaiting Pickup',
        'ADMIN_ISSUED_ONLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP':'Admin-issued,Online Payment Received,Item Picked up',
        'ADMIN_ISSUED_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP':'Admin-issued,Offline Payment Pending,Awaiting Picked up',
        'ADMIN_ISSUED_OFFLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP':'Admin-issued,Offline Payment Received,Item Picked up',

        'STAFF_ORDER_ONLINE_PAYMENT_PENDING_AWAITING_PICKUP':'Staff order,Online Payment Pending,Awaiting Pickup',
        'STAFF_ORDER_ONLINE_PAYMENT_RECEIVED_AWAITING_PICKUP':'Staff order,Online Payment Received,Awaiting Pickup',
        'STAFF_ORDER_OFFLINE_PAYMENT_PENDING_AWAITING_PICKUP':'Staff order,Offline Payment Pending,Awaiting Pickup',
        'STAFF_ORDER_REJECTED':'Staff order,Rejected',
        'STAFF_ORDER_ONLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP':'Staff order,Online Payment Received,Item Picked up',
        'STAFF_ORDER_OFFLINE_PAYMENT_RECEIVED_ITEM_PICKEDUP':'Staff order,Offline Payment Received,Item Picked up',
        'STAFF_CANCELLED_ORDER':'Staff cancelled order'
    }
    return statusListing[statusCode];
}

export const getItemNameAndSizesById = async (itemId) => {
  return await inventoryItemMaster.findOne(
    { _id: itemId },
    { itemName: 1, itemSizes: 1 }
  );
};

export const getInstitutionDetailsForReceipt = async (req) => {
  try {
    const instituteId = req.authData.data.instituteId;
    const instituteName = req.institutionData.data.institutionName;

    let inventoryReceiptSettingDetails = await inventoryReceiptSetting.findOne({instituteId:instituteId});
    if(!inventoryReceiptSettingDetails){
      return await apiresponse(false, 'Please add receipt setting before generating invoice.', 201);
    }

    let institutionData = {
      instituteName:instituteName,
      instituteCode:inventoryReceiptSettingDetails.instituteCode,
      year:inventoryReceiptSettingDetails.year,
      transactionNumber:inventoryReceiptSettingDetails.transactionNumber,
      logo:inventoryReceiptSettingDetails.logo ? await getImageFullPathById(inventoryReceiptSettingDetails.logo[0].documentID) : 'NA',
      billingName:inventoryReceiptSettingDetails.billingName,
      stateId:inventoryReceiptSettingDetails.stateId,
      cityId:inventoryReceiptSettingDetails.cityId,
      address:inventoryReceiptSettingDetails.address,
      mobileNo:inventoryReceiptSettingDetails.mobileNo,
      email:inventoryReceiptSettingDetails.email,
      gstNumber:inventoryReceiptSettingDetails.gstNumber,
      note:inventoryReceiptSettingDetails.note.replace(/<[^>]*>/g, ''),
      signatureName:inventoryReceiptSettingDetails.signatureName,
      designation:inventoryReceiptSettingDetails.designation,
      signatureImages:inventoryReceiptSettingDetails.signatureImages ? await getImageFullPathById(inventoryReceiptSettingDetails.signatureImages[0].documentID) : 'NA'
    }
    return institutionData;
  } catch (error) {
    console.log(error);
  }
};

export const getItemStockById = async (itemId,orderSize) => {
  const sizesDetails = await inventoryItemMaster.findOne(
    { _id: itemId },
    { itemSizes: 1, _id: 0 }
  );
  let sizes = sizesDetails.itemSizes.find(item=> item.size === orderSize);
  return sizes ? (sizes.itemQuantity ? sizes.itemQuantity.quantity : 0): 0;
};

export const getKitStockById = async (kitId) => {
  return await inventoryItemKitMaster.findOne(
    { _id: kitId },
    { kitQuantity: 1, _id: 0 }
  );
};
