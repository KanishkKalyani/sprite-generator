/*
---------------------------------------------------------------------------------------------------
  Instructions for use:

    1. Add the images in './src/icons' folder to be included in the spritesheet.
    2. Change the 'fileName' in line 15 to appropriate file name in context with your use.
    3. Change the 'algorithm' in line 26 to one of the algorithms listed above that line.
    4. Change the 'padding' in line 31.
    5. Run 'npm start' in the command line

---------------------------------------------------------------------------------------------------
*/

const fs = require('fs');
const SpriteSmith = require('spritesmith');

// EDIT THIS VARIABLE's (fileName) VALUE, IT WILL BE THE NAME OF GENERATED SPRITE IMAGE AND CSS FILE
const fileName = "output-sprite";

/*
  EDIT THIS VARIABLE's (algorithm) VALUE, IT WILL BE ALGORITHM USED IN GENERATING THE SPRITE IMAGE
  Available algotithms are: 
  1. "top-down"
  2. "left-right"
  3. "diagonal"
  4. "alt-diagonal"
  5. "binary-tree" 
*/
const algorithm = 'left-right';

// EDIT THIS VARIABLE's (padding) VALUE, IT WILL BE THE PADDING USED BETWEEN THE IMAGES IN THE GENERATED SPRITE IMAGE
const padding = 1;

const _dirname = './src/icons';
const _outputDir = './src/output';
const dir = fs.opendirSync('./src/icons');
const source = [];
let dirent
while ((dirent = dir.readSync()) !== null) {
  source.push(`${_dirname}/${dirent.name}`);
}
dir.closeSync();

source.shift();

// Generate our spritesheet

SpriteSmith.run({
  src: source,
  algorithm: algorithm,
  padding: padding
}, (err, result) => {

  // If there was an error, throw it
  if (err) {
    throw err;
  }

  const getCssString = () => {
    const coordinateArray = Object.entries(result.coordinates);

    let CssString = '';

    for(let index = 0; index < coordinateArray.length; index++) {
      CssString += getSingleClassInCssFormat(coordinateArray[index]);
    }

    return CssString;
  };

  const getSingleClassInCssFormat = (imageCoordinatesArr) => {

    return `
    .${getImageName(imageCoordinatesArr[0])} {
      width: ${imageCoordinatesArr[1].width}px;
      height: ${imageCoordinatesArr[1].height}px;
      background: url('${fileName}.png') -${imageCoordinatesArr[1].x}px -${imageCoordinatesArr[1].y}px;
    }
  `;
  }

  const getImageName = (imageSrc) => {

    return imageSrc.substring(12, imageSrc.length - 4);
  };
 
  // Output the image and the CSS file -

  fs.writeFileSync(_outputDir + `/${fileName}.png`, result.image); 

  fs.writeFileSync(_outputDir + `/${fileName}.css`, getCssString());

});

// refer https://www.npmjs.com/package/spritesmith for further details
