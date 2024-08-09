import HttpStatus from 'http-status-codes';
// import inventoryManualPaymentService from '../services/inventoryManualPayment.service.js';
import application from '../../../services/app/application/application.service.js';
import { getInstitutionDetailsForReceipt } from '../../../utils/commonFunction.util.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { join } from 'path';
import { apiresponse } from '../../../utils/commonResponse.util.js';

export const getCategories = async (req, res, next) => {
    try {
        const data = await application.getCategories(req, res);
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

export const getSubCategories = async (req, res, next) => {
    try {
        const data = await application.getSubCategories(req, res);
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

export const getSearchedList = async (req, res, next) => {
    try {
        const data = await application.getSearchedList(req, res);
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

export const searchSuggestions = async (req, res, next) => {
    try {
        const data = await application.searchSuggestions(req, res);
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

export const getSearchedItems = async (req, res, next) => {
    try {
        const data = await application.getSearchedItems(req, res);
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

export const getItemDetails = async (req, res, next) => {
    try {
        const data = await application.getItemDetails(req, res);
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

export const notifyItemStock = async (req, res, next) => {
    try {
        const data = await application.notifyItemStock(req, res);
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

export const addOrRemoveWishlist = async (req, res, next) => {
    try {
        const data = await application.addOrRemoveWishlist(req, res);
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

export const getWishlist = async (req, res, next) => {
    try {
        const data = await application.getWishlist(req, res);
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

export const createOrder = async (req, res, next) => {
    try {
        const data = await application.createOrder(req, res);
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

export const getMyOrders = async (req, res, next) => {
    try {
        const data = await application.getMyOrders(req, res);
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

export const getAdminOrders = async (req, res, next) => {
    try {
        const data = await application.getAdminOrders(req, res);
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

export const getOrderDetails = async (req, res, next) => {
    try {
        const data = await application.getOrderDetails(req, res);
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

export const getKitsAssigned = async (req, res, next) => {
    try {
        const data = await application.getKitsAssigned(req, res);
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

export const addToCart = async (req, res, next) => {
    try {
        const data = await application.addToCart(req, res);
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

export const removeFromCart = async (req, res, next) => {
    try {
        const data = await application.removeFromCart(req, res);
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

export const getCartList = async (req, res, next) => {
    try {
        const data = await application.getCartList(req, res);
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

export const updateCart = async (req, res, next) => {
    try {
        const data = await application.updateCart(req, res);
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

export const updatePaymentStatusOrder = async (req, res, next) => {
    try {
        const data = await application.updatePaymentStatusOrder(req, res);
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

export const cancelOrder = async (req, res, next) => {
    try {
        const data = await application.cancelOrder(req, res);
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

export const getReasonForExchange = async (req, res, next) => {
    try {
        const data = await application.getReasonForExchange(req, res);
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

export const createExchange = async (req, res, next) => {
    try {
        const data = await application.createExchange(req, res);
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

export const filterSubCategory = async (req, res, next) => {
    try {
        const data = await application.filterSubCategory(req, res);
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

export const filteredListItems = async (req, res, next) => {
    try {
        const data = await application.filteredListItems(req, res);
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

export const filterOrder = async (req, res, next) => {
    try {
        const data = await application.filterOrder(req, res);
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

export const deleteOrderOnOrderCancel = async (req, res, next) => {
    try {
        const data = await application.deleteOrderOnOrderCancel(req, res);
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

// export const receiptPdfOfItemForStudent = async (req, res, next) => {
//     try {
//         console.log(req)
//         let orderData = await application.receiptPdfOfItemForStudentService(req, res);
//         if (!orderData) {
//               return res.send(
//                   await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null)
//               );
//             // return {
//             //     success: true,
//             //     message: MESSAGES.NO_DATA_FOUND,
//             //     code: 201,
//             //     data: null
//             // };
//         }

//         const instituteData = await getInstitutionDetailsForReceipt(req);
//         if (!instituteData) {
//             return res.send(
//                 await apiresponse(false, 'Institution data missing !', 201, null)
//             );
//             // return {
//             //     success: false,
//             //     message: 'Institution data missing !',
//             //     code: 201,
//             //     data: null
//             // };
//         }
//         let orderDetails = { instituteData, ...orderData }
//         // console.log(orderDetails);
//         // process.exit(0);
//         // const html=' <!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
//         // console.log(__dirname);
//         // process.exit(0);
//         const __filename = fileURLToPath(import.meta.url);
//         const __dirnamee = dirname(__filename);
//         const directoryPath = join(__dirnamee, '../templates', 'studentOrderReceiptAdminPdf.ejs');

//         ejs
//             .renderFile(directoryPath, { orderDetails }, async (err, html) => {
//                 if (err) {
//                     console.log(err);
//                     return res.send(
//                         await apiresponse(false, MESSAGES.HTML_CREATION_ERROR_FOR_PDF, 401, {})
//                     );
//                     // return {
//                     //     success: false,
//                     //     message:MESSAGES.HTML_CREATION_ERROR_FOR_PDF,
//                     //     code: 401,
//                     //     data: null
//                     // };
//                 } else {

//                     // return res.send(html);
//                     // Generate PDF
//                     let options = {
//                         format: 'A4', // allowed units: A3, A4, A5, Legal, Letter, Tabloid
//                         orientation: 'portrait', // portrait or landscape
//                         childProcessOptions: {
//                             env: {
//                                 OPENSSL_CONF: '/dev/null',
//                             },
//                         }
//                     };

//                     htmlPdf.create(html, options).toStream(async (err, stream) => {
//                         // console.log(html);
//                         if (err) {
//                             console.log('ram if11', err);
//                             return res.send(
//                                 await apiresponse(false, MESSAGES.HTML_CREATION_ERROR_FOR_PDF, 401, {})
//                             );
//                             // return {
//                             //     success: false,
//                             //     message:MESSAGES.HTML_CREATION_ERROR_FOR_PDF,
//                             //     code: 401,
//                             //     data: null
//                             // };
//                         } else {
//                             // console.log(html);
//                             res.set('Content-type', 'application/pdf');
//                             stream.pipe(res);
//                         }
//                     });
//                 }
//             });
//     } catch (error) {
//         next(error);
//     }
// };

// export const receiptPdfOfItemForStaff = async (req, res, next) => {
//     try {

//         const orderData = await application.receiptPdfOfItemForStaffService(req, res);

//         if (!orderData) {
//             return res.send(
//                 await apiresponse(true, MESSAGES.NO_DATA_FOUND, 201, null)
//             );
//             // return {
//             //     success: true,
//             //     message:MESSAGES.NO_DATA_FOUND,
//             //     code: 201,
//             //     data: null
//             // };
//         }

//         const instituteData = await getInstitutionDetailsForReceipt(req);
//         if (!instituteData) {
//             return res.send(
//                 await apiresponse(false, 'Institution data missing !', 201, null)
//             );
//             // return {
//             //     success: false,
//             //     message:'Institution data missing !',
//             //     code: 201,
//             //     data: null
//             // };
//         }
//         let orderDetails = { instituteData, ...orderData }
//         // console.log(orderDetails);
//         // process.exit(0);
//         // const html=' <!DOCTYPE html><html><body><h1>My First Heading</h1><p>My first paragraph.</p></body></html>';
//         // console.log(__dirname);
//         // process.exit(0);
//         const __filename = fileURLToPath(import.meta.url);
//         const __dirnamee = dirname(__filename);
//         const directoryPath = join(__dirnamee, '../templates', 'staffOrderReceiptAdminPdf.ejs');

//         ejs
//             .renderFile(directoryPath, { orderDetails }, async (err, html) => {
//                 if (err) {
//                     console.log(err);
//                     return res.send(
//                         await apiresponse(false, MESSAGES.HTML_CREATION_ERROR_FOR_PDF, 401, {})
//                     );
//                     // return {
//                     //     success: false,
//                     //     message:MESSAGES.HTML_CREATION_ERROR_FOR_PDF,
//                     //     code: 401,
//                     //     data: null
//                     // };
//                 } else {

//                     // return res.send(html);
//                     // Generate PDF
//                     let options = {
//                         format: 'A4', // allowed units: A3, A4, A5, Legal, Letter, Tabloid
//                         orientation: 'portrait', // portrait or landscape
//                         childProcessOptions: {
//                             env: {
//                                 OPENSSL_CONF: '/dev/null',
//                             },
//                         }
//                     };

//                     htmlPdf.create(html, options).toStream(async (err, stream) => {
//                         // console.log(html);
//                         if (err) {
//                             console.log('ram if11', err);
//                             return res.send(
//                                 await apiresponse(false, MESSAGES.HTML_CREATION_ERROR_FOR_PDF, 401, {})
//                             );
//                             // return {
//                             //     success: false,
//                             //     message:MESSAGES.HTML_CREATION_ERROR_FOR_PDF,
//                             //     code: 401,
//                             //     data: null
//                             // };
//                         } else {
//                             // console.log(html);
//                             res.set('Content-type', 'application/pdf');
//                             stream.pipe(res);
//                         }
//                     });
//                 }
//             });
//     } catch (error) {
//         next(error);
//     }
// };