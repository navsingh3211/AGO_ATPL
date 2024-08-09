/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
import itemRequirementMaster from '../services/inventoryItemRequirement.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */

export const createInventoryItemRequirement = async (req, res, next) => {
  try {
    const data =
      await itemRequirementMaster.createInventoryItemRequirementService(
        req,
        res
      );
    // console.log(data);
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

export const editInventoryItemRequirement = async (req, res, next) => {
  try {
    const data =
      await itemRequirementMaster.editInventoryItemRequirementService(req, res);
    // console.log(data);
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

export const deleteInventoryItemRequirement = async (req, res, next) => {
  try {
    const data =
      await itemRequirementMaster.deleteInventoryItemRequirementService(
        req,
        res
      );
    // console.log(data);
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

export const getItemRequirementDetails = async (req, res, next) => {
  try {
    const data =
      await itemRequirementMaster.getInventoryItemRequirementDetailsService(
        req,
        res
      );
    // console.log(data);
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

export const getItemRequirementList = async (req, res, next) => {
  try {
    const data =
      await itemRequirementMaster.getInventoryItemRequirementListService(
        req,
        res
      );
    // console.log(data);
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

export const getApprovalToItemRequirement = async (req, res, next) => {
  try {
    const data = await itemRequirementMaster.giveApprovalToItemRequirement(
      req,
      res
    );
    // console.log(data);
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

export const uploadImage = async (req, res, next) => {
  try {
    const data = await itemRequirementMaster.uploadImageService(req, res);
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

export const transferDataFromItemMReqToItemMaster = async (req, res, next) => {
  try {
    const data =
      await itemRequirementMaster.transferDataFromItemMReqToItemMasterService(
        req,
        res
      );
    // process.exit(0);
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

export const createInventoryItemRequirementTemplateForSheetInBulkUpload =
  async (req, res, next) => {
    try {
      const data =
        await itemRequirementMaster.createInventoryItemRequirementTemplateForSheetInBulkUploadService(
          req,
          res
        );
      // process.exit(0);
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

export const downloadItemRequirementTemplateForBulkUpload = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await itemRequirementMaster.downloadItemRequirementTemplateForBulkUploadService(
        req,
        res
      );
    // process.exit(0);
    res.status(HttpStatus.OK);
  } catch (error) {
    console.log(error);
  }
};

export const validationOfitemRequirementAddedByExcel = async (
  req,
  res,
  next
) => {
  try {
    // console.log(req.body);
    const data =
      await itemRequirementMaster.validationOfitemRequirementAddedByExcelService(
        req,
        res
      );
    // console.log(data, 'abhiandan');
    // process.exit(0);
    res.status(data.code).json({
      success: data.success,
      code: data.code,
      data: data.data,
      message: data.message
    });
  } catch (error) {
    console.log(error);
  }
};

export const uploadExcelSheetForBulkUploadOfItemRequirement = async (
  req,
  res,
  next
) => {
  try {
    // console.log(req.body);
    const data =
      await itemRequirementMaster.uploadExcelSheetForBulkUploadOfItemRequirementService(
        req,
        res
      );
    // console.log(data, 'abhiandan');
    // process.exit(0);
    res.status(data.code).json({
      success: data.success,
      code: data.code,
      data: data.data,
      message: data.message
    });
  } catch (error) {
    console.log(error);
  }
};

export const getItemRequirementListingForBulkEmptyUpload = async (
  req,
  res,
  next
) => {
  try {
    const data =
      await itemRequirementMaster.getItemRequirementListingForBulkEmptyUploadService(
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
    console.log(error);
  }
};

export const giveApprovalToItemrequirementRequest = async (req, res, next) => {
  try {
    const data =
      await itemRequirementMaster.giveApprovalToItemrequirementRequestService(
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
    console.log(error);
  }
};
