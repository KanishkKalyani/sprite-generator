const cloudinary = require('../utils/cloudinary');
const http = require('http');
const fs = require('fs');

const generateSprite = require('./sprite-generator');
const svgSpriteGenerator = require('./svg-sprite-generator');

const file = (name, format) => {
  return fs.createWriteStream(`./src/downloads/${name}.${format}`);
};

const downloadCloudinaryImages = async (
  folderName,
  outputFileName,
  algorithm,
  padding,
  isSvgType
) => {
  return new Promise((resolve, reject) => {
    // Get images from cloudinary
    const result = cloudinary.api.resources(
      {
        type: 'upload',
        prefix: folderName,
        max_results: 50,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (result?.resources?.length === 0) {
          reject(`No Images found for folder ${folderName} in Cloudinary`);
          return;
        }

        result.resources.map(({ url, public_id, format }) => {
          const request = http.get(url, function (response) {
            response.pipe(file(public_id.substring(folderName.length), format));
          });
        });

        setTimeout(async () => {
          if (isSvgType) {
            const resp = await svgSpriteGenerator(
              folderName,
              outputFileName,
              isSvgType
            );
            resolve(resp);
          } else {
            const resp = await generateSprite(
              folderName,
              outputFileName,
              algorithm,
              padding,
              isSvgType
            );
            resolve(resp);
          }
        }, 3000);
      }
    );
  }).catch((error) => {
    return { error };
  });
};

module.exports = downloadCloudinaryImages;
