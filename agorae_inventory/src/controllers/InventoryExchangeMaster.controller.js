/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import ejs from 'ejs';
import htmlPdf from 'html-pdf';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import InventoryExchangeMaster from '../services/inventoryExchangeMaster.service.js';
import MESSAGES from '../utils/commonMessage.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import {getInstitutionDetailsForReceipt} from '../utils/commonFunction.util.js';
import {getBackEndURL} from '../utils/helperFunction.util.js';
/*
 *student exchange order section
 */
export const getStudentExchangeOrdersListing = async (req, res, next) => {
  try {
    const data = await InventoryExchangeMaster.getStudentExchangeOrdersListingService(req, res);
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

export const getStudentExchangeOrdersDetails = async (req, res, next) => {
  try {
    const data = await InventoryExchangeMaster.getStudentExchangeOrdersDetailsService(req, res);
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

export const getStudentExchangeOrdersDetailsPdf = async (req, res, next) => {
  try{
        let orderData = await InventoryExchangeMaster.getStudentExchangeOrdersDetailsPdfService(req, res);
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
        const directoryPath = join(__dirnamee, '../templates', 'studentExchangeReqAdminPdf.ejs');

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

export const confirmItemForExchangeRequest = async (req, res, next) => {
  try {
    const data = await InventoryExchangeMaster.confirmItemForExchangeRequestService(req, res);
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

export const rejectItemForExchangeRequest = async (req, res, next) => {
  try {
    const data = await InventoryExchangeMaster.rejectItemForExchangeRequestService(req, res);
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

export const assignItemExchangeManuallyToStudent = async (req, res, next) => {
  try {
    const data = await InventoryExchangeMaster.assignItemExchangeManuallyToStudentService(req, res);
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

export const getStaffExchangeOrdersListing = async (req, res, next) => {
  try {
    const data = await InventoryExchangeMaster.getStaffExchangeOrdersListingService(req, res);
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

export const getStaffExchangeOrdersDetails = async (req, res, next) => {
  try {
    const data = await InventoryExchangeMaster.getStaffExchangeOrdersDetailsService(req, res);
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

export const confirmItemForExchangeRequestOfStaff = async (req, res, next) => {
  try {
    const data = await InventoryExchangeMaster.confirmItemForExchangeRequestOfStaffService(req, res);
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

export const rejectItemForExchangeRequestOfStaff = async (req, res, next) => {
  try {
    const data = await InventoryExchangeMaster.rejectItemForExchangeRequestOfStaffService(req, res);
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

export const assignItemExchangeManuallyToStaff = async (req, res, next) => {
  try {
    const data = await InventoryExchangeMaster.assignItemExchangeManuallyToStaffService(req, res);
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

export const getStaffExchangeOrdersDetailsPdf = async (req, res, next) => {
    try{
          let orderData = await InventoryExchangeMaster.getStaffExchangeOrdersDetailsPdfPdfService(req, res);
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

        //   console.log(getBackEndURL());
        //   process.exit(0);

          // const html=' <!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
          // console.log(__dirname);
          // process.exit(0);
          const __filename = fileURLToPath(import.meta.url);
          const __dirnamee = dirname(__filename);
          const directoryPath = join(__dirnamee, '../templates', 'staffExchangeReqAdminPdf.ejs');

          ejs
          .renderFile(directoryPath,{orderDetails,url: getBackEndURL()}, async (err, html) => {
              if (err) {
                  console.log(err);
                  return res.send(
                      await apiresponse(false, MESSAGES.HTML_CREATION_ERROR_FOR_PDF, 401, {})
                  );
              } else {

                //   return res.send(html);
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


