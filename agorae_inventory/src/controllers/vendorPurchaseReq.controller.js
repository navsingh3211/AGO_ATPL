/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
import oldStockSellOutMaster from '../services/oldStockSellOut.service.js';
import ejs from 'ejs';
import htmlPdf from 'html-pdf';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import MESSAGES from '../utils/commonMessage.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import verdorPurchaseReqMaster from '../services/vendorPurchaseReq.service.js';

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */

export const editVendorPurchaseReq = async (req, res, next) => {
  try {
    const data = await verdorPurchaseReqMaster.editVendorPurchaseReqService(
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

export const getVendorReqListing = async (req, res, next) => {
  try {
    const data = await verdorPurchaseReqMaster.getVendorReqListingService(
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

export const viewVendorRequest = async (req, res, next) => {
  try {
    const data = await verdorPurchaseReqMaster.viewVendorRequestService(
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

export const downloadVendorPurchaseReceipt = async (req, res, next) => {
  try {
    let purchaseData =
      await verdorPurchaseReqMaster.downloadVendorPurchaseReceiptService(
        req,
        res
      );
    let purchaseAllData;
    if (purchaseData.success) {
      if (purchaseData.data) {
        purchaseAllData = purchaseData.data;
      } else {
        return res.send(
          await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null)
        );
      }
    } else {
      return res.send(
        await apiresponse(false, MESSAGES.GENERAL_ERROR, 201, null)
      );
    }
    // console.log(purchaseAllData, 'purchaseAllData');
    // process.exit(0);

    // const html=' <!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
    // console.log(__dirname);
    // process.exit(0);
    const __filename = fileURLToPath(import.meta.url);
    const __dirnamee = dirname(__filename);
    const directoryPath = join(
      __dirnamee,
      '../templates',
      'vendorPurchaseReqPdf.ejs'
    );

    ejs.renderFile(directoryPath, { purchaseAllData }, async (err, html) => {
      if (err) {
        console.log(err);
        return res.send(
          await apiresponse(
            false,
            MESSAGES.HTML_CREATION_ERROR_FOR_PDF,
            401,
            {}
          )
        );
      } else {
        // return res.send(html);
        // Generate PDF
        let options = {
          format: 'A4', // allowed units: A3, A4, A5, Legal, Letter, Tabloid
          orientation: 'portrait', // portrait or landscape
          childProcessOptions: {
            env: {
              OPENSSL_CONF: '/dev/null'
            }
          }
        };

        htmlPdf.create(html, options).toStream(async (err, stream) => {
          // console.log(html);
          if (err) {
            console.log('ram if11', err);
            return res.send(
              await apiresponse(
                false,
                MESSAGES.HTML_CREATION_ERROR_FOR_PDF,
                401,
                {}
              )
            );
          } else {
            // console.log(html);
            res.set('Content-type', 'application/pdf');
            stream.pipe(res);
          }
        });
      }
    });
  } catch (error) {
    next(error);
  }
};
