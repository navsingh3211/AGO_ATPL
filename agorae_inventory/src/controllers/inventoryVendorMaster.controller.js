/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable max-len */
import HttpStatus from 'http-status-codes';
// import { createInventoryCategoryService } from '../services/inventoryCategory.service.js';
import inventoryVendorMaster from '../services/inventoryVendor.service.js';

import ejs from 'ejs';
// import path from 'path';
import htmlPdf from 'html-pdf';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// import fs from 'fs';
/**
 * Controller to get all users available
 * @param  {object} req - request object
 * @param {object} res - response object
 * @param {Function} next
 */
// console.log(CategotyMaster);
export const createInventoryVendor = async (req, res, next) => {
  try {
    const data = await inventoryVendorMaster.createInventoryVendorService(req, res);
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

export const editInventoryVendor = async (req, res, next) => {
  try {
    const data = await inventoryVendorMaster.updateInventoryVendorService(req, res);
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

export const vendorDetails=async (req, res, next) => {
    try {
      const data = await inventoryVendorMaster.getVendorDetails(req, res);
    //   console.log(data,'sitaraman');
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

export const editVendorStatus=async(req,res,next)=>{
    try {
        const data = await inventoryVendorMaster.updateVendorStatus(req, res);
      //   console.log(data,'sitaraman');
        res.status(HttpStatus.OK).json({
          success: data.success,
          code: data.code,
          data: data.data,
          message: data.message
        });
      } catch (error) {
        next(error);
      }
}

export const getVendorListing=async(req,res,next)=>{
    try {
        const data = await inventoryVendorMaster.getVendorList(req, res);
      //   console.log(data,'sitaraman');
        res.status(HttpStatus.OK).json({
          success: data.success,
          code: data.code,
          data: data.data,
          message: data.message
        });
      } catch (error) {
        next(error);
      }
}

export const getVendorDetailsPdf=async(req,res)=>{
    try{

        const vendorDetails = await inventoryVendorMaster.getVendorPdf(req, res);
        // console.log(vendorDetails);
        // const html=' <!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
        // console.log(__dirname);
        // process.exit(0);
        const __filename = fileURLToPath(import.meta.url);
        const __dirnamee = dirname(__filename);
        // const directoryPath = path.join(__dirname, '../public/itemRequirement/'); //changes recently
        const directoryPath = join(__dirnamee, '../templates', 'vendorDetailsPdf.ejs'); // for staging

        ejs
        .renderFile(directoryPath,{vendorDetails}, async (err, html) => {
            if (err) {
                return {
                    success: false,
                    message: 'Something went wrong with HTML creation.',
                    code: 401,
                    data: {}
                };
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
                        res.status(HttpStatus.OK).json({
                            success: false,
                            message: 'Something went wrong with HTML creation.',
                            code: 401,
                            data: {}
                        });

                    } else {
                        // console.log(html);
                        res.set('Content-type', 'application/pdf');
                        stream.pipe(res);
                    }
                });
            }
        });
    }catch(err){
        console.log(err);
    }
}

export const getVendorListingForDropDown = async(req,res,next)=>{
  try {
      const data = await inventoryVendorMaster.getVendorListingForDropDownService(req, res);
    //   console.log(data,'sitaraman');
      res.status(HttpStatus.OK).json({
        success: data.success,
        code: data.code,
        data: data.data,
        message: data.message
      });
    } catch (error) {
      next(error);
    }
}
