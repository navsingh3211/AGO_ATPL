/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line no-unused-vars
import paginationSearchHandler from '../utils/paginationSearchHandler.util.js';
import CONSTANTS from '../utils/constants.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';
import InventoryCityMaster from '../models/city.model.js';
import InventoryStateMaster from '../models/state.model.js';
import inventoryDocumentMaster from '../models/inventoryDocumentMaster.model.js';
import {deleteFile} from '../utils/awsS3Handler.util.js';

const getStateListingService = async(req,res)=>{
  try{

      if (req.query.pageSize && req.query.pageNo) {

          const stateCount = await InventoryStateMaster.countDocuments({
            status:true,
            country_id:101
          },{id:1});
          const queryCat = InventoryStateMaster.find(
              {
                  status:true,
                  country_id:101
              },
              {
                id:1,
                name:1,
                _id:0
              }
          ).collation({ locale: 'en', strength: 2 }).sort({id:1});
          let response = new paginationSearchHandler(queryCat,req.query)
          .search('name')
          .pagination();

          const responseFinal=await response.query.select('-__v');

          let msg = stateCount ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
          let result = {
              rows: responseFinal,
              total: stateCount,
          };
          return await apiresponse(true, msg, 201, result);

      } else {
          const queryCat = InventoryStateMaster.find(
            {
                status:true,
                country_id:101
            },
            {
              id:1,
              name:1,
              _id:0
            }
          ).collation({ locale: 'en', strength: 2 }).sort({id:1});
          let response = new paginationSearchHandler(queryCat,req.query)
          .search('name');

          const responseFinal=await response.query.select('-__v');
          let msg = responseFinal.length ? 'Data Found!' : 'No Data Found!';
          return {
              success:true,
              message: msg,
              code: 201,
              data: responseFinal
          };
      }
  }catch(error){
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
}

const getCityListingService = async(req,res)=>{
  try{
      if(!req.query.stateId) return await apiresponse(false, MESSAGES.STATE_ID_VALIDATION_MSG,401,null);
      if (req.query.pageSize && req.query.pageNo) {

          const stateCount = await InventoryCityMaster.countDocuments({
            status:true,
            state_id:req.query.stateId
          },{id:1});
          const queryCat = InventoryCityMaster.find(
              {
                status:true,
                state_id:req.query.stateId
              },
              {
                id:1,
                name:1,
                _id:0
              }
          ).collation({ locale: 'en', strength: 2 }).sort({id:1});
          let response = new paginationSearchHandler(queryCat,req.query)
          .search('name')
          .pagination();

          const responseFinal=await response.query.select('-__v');

          let msg = stateCount ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
          let result = {
              rows: responseFinal,
              total: stateCount,
          };
          return await apiresponse(true, msg, 201, result);

      } else {
          const queryCat = InventoryCityMaster.find(
            {
              status:true,
              state_id:req.query.stateId
            },
            {
              id:1,
              name:1,
              _id:0
            }
          ).collation({ locale: 'en', strength: 2 }).sort({id:1});
          let response = new paginationSearchHandler(queryCat,req.query)
          .search('name');

          const responseFinal=await response.query.select('-__v');
          let msg = responseFinal ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
          return {
              success:true,
              message: msg,
              code: 201,
              data: responseFinal
          };
      }
  }catch(error){
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
}

const getImageByDocumentIdService = async(req,res)=>{
  try{
      const {documentId} = req.params;
      let imageDetails = await inventoryDocumentMaster.findOne(
        {_id:documentId},
        {_id:1,fullPath:1}
      );
      if(!imageDetails){
        return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 401, null);
      }
      return await apiresponse(true, MESSAGES.DATA_FOUND, 201, imageDetails);
  }catch(error){
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
}

const deleteFileService = async(req,res)=>{
  try{
      const {documentId} = req.params;
      if (!documentId) return await apiresponse(false, MESSAGES.BAD_REQUEST,401,null);
      await deleteFile(documentId);
      return await apiresponse(true, MESSAGES.DATA_DELETED,201,null);
  }catch(error){
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
}



export default {
  getStateListingService,
  getCityListingService,
  getImageByDocumentIdService,
  deleteFileService
};