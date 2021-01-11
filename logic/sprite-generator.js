const fs = require('fs');
const SpriteSmith = require('spritesmith');
const { v4: uuid } = require('uuid');

const cloudinaryUploader = require('./cloudinary-uploader');

const getHashedName = (fileName) => {
  return fileName + '_' + uuid().substring(0, 6);
};

const generateSprite = (
  folderName,
  fileName,
  algorithm,
  padding,
  isSvgType
) => {
  return new Promise((resolve, reject) => {
    const hashedFileName = getHashedName(fileName);
    const _dirname = './src/downloads';
    const _outputDir = './src/output';
    const dir = fs.opendirSync('./src/downloads');
    const source = [];
    let dirent;
    while ((dirent = dir.readSync()) !== null) {
      if (dirent.name !== '.DS_Store')
        source.push(`${_dirname}/${dirent.name}`);
    }
    dir.closeSync();
    // Generate our spritesheet

    SpriteSmith.run(
      {
        src: source,
        algorithm: algorithm,
        padding: padding,
      },
      async (err, result) => {
        // If there was an error, throw it
        if (err || !result) {
          reject(err);
          return;
        }

        const getCssString = () => {
          const coordinateArray = Object.entries(result.coordinates);

          let CssString = '';

          for (let index = 0; index < coordinateArray.length; index++) {
            CssString += getSingleClassInCssFormat(coordinateArray[index]);
          }

          return CssString;
        };

        const getSingleClassInCssFormat = (imageCoordinatesArr) => {
          return `
.${getImageName(imageCoordinatesArr[0])} {
width: ${imageCoordinatesArr[1].width}px;
height: ${imageCoordinatesArr[1].height}px;
background: url('${hashedFileName}.png') -${imageCoordinatesArr[1].x}px -${
            imageCoordinatesArr[1].y
          }px;
}
  `;
        };

        const getImageName = (imageSrc) => {
          return imageSrc.substring(16, imageSrc.length - 4);
        };

        // Output the image and the CSS file -

        const cssString = getCssString();

        fs.writeFileSync(_outputDir + `/${fileName}.png`, result.image);

        fs.writeFileSync(_outputDir + `/${fileName}.css`, cssString);

        const dir = fs.opendirSync('src/output');
        let count = 0;
        let dirent;
        while ((dirent = dir.readSync()) !== null) {
          if (dirent.name !== '.DS_Store') count++;
        }
        console.log('COUNT', count);
        dir.closeSync();

        const urlObj = await cloudinaryUploader(
          folderName,
          hashedFileName,
          isSvgType
        );
        resolve({
          cssCode: cssString,
          ...urlObj,
        });
      }
    );
  }).catch((error) => {
    return { error };
  });
};

module.exports = generateSprite;
