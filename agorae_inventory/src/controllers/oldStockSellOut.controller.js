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

/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */

export const addItemToOldStockMaster = async (req, res, next) => {
  try {
    const data = await oldStockSellOutMaster.addItemToOldStockMasterService(
      req,
      res
    );
    // console.log(data);
    res.status(HttpStatus.OK).json({
      success: data.success,
      code: data.code,
      data: data.data,
      message: data.message
    });
  } catch (error) {
    next(error);
  }
};

export const getOldStockListing = async (req, res, next) => {
  try {
    const data = await oldStockSellOutMaster.getOldStockListingService(
      req,
      res
    );
    // console.log(data);
    res.status(HttpStatus.OK).json({
      success: data.success,
      code: data.code,
      data: data.data,
      message: data.message
    });
  } catch (error) {
    next(error);
  }
};

export const editItemToOldStockMaster = async (req, res, next) => {
  try {
    const data = await oldStockSellOutMaster.editItemToOldStockMasterService(
      req,
      res
    );
    res.status(HttpStatus.OK).json({
      success: data.success,
      code: data.code,
      data: data.data,
      message: data.message
    });
  } catch (error) {
    next(error);
  }
};

export const viewOldStockDetails = async (req, res, next) => {
  try {
    const data = await oldStockSellOutMaster.viewOldStockDetailsService(
      req,
      res
    );
    res.status(HttpStatus.OK).json({
      success: data.success,
      code: data.code,
      data: data.data,
      message: data.message
    });
  } catch (error) {
    next(error);
  }
};

export const downloadReceiptForOldStock = async (req, res, next) => {
  try {
    let oldStockData =
      await oldStockSellOutMaster.getReceiptDataForOldStockPdfService(req, res);

    let oldStockAllData;
    if (oldStockData.success) {
      if (oldStockData.data) {
        oldStockAllData = oldStockData.data;
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

    // const html=' <!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
    // console.log(__dirname);
    // process.exit(0);
    const __filename = fileURLToPath(import.meta.url);
    const __dirnamee = dirname(__filename);
    const directoryPath = join(
      __dirnamee,
      '../templates',
      'oldStockReceiptPdf.ejs'
    );

    ejs.renderFile(directoryPath, { oldStockAllData }, async (err, html) => {
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
