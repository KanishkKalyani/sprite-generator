const cloudinary = require('../utils/cloudinary');
const path = require('path');
const http = require('http');
const fs = require('fs');

const generateSprite = require('./sprite-generator');
const svgSpriteGenerator = require('./svg-sprite-generator');

const file = (name, format) => {
  const fstream = fs.createWriteStream(`./src/downloads/${name}.${format}`);
  fstream.on('error', (err) => {
    console.log('File Write Stream ERROR:' + err);
  });

  return fstream;
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

        if (result && result.resources && result.resources.length === 0) {
          reject(`No Images found for folder ${folderName} in Cloudinary`);
          return;
        }
        const secureUrl = result.resources[0].secure_url;
        const lengthOfBaseRoute = secureUrl.lastIndexOf('/');
        const baseRoute = secureUrl.substring(0, lengthOfBaseRoute + 1);

        Promise.all(
          result.resources.map(({ url, public_id, format }) =>
            new Promise((resolve, reject) =>
              http.get(url, (response) => {
                if (response.statusCode !== 200) {
                  reject('Error' + response.statusMessage);
                  return;
                }
                if (path.parse(public_id).dir === folderName) {
                  response.pipe(
                    file(public_id.substring(folderName.length + 1), format)
                  );
                }
                resolve(public_id);
              })
            ).catch((err) => {
              return err;
            })
          )
        )
          .then(async () => {
            if (isSvgType) {
              const resp = await svgSpriteGenerator(
                folderName,
                outputFileName,
                baseRoute,
                isSvgType
              );
              resolve(resp);
            } else {
              const resp = await generateSprite(
                folderName,
                outputFileName,
                algorithm,
                padding,
                baseRoute,
                isSvgType
              );
              resolve(resp);
            }
          })
          .catch((error) => reject(error));
      }
    );
  }).catch((error) => {
    return { error };
  });
};

module.exports = downloadCloudinaryImages;
