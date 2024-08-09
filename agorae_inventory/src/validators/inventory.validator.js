/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import Joi from '@hapi/joi';
import { apiresponse } from '../utils/commonResponse.util.js';
const options = {
  abortEarly: false, // include all errors
  allowUnknown: true, // ignore unknown props
  stripUnknown: true // remove unknown props
};

export const inventoryCategoryCreateSchemavalidator = async (
  req,
  res,
  next
) => {
  const schema = Joi.object({
    categoryName: Joi.string().label('Category Name is required').required()
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);
  // console.log(error);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.context.key] = err.context.label;
    });
    // return await apiresponse(false, errors, 400, null);
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const inventoryCategoryUpdateSchema = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().label('id is required').required(),
    categoryName: Joi.string().label('Category Name is required').required()
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);
  // console.log(value);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.context.key] = err.context.label;
    });
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const inventoryUnitCreateSchema = async (req, res, next) => {
  const schema = Joi.object({
    unitName: Joi.string().label('Unit Name is required').required()
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);

  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.context.key] = err.context.label;
    });
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const inventoryUnitUpdateSchema = async (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().label('id is required').required(),
    unitName: Joi.string().label('Unit Name is required').required()
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);
  // console.log(value);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.context.key] = err.context.label;
    });
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const inventoryVendorCreateSchema = async (req, res, next) => {
  const schema = Joi.object({
    vendorName: Joi.string().label('vendor Name is required').required(),
    contactPersonName: Joi.string()
      .label('contact Person Name is required')
      .required(),
    email: Joi.string().email().label('Kindly put valid email id').required(),
    phoneNumber: Joi.string().label('phone number is required').required(),
    address: Joi.string().allow('').optional(),
    gstNo: Joi.string().allow('').optional(),
    panNo: Joi.string().allow('').optional(),
    licenseNo: Joi.string().allow('').optional(),
    status: Joi.boolean().optional()
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);

  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.context.key] = err.context.label;
    });
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const inventoryVendorEditSchema = async (req, res, next) => {
  const schema = Joi.object({
    vendorId: Joi.string().required(),
    vendorName: Joi.string().label('vendor Name is required').required(),
    contactPersonName: Joi.string()
      .label('contact Person Name is required')
      .required(),
    email: Joi.string().email().label('Kindly put valid email id').required(),
    phoneNumber: Joi.string().label('phone number is required').required(),
    address: Joi.string().allow('').optional(),
    gstNo: Joi.string().allow('').optional(),
    panNo: Joi.string().allow('').optional(),
    licenseNo: Joi.string().allow('').optional(),
    status: Joi.boolean().optional()
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);

  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.context.key] = err.context.label;
    });
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const inventoryCreateStoreSchema = async (req, res, next) => {
  const schema = Joi.object({
    storeName: Joi.string()
      .max(50)
      .label('Store Name is required.')
      .required()
      .messages({
        'string.max': 'Store name cannot exceed max-lenght 50'
      }),
    storeDesc: Joi.string().allow('').optional()
      .max(100)
      .messages({
        'string.max': 'Store description cannot exceed max-lenght 100'
      })
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);
  // console.log(error.details);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    // console.log(errors);
    // process.exit(0);
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const inventoryEditStoreSchema = async (req, res, next) => {
  const schema = Joi.object({
    storeId: Joi.string().required(),
    storeName: Joi.string()
      .max(50)
      .label('Store Name is required.')
      .required()
      .messages({
        'string.max': 'Store name cannot exceed max-lenght 50'
      }),
    storeDesc: Joi.string()
      .max(100)
      .label('Store Description is required.')
      .required()
      .messages({
        'string.max': 'Store description cannot exceed max-lenght 100'
      })
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);
  // console.log(error.details);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    // console.log(errors);
    // process.exit(0);
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const inventoryCreateSubCatSchema = async (req, res, next) => {
  const schema = Joi.object({
    categoryId: Joi.string().label('Category id is required.').required(),
    subCategoryName: Joi.string()
      .max(100)
      .label('Sub-category Name is required.')
      .required()
      .messages({
        'string.max': 'Sub-category Name cannot exceed max-lenght 100'
      })
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);
  // console.log(error.details);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    // console.log(errors);
    // process.exit(0);
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const inventoryUpdateSubCatSchema = async (req, res, next) => {
  const schema = Joi.object({
    subCatId: Joi.string().label('Subcat id is required.').required(),
    categoryId: Joi.string().label('Category id is required.').required(),
    subCategoryName: Joi.string()
      .max(100)
      .label('Sub-category Name is required.')
      .required()
      .messages({
        'string.max': 'Sub-category Name cannot exceed max-lenght 100'
      })
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);
  // console.log(error.details);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    // console.log(errors);
    // process.exit(0);
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const inventoryCreateItemRequirementSchema = async (req, res, next) => {
  const schema = Joi.object({
    categoryId: Joi.string().label('Category Id is required').required(),
    subCategoryId: Joi.string().label('SubCategory Id is required').required(),
    itemName: Joi.string()
      .max(100)
      .label('Item Name is required.')
      .required()
      .messages({
        'string.max': 'Item name cannot exceed max-lenght 100'
      }),
    itemSize: Joi.string().allow('').optional(),
    quantity: Joi.number().label('Quantity is required').required(),
    unit: Joi.string().label('Unit Name is required').required(),
    pricePerUnit: Joi.number().label('Price Per Unit is required').required(),
    totalPrice: Joi.number().label('Total price is required').required(),
    vendorId: Joi.string().allow(null).optional(),
    description: Joi.string()
      .max(500)
      .messages({
        'string.max': 'Description cannot exceed max-lenght 500'
      })
      .allow('')
      .optional()
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);
  // console.log(error.details);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    // console.log(errors);
    // process.exit(0);
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const inventoryEditItemRequirementSchema = async (req, res, next) => {
  const schema = Joi.object({
    itemReqId: Joi.string().label('Item Requirement Id is required').required(),
    categoryId: Joi.string().label('Category Id is required').required(),
    subCategoryId: Joi.string().label('SubCategory Id is required').required(),
    itemName: Joi.string()
      .max(100)
      .label('Item Name is required.')
      .required()
      .messages({
        'string.max': 'Item name cannot exceed max-lenght 100'
      }),
    itemSize: Joi.string().allow('').optional(),
    quantity: Joi.number().label('Quantity is required').required(),
    unit: Joi.string().label('Unit Name is required').required(),
    pricePerUnit: Joi.number().label('Price Per Unit is required').required(),
    totalPrice: Joi.number().label('Total price is required').required(),
    vendorId: Joi.string().allow(null).optional(),
    description: Joi.string()
      .max(500)
      .messages({
        'string.max': 'Description cannot exceed max-lenght 500'
      })
      .allow('')
      .optional()
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  // console.log(error.details);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    // console.log(errors);
    // process.exit(0);
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const orderedItemDamageMarkingValidation = async (req, res, next) => {
  const schema = Joi.object({
    itemMasterId: Joi.string().label('Item master id is required.').required(),
    damagedQuantity: Joi.number().label('Damaged quantity is required.').required(),
    reasonForDamage: Joi.string().allow('').optional(),
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);

  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.path[0]] = err.message;
    });
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const addItemInItemMasterValidation = async (req, res, next)=>{
    let body = req.body;
    if(body.itemType === 'DONATION_STOCK'){
        if(!body.donationStockDetails.donorName){
            return res.status(400).json(await apiresponse(false, 'Please provide doner name!', 400, null));
        }
    }

    switch(body.itemAvailableTo){
        case 'all':
            if(!body.pickupPeriodForStudent){
                return res.status(400).json(await apiresponse(false, 'Please provide pickup period for student!', 400, null));
            }else if(!body.pickupPeriodForStaff){
                return res.status(400).json(await apiresponse(false, 'Please provide pickup period for staff!', 400, null));
            }
            break;
        case 'student':
            if(!body.pickupPeriodForStudent){
                return res.status(400).json(await apiresponse(false, 'Please provide pickup period for student!', 400, null));
            }
            break;
        case 'staff':
            if(!body.pickupPeriodForStaff){
                return res.status(400).json(await apiresponse(false, 'Please provide pickup period for staff!', 400, null));
            }
            break;
    }

    switch(body.exchangeableItemFor){
        case 'all':
            if(!body.exchangePeriodForStudent){
                return res.status(400).json(await apiresponse(false, 'Please provide exchange period for student!', 400, null));
            }else if(!body.exchangePeriodForStaff){
                return res.status(400).json(await apiresponse(false, 'Please provide exchange period for staff!', 400, null));
            }else{
                next();
            }
            break;
        case 'student':
            if(!body.exchangePeriodForStudent){
                return res.status(400).json(await apiresponse(false, 'Please provide exchange period for student!', 400, null));
            }else{
                next();
            }
            break;
        case 'staff':
            if(!body.exchangePeriodForStaff){
                return res.status(400).json(await apiresponse(false, 'Please provide exchange period for staff!', 400, null));
            }else{
                next();
            }
            break;
        case 'none':
            next();
            break;
        default:
            next();
    }
}

export const inventoryReceiptSettingValidation = async (req, res, next) => {
  const schema = Joi.object({
    instituteCode:Joi.string().label('Institute Code is required').required(),
    year:Joi.number().label('Year is required').required(),
    transactionNumber:Joi.string().label('Transaction Number is required').required(),
    logo:Joi.array().allow(null).optional(),
    billingName:Joi.string().label('Bill name is required').required(),
    stateId:Joi.number().label('State is required').required(),
    cityId:Joi.number().label('City is required').required(),
    address:Joi.string().label('Address is required').required(),
    mobileNo:Joi.string().allow('').optional(),
    email:Joi.string().allow('').optional(),
    gstNumber:Joi.string().allow('').optional(),
    note:Joi.string().allow('').optional(),
    signatureName:Joi.string().allow('').optional(),
    designation:Joi.string().allow('').optional(),
    signatureImages:Joi.array().allow(null).optional(),
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);
  // console.log(value);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.context.key] = err.context.label;
    });
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const inventoryEditReceiptSettingValidation = async (req, res, next) => {
  const schema = Joi.object({
    receiptId:Joi.string().label('Receipt Id is required').required(),
    instituteCode:Joi.string().label('Institute Code is required').required(),
    year:Joi.number().label('Year is required').required(),
    transactionNumber:Joi.string().label('Transaction Number is required').required(),
    logo:Joi.array().allow(null).optional(),
    billingName:Joi.string().label('Bill name is required').required(),
    stateId:Joi.number().label('State is required').required(),
    cityId:Joi.number().label('City is required').required(),
    address:Joi.string().label('Address is required').required(),
    mobileNo:Joi.string().allow('').optional(),
    email:Joi.string().allow('').optional(),
    gstNumber:Joi.string().allow('').optional(),
    note:Joi.string().allow('').optional(),
    signatureName:Joi.string().allow('').optional(),
    designation:Joi.string().allow('').optional(),
    signatureImages:Joi.array().allow(null).optional(),
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);
  // console.log(value);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.context.key] = err.context.label;
    });
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};

export const addOrRemoveWishlistValidation = async (req, res, next) => {
  const schema = Joi.object({
    itemId:Joi.string().label('ItemId is required').required(),
    itemFrom:Joi.string().label('itemFrom is required').required(),
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);
  // console.log(value);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.context.key] = err.context.label;
    });
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};


export const addToCartValidation = async (req, res, next) => {
  const schema = Joi.object({
    itemId:Joi.string().label('ItemId is required').required(),
    itemName:Joi.string().label('itemName is required').required(),
    price:Joi.number().label('price is required').required(),
    size:Joi.any().label('size is required'),
    quantity:Joi.number().label('quantity is required').required(),
    pickupPeriod:Joi.number().label('pickupPeriod is required').required(),
    itemFrom:Joi.string().label('itemFrom is required').required(),
  });

  // validate request body against schema
  const { error, value } = schema.validate(req.body, options);
  // console.log(value);
  if (error) {
    let errors = {};
    error.details.forEach((err) => {
      errors[err.context.key] = err.context.label;
    });
    return res.status(400).json(await apiresponse(false, errors, 400, null));
  } else {
    req.body = value;
    next();
  }
};
