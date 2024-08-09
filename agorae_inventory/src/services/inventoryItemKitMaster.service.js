/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import mongoose from 'mongoose';
import CONSTANTS from '../utils/constants.util.js';
import { apiresponse } from '../utils/commonResponse.util.js';
import MESSAGES from '../utils/commonMessage.util.js';
import inventoryItemKitMaster from '../models/inventoryItemKitMaster.model.js';
import inventoryItemMaster from '../models/inventoryItemMaster.model.js';
import inventorySubCategoryMaster from '../models/inventorySubCategoryMaster.model.js';
import {
    getClassNamesByClassIds,
    getCastNamesByCastIds,
    getConfigurationNameByconfigId
} from '../utils/helperFunction.util.js';
import {
    getCategoriesNameByIds,
    getSubCategoryNameByIds,
    getItemNameById,
    hasSpecialCharacters,
    getItemNameAndSizesById
} from '../utils/commonFunction.util.js';
// create a item kit
// validation part is left
const createInventoryItemKitMasterService = async (req, res) => {
  try {
    const instituteId = req.authData.data.instituteId;
    let body = req.body;

    //total counting of the item kits added previouly
    let totalAddedKitCount = await inventoryItemKitMaster.countDocuments({
      instituteId: instituteId,
      status: true
    });

    let totalKitCount = body.kitQuantity.quantity;
    let itemListingData = body.itemListingData;
    let totalItemCount = itemListingData.reduce((total,item)=>total+item.quantity,0);

    //validation the items is avaliable in the stock or not
    for (let item of itemListingData) {
        let itemDetails = await inventoryItemMaster.findOne({
            _id: item.itemMasterId
        });
        let stock = itemDetails.itemSizes;
        const matchingStockItem = stock.find(
            (stockItem) => stockItem.size === item.size
        );
        // console.log(matchingStockItem);
        if(totalKitCount*item.quantity > matchingStockItem.itemQuantity.quantity){
            return await apiresponse(false, MESSAGES.KIT.SELECTED_QTY_EXCEED, 201);
        }
    }
    //reorder point cannot exceed the quantity of the item kit validation
    if(body.reorderPoint > totalKitCount){
        return await apiresponse(false, MESSAGES.KIT.REORDER_POINT_EXCEED, 201);
    }

    let createKitData = {
        instituteId,
        itemKitName:body.itemKitName.trim(),
        kitQuantity:body.kitQuantity,
        itemKitId:body.itemKitId.trim() + '-' + (totalAddedKitCount+1),
        store:body.store,
        categoryIds:body.categoryIds,
        subCategoryIds:body.subCategoryIds,
        itemListingData:body.itemListingData,
        combinedSellingPrice:body.combinedSellingPrice,
        finalSellingPrice:body.finalSellingPrice,
        reorderPoint:body.reorderPoint,
        configurationId:body.configurationId,
        classIds:body.classIds,
        castIds:body.castIds,
        isItemExchangable:body.isItemExchangable,
        pickupPeriod:body.pickupPeriod,
        exchangePeriod:body.exchangePeriod
    }
    let response = await inventoryItemKitMaster.create(createKitData);
    for (let item of itemListingData) {
        await inventoryItemMaster.updateOne(
            {_id:item.itemMasterId,'itemSizes.size':item.size},
            {
                $inc: {
                    'itemSizes.$.itemQuantity.quantity': - (item.quantity*totalKitCount),
                    'itemSizes.$.totalSellingPrice': - (item.sellingPrice*totalKitCount)
                },
                $set: { isAlreadyUsed:1,updatedAt: new Date() }
            }
        );
        await inventoryItemMaster.updateOne(
            {_id:item.itemMasterId},
            {
                $inc: {
                    'quantityInHand.quantityInHand': - totalItemCount
                },
            }
        );
    }
    return await apiresponse(true, MESSAGES.KIT.KIT_ADDED_SUCCESS, 201, response);

  } catch (error) {
    console.log(error);
    return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
  }
};

const getSubCategoryByCategoriesIdService = async (req, res) => {
    try{
        const instituteId = req.authData.data.instituteId;
        let categoriesId = req.body.categoriesId;
        let subCategories = await inventorySubCategoryMaster.find(
            {
                instituteId:instituteId,
                categoryId: { $in: categoriesId },
                status: true
            },
            {
                status:0,
                __v:0,
                updatedAt:0
            }
        );

        let msg = subCategories.length ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
        return await apiresponse(true, msg, 201, subCategories);
    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const getItemListingByCategoriesAndSubCatsService = async (req, res) => {
    try{
        let instituteId = req.authData.data.instituteId;
        let categoriesId = req.body.categoriesId;
        let subCategoriesId = req.body.subCategoriesId;

        const query = {
            instituteId:instituteId,
            categoryId: { $in: categoriesId },
            subCategoryId: { $in: subCategoriesId },
            status:true
        };
        const result = await inventoryItemMaster.find(query,{
            _id:1,
            categoryId:1,
            subCategoryId:1,
            itemName:1,
            itemId:1,
            itemSizes:1
        });

        let msg = result.length ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
        return await apiresponse(true, msg, 201, result);
    }catch(error){
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const getItemKitListingService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;

    const classId = req.query
        ? req.query.classId
            ? req.query.classId
            : ''
        : '';
    const itemKitId = req.query
        ? req.query.itemKitId
            ? req.query.itemKitId
            : ''
        : '';

    //Creating condition for search for feild itemKitName name
    const searchKeyWord = req.query
        ? req.query.searchKey
            ? req.query.searchKey
            : ''
        : '';
    /* Checking for special charater in serch keyword*/
    if(searchKeyWord && hasSpecialCharacters(searchKeyWord)){
        return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, '');
    }

    let conditionObj = { status: true, instituteId: instituteId };
    if (itemKitId) {
        conditionObj.itemKitId = itemKitId.trim();
    }

    try {
        let queryArray = [
            {
                $match: {
                    ...conditionObj,
                    ...(classId && { classIds: { $in: [parseInt(classId)] } })
                }
            },
            {
                $lookup: {
                    from: 'inventoryunitmasters',
                    localField: 'kitQuantity.unit',
                    foreignField: '_id',
                    as: 'kitQuantity.unit'
                }
            },
            {
                $unwind: {
                    path: '$kitQuantity.unit',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'kitQuantity.unit': {
                        $ifNull: ['$kitQuantity.unit', {}]
                    }
                }
            },
            {
                $match: {
                    $or: [
                        { 'itemKitName': { $regex: searchKeyWord, $options: 'i' } }, // Search in category names
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    itemKitName: 1,
                    kitQuantity:{
                        quantity: '$kitQuantity.quantity',
                        unitName: {
                            $ifNull: ['$kitQuantity.unit.unitName', null] // Check if kitQuantity.unit.name exists
                        },
                        unitId:{
                            $ifNull: ['$kitQuantity.unit._id', null] // Check if kitQuantity.unit.id exists
                        }
                    },
                    itemKitId: 1,
                    totalItemQuantity: { $size: '$itemListingData' } ,
                    finalSellingPrice: 1,
                    classIds: 1,
                    castIds:1,
                    updatedAt: '$editedAt',
                }
            }
        ];

        if (req.query.pageSize && req.query.pageNo) {
            queryArray.push(
                {
                    $facet: {
                        total: [
                            { $group: { _id: null, count: { $sum: 1 } } }
                        ],
                        data: [
                            {
                                $skip: (Number(req.query.pageNo) - 1) * Number(req.query.pageSize)
                            },
                            {
                                $limit: Number(req.query.pageSize)
                            }
                        ]
                    }
                }
            );

            let aggregationResult = await inventoryItemKitMaster.aggregate(queryArray);

            let total = aggregationResult[0].total[0] ? aggregationResult[0].total[0].count : 0;
            let dataListing = aggregationResult[0].data;

            if(dataListing){
                dataListing.classIds = await Promise.all(dataListing.map(async(kit)=>{
                    kit.classIds= await getClassNamesByClassIds(req.header('Authorization'),kit.classIds);
                    return kit;
                }));
                dataListing.castIds = await Promise.all(dataListing.map(async(kit)=>{
                    kit.castIds= await getCastNamesByCastIds(req.header('Authorization'),kit.castIds);
                    return kit;
                }));
            }

            let msg = total ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
            let result = {
                rows: dataListing,
                total: total,
            };
            return await apiresponse(true, msg, 201, result);
        }else{
            let dataByGivenId = await inventoryItemKitMaster.aggregate(queryArray);
            if(dataByGivenId){
                dataByGivenId.classIds = await Promise.all(dataByGivenId.map(async(kit)=>{
                    kit.classIds= await getClassNamesByClassIds(req.header('Authorization'),kit.classIds);
                    return kit;
                }));
                dataByGivenId.castIds = await Promise.all(dataByGivenId.map(async(kit)=>{
                    kit.castIds= await getCastNamesByCastIds(req.header('Authorization'),kit.castIds);
                    return kit;
                }));
            }
            let msg = dataByGivenId.length ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
            return await apiresponse(true, msg, 201, dataByGivenId);
        }
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const getItemKitDetailsByIdService = async (req, res) => {
    const instituteId = req.authData.data.instituteId;
    let {kitId} = req.params;

    try {
        let queryArray = [
            {
                $match: {
                    status: true, instituteId: instituteId,_id : new mongoose.Types.ObjectId(kitId)
                }
            },
            {
                $lookup: {
                    from: 'inventoryunitmasters',
                    localField: 'kitQuantity.unit',
                    foreignField: '_id',
                    as: 'kitQuantity.unit'
                }
            },
            {
                $unwind: {
                    path: '$kitQuantity.unit',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    'kitQuantity.unit': {
                        $ifNull: ['$kitQuantity.unit', {}]
                    }
                }
            },
            {
                $project: {
                    instituteId:0,
                    itemKitViewCount:0,
                    __v:0
                }
            }
        ];

        let dataByGivenId = await inventoryItemKitMaster.aggregate(queryArray);
        let resultData=dataByGivenId[0];
        // console.log(resultData);
        // process.exit(0)

        if(resultData){
            resultData.categoriesNames= await getCategoriesNameByIds(resultData.categoryIds);
            resultData.subCategoriesNames = await getSubCategoryNameByIds(resultData.subCategoryIds);

            resultData.itemListingData = await Promise.all(resultData.itemListingData.map(async(item)=>{
                item.item= await getItemNameAndSizesById(item.itemMasterId);
                return item;
            }));
            resultData.configurationName = await getConfigurationNameByconfigId(req.header('Authorization'),resultData.configurationId);
            resultData.classIds= await getClassNamesByClassIds(req.header('Authorization'),resultData.classIds);
            resultData.castIds= await getCastNamesByCastIds(req.header('Authorization'),resultData.castIds);
        }
        let msg = resultData.length ? MESSAGES.DATA_FOUND : MESSAGES.NO_DATA_FOUND;
        return await apiresponse(true, msg, 201, resultData);
    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
}

const editInventoryItemKitMasterService = async (req, res) => {
    try {
        const instituteId = req.authData.data.instituteId;
        let {KitId,...body} = req.body;
        // console.log(body);
        // process.exit(0);
        let itemKitDetails = await inventoryItemKitMaster.findOne({_id:KitId});
        if(!itemKitDetails){
            return await apiresponse(false, MESSAGES.NO_DATA_FOUND, 201, null);
        }

        //re-stocking the data before the validation
        let itemListingData = itemKitDetails.itemListingData;
        let totalKitCount = itemKitDetails.kitQuantity.quantity;
        for (let item of itemListingData) {
            await inventoryItemMaster.updateOne(
                {_id:item.itemMasterId,'itemSizes.size':item.size},
                { $inc: {
                        'itemSizes.$.itemQuantity.quantity':  (item.quantity*totalKitCount),
                        'itemSizes.$.totalSellingPrice':  (item.sellingPrice*totalKitCount)
                    }
                }
            );
        }

        let totalKitCountBody = body.kitQuantity.quantity;
        let itemListingDatabody = body.itemListingData;

        //validation the items is avaliable in the stock or not
        for (let item of itemListingDatabody) {
            let itemDetails = await inventoryItemMaster.findOne({
                _id: item.itemMasterId
            });
            let stock = itemDetails.itemSizes;
            const matchingStockItem = stock.find(
                (stockItem) => stockItem.size === item.size
            );
            if(totalKitCountBody*item.quantity > matchingStockItem.itemQuantity.quantity){

                //re-stocking the deducated data during the validation
                let itemListingDataRestock = itemKitDetails.itemListingData;
                let totalKitCountRestock = itemKitDetails.kitQuantity.quantity;
                for (let item of itemListingDataRestock) {
                    await inventoryItemMaster.updateOne(
                        {_id:item.itemMasterId,'itemSizes.size':item.size},
                        { $inc: {
                             'itemSizes.$.itemQuantity.quantity':  -(item.quantity*totalKitCountRestock),
                             'itemSizes.$.totalSellingPrice':  -(item.sellingPrice*totalKitCount)
                            }
                        }
                    );
                }
                return await apiresponse(false, MESSAGES.KIT.SELECTED_QTY_EXCEED, 201);
            }
        }

        //reorder point cannot exceed the quantity of the item kit validation
        if(body.reorderPoint > totalKitCountBody){

            //re-stocking the deducated data during the validation
            let itemListingDataRestock = itemKitDetails.itemListingData;
            let totalKitCountRestock = itemKitDetails.kitQuantity.quantity;
            for (let item of itemListingDataRestock) {
                await inventoryItemMaster.updateOne(
                    {_id:item.itemMasterId,'itemSizes.size':item.size},
                    { $inc:
                        {
                            'itemSizes.$.itemQuantity.quantity':  -(item.quantity*totalKitCountRestock),
                            'itemSizes.$.totalSellingPrice':  -(item.sellingPrice*totalKitCountRestock)
                        }
                    }
                );
            }
            return await apiresponse(false, MESSAGES.KIT.REORDER_POINT_EXCEED, 201);
        }

        let createKitData = {
            instituteId,
            itemKitName:body.itemKitName.trim(),
            kitQuantity:body.kitQuantity,
            itemKitId:body.itemKitId.trim(),
            store:body.store,
            categoryIds:body.categoryIds,
            subCategoryIds:body.subCategoryIds,
            itemListingData:body.itemListingData,
            combinedSellingPrice:body.combinedSellingPrice,
            finalSellingPrice:body.finalSellingPrice,
            reorderPoint:body.reorderPoint,
            configurationId:body.configurationId,
            classIds:body.classIds,
            castIds:body.castIds,
            isItemExchangable:body.isItemExchangable,
            pickupPeriod:body.pickupPeriod,
            exchangePeriod:body.exchangePeriod
        }
        // console.log(createKitData);
        // process.exit()
        let response = await inventoryItemKitMaster.updateOne(
            { _id: new mongoose.Types.ObjectId(KitId) },
            {
                $set: {
                    ...createKitData,
                    editedAt: new Date()
                }
            }
        );

        for (let item of body.itemListingData) {
            await inventoryItemMaster.updateOne(
                {_id:item.itemMasterId,'itemSizes.size':item.size},
                { $inc:
                    {
                        'itemSizes.$.itemQuantity.quantity': - (item.quantity*totalKitCountBody),
                        'itemSizes.$.totalSellingPrice':  -(item.sellingPrice*totalKitCountBody)
                    }
                }
            );
        }
        return await apiresponse(true, MESSAGES.KIT.KIT_UPDATE_SUCCESS, 201, response);

    } catch (error) {
        console.log(error);
        return await apiresponse(false, error, 401, MESSAGES.GENERAL_ERROR);
    }
  };


export default {
  createInventoryItemKitMasterService,
  getSubCategoryByCategoriesIdService,
  getItemListingByCategoriesAndSubCatsService,
  getItemKitListingService,
  getItemKitDetailsByIdService,
  editInventoryItemKitMasterService
};
