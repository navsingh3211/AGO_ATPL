/* eslint-disable max-len */
import inventoryDamagedMaster from '../services/inventoryDamageMaster.service.js';

export const getDamageItemMasterListing = async (req, res, next) => {
  try {
    const data = await inventoryDamagedMaster.getDamageItemMasterListingService(
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

export const deleteDamageItem = async (req, res, next) => {
  try {
    const data = await inventoryDamagedMaster.deleteDamageItemService(req, res);
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

export const damageItemDetails = async (req, res, next) => {
  try {
    const data = await inventoryDamagedMaster.damageItemxDetailsService(
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
