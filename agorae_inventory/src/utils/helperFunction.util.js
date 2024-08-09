/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
import inventoryTaxRateMaster from '../models/inventoryTaxRateMaster.model.js';
import HttpStatus from 'http-status-codes';
import dotenv from 'dotenv';
dotenv.config('../src/.env');
import axios from 'axios';

export const getTaxListing = async (req, res, next) => {
  try {
    let taxListing = await inventoryTaxRateMaster.find();
    res.status(HttpStatus.OK).json({
      success: true,
      code: 201,
      data: taxListing,
      message: 'Tax listing data found!'
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentNameClassNameByStudentIdClassIdBatchId = async (
  token,
  studentId,
  classId,
  batchId
) => {
  try {
    let studentDetails;
    const postData = {
      studentId: studentId,
      classId: classId,
      batchId: batchId
    };
    const BE_URL = process.env.AGORAE_BE_URL;
    const apiUrl =
      BE_URL + '/inventory/student/get-student-details-by-studentId-classId';

    await axios
      .post(apiUrl, postData, {
        headers: {
          Authorization: token
        }
      })
      .then((response) => {
        if (response.data.success && response.data.data) {
          studentDetails = response.data.data;
        } else {
          throw {
            code: HttpStatus.BAD_REQUEST,
            message: 'Some issue has been pop-up!'
          };
        }
      })
      .catch((error) => {
        console.error(error);
      });
    return studentDetails;
  } catch (error) {
    next(error);
  }
};

export const getStudentAllDetails = async (
  token,
  studentId,
  classId,
  batchId,
  configurationId,
  subSessionId
) => {
  try {
    let studentDetails;
    const postData = {
      studentId: studentId,
      classId: classId,
      batchId: batchId,
      configurationId: configurationId,
      subSessionId: subSessionId
    };
    const BE_URL = process.env.AGORAE_BE_URL;
    const apiUrl = BE_URL + '/inventory/student/get-student-all-details';

    await axios
      .post(apiUrl, postData, {
        headers: {
          Authorization: token
        }
      })
      .then((response) => {
        if (response.data.success && response.data.data) {
          studentDetails = response.data.data;
        } else {
          throw {
            code: HttpStatus.BAD_REQUEST,
            message: 'Some issue has been pop-up!'
          };
        }
      })
      .catch((error) => {
        console.error(error);
      });
    return studentDetails;
  } catch (error) {
    next(error);
  }
};

export const getStaffDetails = async (token, staffId) => {
  try {
        const BE_URL = process.env.AGORAE_BE_URL;
        const apiUrl =
        BE_URL +
        `/inventory/staff/get-staff-details-by-staffId/${staffId}`;

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
            // console.log('Response:', responseDetails.data.staffDetails);
            // process.exit(0);
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

        if (responseDetails.success){
            return responseDetails.data.staffDetails;
        } else if (responseDetails.success === true && responseDetails.data.hasAccessOfApprovalRight===false){
            throw {
                code: HttpStatus.BAD_REQUEST,
                message: 'Staff have not any Inventory approval right !'
            };
        }

  } catch (error) {
    next(error);
  }
};

export const getClassNamesByClassIds = async (
  token,
  classIds
) => {
  try {
    let ClassNames;
    const postData = {
      classIds:classIds
    };
    const BE_URL = process.env.AGORAE_BE_URL;
    const apiUrl = BE_URL + '/inventory/common/get-student-className-by-classId';

    await axios
      .post(apiUrl, postData, {
        headers: {
          Authorization: token
        }
      })
      .then((response) => {
        if (response.data.success && response.data.data) {
          ClassNames = response.data.data;
        } else {
          throw {
            code: HttpStatus.BAD_REQUEST,
            message: 'Some issue has been pop-up!'
          };
        }
      })
      .catch((error) => {
        console.error(error);
      });
    return ClassNames;
  } catch (error) {
    next(error);
  }
};

export const getCastNamesByCastIds = async (
  token,
  castIds
) => {
  try {
    let castName;
    const postData = {
      castIds:castIds
    };
    const BE_URL = process.env.AGORAE_BE_URL;
    const apiUrl = BE_URL + '/inventory/common/get-student-cast-name-by-castIds';

    await axios
      .post(apiUrl, postData, {
        headers: {
          Authorization: token
        }
      })
      .then((response) => {
        if (response.data.success && response.data.data) {
          castName = response.data.data;
          // console.log(castName);
          // process.exit(0);
        } else {
          throw {
            code: HttpStatus.BAD_REQUEST,
            message: 'Some issue has been pop-up!'
          };
        }
      })
      .catch((error) => {
        console.error(error);
      });
    return castName;
  } catch (error) {
    next(error);
  }
};

export const getInstituteDetails = async (req,res,next) => {
  try {
        const BE_URL = process.env.AGORAE_BE_URL;
        const token = req.header('Authorization');
        const apiUrl =
        BE_URL +
        `/inventory/common/get-institution-details`;

        const config = {
            method: 'get',
            url: apiUrl,
            headers: {
                Authorization: token
            }
        };

        await axios(config)
        .then((response) => {
            // Handle the response data
            req.institutionData = response.data;
            next();
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

  } catch (error) {
    next(error);
  }
};

export const getStudentClassBatchByStudentId = async (req, res) => {
  try {
      let token = req.header('Authorization');
      let studentData;
      const postData = {
          userId: req.authData.data.id,
          studentId: req.authData.data.studentId
      };
      const BE_URL = process.env.AGORAE_BE_URL;
      const apiUrl =
          BE_URL +
          '/inventory/app/get-student-class-and-batch';

      await axios.post(apiUrl, postData, {
          headers: {
              Authorization: token
          }
      })
      .then((response) => {
          if (response.data.success && response.data.data){
              studentData=response.data.data;
          }else{
              throw {
                  code: HttpStatus.BAD_REQUEST,
                  message: 'Some issue has been pop-up!'
              };
          }
      })
      .catch((error) => {
          console.error(error);
          res.status(500).json({ error: 'An error occurred' });
      });
      return studentData;
  } catch (error) {
      // next(error);
      console.log(error);
  }
};

export const getConfigurationNameByconfigId = async (token, configId) => {
  try {
        const BE_URL = process.env.AGORAE_BE_URL;
        const apiUrl =
        BE_URL +
        `/inventory/common/get-configuration-by-configId/${configId}`;

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
            // console.log('Response:', responseDetails.data.staffDetails);
            // process.exit(0);
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

        if (responseDetails.success){
            return responseDetails.data.configurationName;
        } else {
            throw {
                code: HttpStatus.BAD_REQUEST,
                message: 'There is issue confuration api!'
            };
        }

  } catch (error) {
    next(error);
  }
};

// Get Backend URL
export const getBackEndURL = () => {
  let url = null;

  if (process.env.NODE_ENV === 'production') {
    url = process.env.SERVER_BACK_PROD;
  } else if(process.env.NODE_ENV === 'staging') {
    url = process.env.AGORAE_BE_URL;
  }else{
    url = 'http://localhost'+'/'+ process.env.APP_PORT ;
  }

  return url;
};
