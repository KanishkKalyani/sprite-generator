const cloudinary = require('../utils/cloudinary');

const cloudinaryUploader = (folderName, outputFileName, isSvgType) => {
  const uploadImage = new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      `src/output/${outputFileName.substring(0, outputFileName.length - 7)}.${
        isSvgType ? 'svg' : 'png'
      }`,
      {
        public_id: outputFileName,
        folder: `${folderName}/sprite`,
        resource_type: 'auto',
      },
      (error, result) => {
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
      `src/output/${outputFileName.substring(
        0,
        outputFileName.length - 7
      )}.css`,
      {
        public_id: outputFileName,
        folder: `${folderName}/sprite`,
        resource_type: 'auto',
      },
      (error, result) => {
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
