/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import fs from 'fs';
import path from 'path';
import md5 from 'md5';
import mime from 'mime-types';
import CONSTANTS from '../utils/constants.util.js';

import inventoryDocumentMaster from '../models/inventoryDocumentMaster.model.js';

// AWS S3
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION_NAME
});

export const awsS3Handler = () => {
  //   console.log(CONSTANTS);
  return multer({
    storage: multerS3({
      s3: S3,
      bucket: process.env.AWS_BUCKET_NAME,
      acl: 'public-read',
      key: function (req, file, cb) {
        let destinationPath = 'inventory';

        let extension = CONSTANTS.MIME_TO_EXTENSION[file.mimetype];
        let fileName = `${new Date().getTime()}-${file.originalname}`;

        cb(null, `${destinationPath}/${md5(fileName)}.${extension}`);
      }
    }),
    fileFilter: function (req, file, cb) {
      let isValid = true;
      let { maxFileSize } = req.body; // in kb
      //   console.log(maxFileSize,"max size");
      if (maxFileSize) {
        let size = parseInt(req.headers['content-length']); //in byte
        // console.log(size,"uploaded file size");
        let sizeLimit = parseInt(maxFileSize * 1024);
        if (sizeLimit < size) {
          isValid = false;
        }
      }
      let error = isValid ? null : new Error('File size limit exceeds!');
      cb(error, isValid);
    }
  });
};

export const awsS3ServerToServerUpload = (
  localPath,
  destinationPath,
  maxFileSize = '200MB'
) => {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(localPath);
    const fileName = localPath.split(path.sep).pop();
    // make the filename Unique in s3
    let fileExt = fileName.split('.').pop();
    let fileOldName = fileName.split('.').shift();
    let uniqueFileName =
      md5(fileOldName + '-' + new Date().getTime()) + '.' + fileExt;
    const params = {
      ACL: 'public-read',
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: destinationPath + '/' + uniqueFileName,
      Body: fileContent,
      limits: { fileSize: maxFileSize }
    };
    S3.upload(params, async function (err, data) {
      if (err) {
        reject(err);
      }
      // insert data in documents table
      let s3Data = data;
      let fileExtension = s3Data.Key.split('/').pop().split('.').pop();
      let fileSize = fs.statSync(localPath);
      fileSize = fileSize.size;
      let create = await inventoryDocumentMaster.create({
        type: destinationPath,
        etag: s3Data.ETag.substring(1, s3Data.ETag.length - 1),
        fileName: s3Data.Key.split('/').pop(),
        filePath: s3Data.Key,
        fullPath: s3Data.Location,
        mimeType: mime.lookup(fileExtension),
        size: fileSize,
        originalFileName: s3Data.Key.split('/')
          .pop()
          .split('.')
          .shift()
          .toString()
          .replace(/[_\-&\/\\#,+()$~%.'":*?<>{}]/g, ' ')
          .replace(/\s\s+/g, ' '),
        fileExtension: fileExtension
      });
      resolve(create);
    });
  });
};

export const deleteFile = async (id) => {
  return new Promise(async (resolve, reject) => {
    let document = await inventoryDocumentMaster.findOne({ _id: id });
    if (document) {
      // delete the file from s3
      S3.deleteObject(
        { Bucket: process.env.AWS_BUCKET_NAME, Key: document.filePath },
        async (err, data) => {
          if (err) reject(err);
          await inventoryDocumentMaster.deleteOne({ _id: id });
          resolve(document);
        }
      );
    } else {
      resolve(null);
    }
  });
};
