/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */

import HttpStatus from 'http-status-codes';
import axios from 'axios';

/**
 * Middleware to authenticate if user has a valid Authorization token
 * Authorization: Bearer <token>
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */

export const getStudentDetails = async (req, res, next) => {
    try {
        let token = req.header('Authorization');

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
                req.authData.data.classId = response.data.data.classId;
                req.authData.data.batchId = response.data.data.batchId;
                next();
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
    } catch (error) {
        next(error);
    }
};
