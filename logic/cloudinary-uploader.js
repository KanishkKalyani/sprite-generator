const cloudinary = require('../utils/cloudinary');
const { v4: uuid } = require('uuid');

const getHashedName = (fileName) => {
  return fileName + '_' + uuid().substring(0,6);
}

const cloudinaryUploader = (folderName, outputFileName, isSvgType) => {
  const uploadImage = new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      `src/output/${outputFileName}.${isSvgType ? 'svg' : 'png'}`,
      {
        public_id: getHashedName(outputFileName),
        folder: `${folderName}/sprite`,
        resource_type: 'auto',
      },
      function (error, result) {
        if (error || !result) {
          reject('Upload to Cloudinary failed');
        } else {
          resolve(result.secure_url);
        }
      }
    );
  }).catch((error) => {
    return error;
  });

  const uploadCssFile = new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      `src/output/${outputFileName}.css`,
      {
        public_id: getHashedName(outputFileName),
        folder: `${folderName}/sprite`,
        resource_type: 'auto',
      },
      function (error, result) {
        if (error || !result) {
          reject('Upload to Cloudinary failed');
        } else {
          resolve(result.secure_url);
        }
      }
    );
  }).catch((error) => {
    return error;
  });

  return Promise.all([uploadImage, uploadCssFile])
    .then((value) => {
      return {
        spriteUrl: value[0],
        cssFileUrl: value[1],
      };
    })
    .catch((error) => {
      return error;
    });
};

module.exports = cloudinaryUploader;
