/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */

import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';
import inventoryReceiptSetting from '../models/inventoryReceiptSetting.model.js';
import {getStaffDetails} from '../utils/helperFunction.util.js';

const createInventoryReceiptSettingService = async (req, res) => {
  const instituteId = req.authData.data.instituteId;
  const staffId = req.authData.data.staffId;
  try {
    let body = req.body;
    let response;
    let message;

    let receiptData = await inventoryReceiptSetting.findOne(
      {
        instituteId,
        instituteCode: body.instituteCode,
        status: true
      },
      {
        _id: 1
      }
    );
    if (receiptData) {
      return await apiresponse(true, MESSAGES.INVENTORY.RECEIPT_SETTING.INSTITUTE_CODE_ALREADY_EXIT, 401, null);
    }

    response = await inventoryReceiptSetting.create({
      instituteId,
      lastEditedBy: staffId,
      ...body
    });
    message = MESSAGES.INVENTORY.RECEIPT_SETTING.RECEIPT_ADDED_SUCCESS;

    return await apiresponse(true, message, 201, response);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const getWhoHasLastEditedReceiptService = async (req, res) => {
  const instituteId = req.authData.data.instituteId;
  let token = req.headers['authorization'];
  try {
    let receiptData = await inventoryReceiptSetting.findOne(
      {
        instituteId,
        status: true
      },
      {
        _id: 1,
        lastEditedBy:1,
        updatedAt:1
      }
    );

    if(receiptData){
      let lastEditedDetails = await getStaffDetails(token,receiptData.lastEditedBy);

      let response = {
        lastUpdatedTime:receiptData.updatedAt,
        staffDetails:lastEditedDetails
      }

      return await apiresponse(true, MESSAGES.DATA_FOUND, 201, response);
    }else{
      return await apiresponse(false, MESSAGES.INVENTORY.RECEIPT_SETTING.NO_RECEIPT_FOUND, 201, null);
    }

  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const editInventoryReceiptSettingService = async (req, res) => {
  const instituteId = req.authData.data.instituteId;
  const staffId = req.authData.data.staffId;
  try {
    let {receiptId,...body} = req.body;
    let response;
    let message;

    let receiptData = await inventoryReceiptSetting.findOne(
      {
        _id : receiptId
      },
      {
        _id: 1
      }
    );

    if (!receiptData) {
      return await apiresponse(false, MESSAGES.INVENTORY.RECEIPT_SETTING.NO_RECEIPT_FOUND, 201, null);
    }

    let receiptInstituteCodeCheck = await inventoryReceiptSetting.findOne(
      {
        _id: {$ne:receiptId},
        instituteId,
        instituteCode: body.instituteCode,
        status: true
      },
      {
        _id: 1
      }
    );
    if (receiptInstituteCodeCheck) {
      return await apiresponse(true, MESSAGES.INVENTORY.RECEIPT_SETTING.INSTITUTE_CODE_ALREADY_EXIT, 401, null);
    }

    response = await inventoryReceiptSetting.updateOne(
      { _id: receiptId },
      {
          $set: {
              instituteId,
              lastEditedBy:staffId,
              ...body,
              updatedAt: new Date()
          }
      }
    );
    message = MESSAGES.INVENTORY.RECEIPT_SETTING.RECEIPT_UPDATE_SUCCESS;

    return await apiresponse(true, message, 201, response);
  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const getReceiptDetailsService = async (req, res) => {
  const instituteId = req.authData.data.instituteId;
  try {
    let receiptData = await inventoryReceiptSetting.findOne(
      {
        instituteId,
        status: true
      }
    );

    if(receiptData){
      return await apiresponse(true, MESSAGES.DATA_FOUND, 201, receiptData);
    }else{
      return await apiresponse(false, MESSAGES.INVENTORY.RECEIPT_SETTING.NO_RECEIPT_FOUND, 201, null);
    }

  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const checkInstitutionCodeExitService = async (req, res) =>{
  const instituteId = req.authData.data.instituteId;
  try {
    const {institutionCode} = req.params;
    let receiptData = await inventoryReceiptSetting.findOne(
      {
        instituteCode:institutionCode,
        instituteId : {
          $ne:instituteId
        } ,
        status: true
      },
      {
        instituteCode:1
      }
    );

    if(receiptData){
      return await apiresponse(false, MESSAGES.INSTITUTION_CODE_EXIT, 201, null);
    }else{
      return await apiresponse(true, MESSAGES.INVENTORY.RECEIPT_SETTING.RECEIPT_CAN_BE_ADDED, 201, null);
    }

  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
}

export default {
  createInventoryReceiptSettingService,
  getWhoHasLastEditedReceiptService,
  editInventoryReceiptSettingService,
  getReceiptDetailsService,
  checkInstitutionCodeExitService
};
