/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
import orderMaster from '../services/inventoryOrderMaster.service.js';
import ejs from 'ejs';
import htmlPdf from 'html-pdf';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import MESSAGES from '../utils/commonMessage.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import {getInstitutionDetailsForReceipt} from '../utils/commonFunction.util.js';

/*
 *student order section
 */
export const getStudentOrdersListing = async (req, res, next) => {
  try {
    const data = await orderMaster.getStudentOrdersListingService(req, res);

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

export const getStudentOrdersListingForDropDown = async (req, res, next) => {
  try {
    const data = await orderMaster.getStudentOrdersListingForDropDownService(req, res);

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

export const conformPickupForStudentAfterPayment = async (req, res, next) => {
  try {
    const data = await orderMaster.conformPickupForStudentAfterPaymentService(
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

export const rejectStudentOrder = async (req, res, next) => {
  try {
    const data = await orderMaster.rejectStudentOrderService(req, res);

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

export const getItemOrderDetails = async (req, res, next) => {
  try {
    const data = await orderMaster.getItemOrderDetailService(req, res);

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

export const markAnItemAsDamageItemForStudent = async (req, res, next) => {
  try {
    const data = await orderMaster.markAnItemAsDamageItemForStudentService(req, res);

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

export const assignItemToStudentManually = async (req, res, next) => {
  try {
    const data = await orderMaster.assignItemToStudentManuallyService(req, res);
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

export const receiptPdfOfItemForStudent = async (req, res, next) => {
    try{

        let orderData = await orderMaster.receiptPdfOfItemForStudentService(req, res);
        if(!orderData){
          return res.send(
              await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null)
          );
        }

        const instituteData = await getInstitutionDetailsForReceipt(req);
        if(!instituteData){
          return res.send(
              await apiresponse(false, 'Institution data missing !', 201, null)
          );
        }
        let orderDetails = {instituteData,...orderData}
        // console.log(orderDetails);
        // process.exit(0);
        // const html=' <!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
        // console.log(__dirname);
        // process.exit(0);
        const __filename = fileURLToPath(import.meta.url);
        const __dirnamee = dirname(__filename);
        const directoryPath = join(__dirnamee, '../templates', 'studentOrderReceiptAdminPdf.ejs');

        ejs
        .renderFile(directoryPath,{orderDetails}, async (err, html) => {
            if (err) {
                console.log(err);
                return res.send(
                    await apiresponse(false, MESSAGES.HTML_CREATION_ERROR_FOR_PDF, 401, {})
                );
            } else {

                // return res.send(html);
                // Generate PDF
                let options = {
                  format: 'A4', // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                  orientation: 'portrait', // portrait or landscape
                  childProcessOptions: {
                      env: {
                        OPENSSL_CONF: '/dev/null',
                      },
                  }
                };

                htmlPdf.create(html, options).toStream(async (err, stream) => {
                    // console.log(html);
                    if (err) {
                        console.log('ram if11',err);
                        return res.send(
                            await apiresponse(false, MESSAGES.HTML_CREATION_ERROR_FOR_PDF, 401, {})
                        );
                    } else {
                        // console.log(html);
                        res.set('Content-type', 'application/pdf');
                        stream.pipe(res);
                    }
                });
            }
        });
    }catch(error){
        next(error);
    }
};

export const getStatusListingOfStudentForFilteration = async (req, res, next) => {
  try {
    const data = await orderMaster.getStatusListingOfStudentForFilterationService(req, res);
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

/*
 *staff order section
 */
export const getStaffOrdersListing = async (req, res, next) => {
  try {
    const data = await orderMaster.getStaffOrdersListingService(req, res);
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

export const getStaffOrdersListingForDropDown = async (req, res, next) => {
  try {
    const data = await orderMaster.getStaffOrdersListingForDropDownService(req, res);

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

export const conformPickupForStaffAfterPayment = async (req, res, next) => {
  try {
    const data = await orderMaster.conformPickupForStaffAfterPaymentService(req, res);
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

export const rejectStaffOrder = async (req, res, next) => {
  try {
    const data = await orderMaster.rejectStaffOrderService(req, res);
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

export const getItemOrderDetailsForStaff = async (req, res, next) => {
  try {
    const data = await orderMaster.getItemOrderDetailsForStaffService(req, res);
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

export const markAnItemAsDamageItemForStaff = async (req, res, next) => {
  try {
    const data = await orderMaster.markAnItemAsDamageItemForStaffService(req, res);
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

export const assignItemToStaffManually = async (req, res, next) => {
  try {
    const data = await orderMaster.assignItemToStaffManuallyService(req, res);
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

export const receiptPdfOfItemForStaff = async (req, res, next) => {
    try{

        const orderData = await orderMaster.receiptPdfOfItemForStaffService(req, res);

        if(!orderData){
            return res.send(
                await apiresponse(true, MESSAGES.NO_DATA_FOUND, 201, null)
            );
        }

        const instituteData = await getInstitutionDetailsForReceipt(req);
        if(!instituteData){
          return res.send(
              await apiresponse(false, 'Institution data missing !', 201, null)
          );
        }
        let orderDetails = {instituteData,...orderData}
        // console.log(orderDetails);
        // process.exit(0);
        // const html=' <!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
        // console.log(__dirname);
        // process.exit(0);
        const __filename = fileURLToPath(import.meta.url);
        const __dirnamee = dirname(__filename);
        const directoryPath = join(__dirnamee, '../templates', 'staffOrderReceiptAdminPdf.ejs');

        ejs
        .renderFile(directoryPath,{orderDetails}, async (err, html) => {
            if (err) {
                console.log(err);
                return res.send(
                    await apiresponse(false, MESSAGES.HTML_CREATION_ERROR_FOR_PDF, 401, {})
                );
            } else {

                // return res.send(html);
                // Generate PDF
                let options = {
                format: 'A4', // allowed units: A3, A4, A5, Legal, Letter, Tabloid
                orientation: 'portrait', // portrait or landscape
                childProcessOptions: {
                    env: {
                    OPENSSL_CONF: '/dev/null',
                    },
                }
                };

                htmlPdf.create(html, options).toStream(async (err, stream) => {
                    // console.log(html);
                    if (err) {
                        console.log('ram if11',err);
                        return res.send(
                            await apiresponse(false, MESSAGES.HTML_CREATION_ERROR_FOR_PDF, 401, {})
                        );
                    } else {
                        // console.log(html);
                        res.set('Content-type', 'application/pdf');
                        stream.pipe(res);
                    }
                });
            }
        });
    }catch(error){
        next(error);
    }
};

export const getStatusListingOfStaffForFilteration = async (req, res, next) => {
  try {
    const data = await orderMaster.getStatusListingOfStaffForFilterationService(req, res);
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


