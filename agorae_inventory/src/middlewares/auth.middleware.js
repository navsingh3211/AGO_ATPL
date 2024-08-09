/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */

import HttpStatus from 'http-status-codes';
import jwt from 'jsonwebtoken';
import getTokenDetails from '../utils/jwt.util.js';
import axios from 'axios';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';
import CONSTANTS from '../utils/constants.util.js';

/**
 * Middleware to authenticate if user has a valid Authorization token
 * Authorization: Bearer <token>
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */

export const checkSeekerHaveApprovalRight = async (req, res, next) => {
  try {
    let token = req.header('Authorization');

    let institionData;
    getTokenDetails(token, async (err, data) => {
      if (err) {
        console.log(err);
        return {
          success: false,
          message: 'Invalid Token!',
          code: 404,
          data: {}
        };
      }
      institionData = data;
    });
    const staffId = institionData.data.staffId;

    const BE_URL = process.env.AGORAE_BE_URL;
    const apiUrl =
      BE_URL +
      `/inventory/staff/check-that-staff-have-approval-right-or-not/${staffId}`;

    const config = {
      method: 'get',
      url: apiUrl,
      headers: {
        Authorization: token
      }
    };
    let responseDetails;
    await axios(config)
      .then((response) => {
        // Handle the response data
        responseDetails = response.data;
        // console.log('Response:', response.data);
      })
      .catch((error) => {
        // Handle errors
        if (error.response) {
          console.error('Error Status:', error.response.status);
          console.error('Error Data:', error.response.data);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error:', error.message);
        }
      });

    if (responseDetails.success && responseDetails.data.hasAccessOfApprovalRight){
      // console.log(responseDetails.data.staffDetails);
      req.staffName = responseDetails.data.staffDetails.firstName + ' ' + responseDetails.data.staffDetails.lastName
      // console.log(staffName);
      next();
    } else if (responseDetails.success === true && responseDetails.data.hasAccessOfApprovalRight===false){
         throw {
          code: HttpStatus.BAD_REQUEST,
          message: 'Staff have not any Inventory approval right !'
        };
    }
    // console.log(responseDetails.data.hasAccessOfApprovalRight,"ram");
    // process.exit(0);

  } catch (error) {
    next(error);
  }
};

export const isAdmin = async (req, res, next) => {
  let userData = req.authData.data;
  if (userData.userTypes === CONSTANTS.USER_TYPES.ADMIN || userData.userTypes === CONSTANTS.USER_TYPES.STAFF) {
    next();
  } else {
    return res.status(401).json(await apiresponse(false, MESSAGES.UNAUTHORISED,401));
  }
};

export const isStaff = async (req, res, next) => {
  let userData = req.authData.data;
  if (userData.userTypes === CONSTANTS.USER_TYPES.STAFF) {
    next();
  } else {
    return res.status(401).json(await apiresponse(false, MESSAGES.UNAUTHORISED,401));
  }
};

export const isApplication = async (req, res, next) => {
  let userData = req.authData.data;
  if (userData.userTypes === CONSTANTS.USER_TYPES.STAFF || userData.userTypes === CONSTANTS.USER_TYPES.STUDENT) {
    next();
  } else {
    return res.status(401).json(await apiresponse(false, MESSAGES.UNAUTHORISED,401));
  }
};
