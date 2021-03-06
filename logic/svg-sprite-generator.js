const SVGSpriter = require('svg-sprite');
const path = require('path');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');
const { v4: uuid } = require('uuid');

const cloudinaryUploader = require('./cloudinary-uploader');

const getHashedName = (fileName) => {
  return fileName + '_' + uuid().substring(0, 6);
};

const changeBackgroundUrl = (
  cssString,
  originalUrl,
  hashedFileName,
  source,
  baseRoute
) => {
  let changedCssString = cssString
    .split(originalUrl.substring(originalUrl.length - 27))
    .join(`${baseRoute}sprite/${hashedFileName}.svg`);

  for (let i = 0; i < source.length; i++) {
    changedCssString = changedCssString
      .split(`svg-${source[i].substring(14, source[i].length - 4)}`)
      .join(`${source[i].substring(14, source[i].length - 11)}`);
  }

  return changedCssString;
};

const svgSpriteGenerator = (folderName, fileName, baseRoute, isSvgType) => {
  return new Promise((resolve, reject) => {
    const hashedFileName = getHashedName(fileName);
    // 1. Create and configure a spriter instance
    // ====================================================================
    const spriter = new SVGSpriter({
      dest: 'src/output', // Main output directory
      mode: {
        css: {
          // Create a CSS sprite
          render: {
            css: true, // Render a CSS stylesheet
          },
        },
      },
    });

    // 2. Add some SVG files to process
    // ====================================================================

    const _dirname = 'src/downloads';
    const _outputDir = 'src/output';
    const dir = fs.opendirSync('src/downloads');
    const source = [];
    let dirent;
    while ((dirent = dir.readSync()) !== null) {
      if (dirent.name !== '.DS_Store')
        source.push(`${_dirname}/${dirent.name}`);
    }
    dir.closeSync();

    for (let i = 0; i < source.length; i++) {
      spriter.add(
        path.resolve(source[i]),
        source[i].substring(14),
        fs.readFileSync(source[i], {
          encoding: 'utf-8',
        })
      );
    }

    spriter.compile(async (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      let cssString = decoder.write(result.css['css'].contents);
      cssString = changeBackgroundUrl(
        cssString,
        result.css['sprite'].path,
        hashedFileName,
        source,
        baseRoute
      );

      fs.writeFileSync(
        _outputDir + `/${fileName}.svg`,
        result.css['sprite'].contents
      );

      fs.writeFileSync(_outputDir + `/${fileName}.css`, cssString);

      const urlObj = await cloudinaryUploader(
        folderName,
        hashedFileName,
        isSvgType
      );
      resolve({
        cssCode: cssString,
        ...urlObj,
      });
    });
  }).catch((error) => error);
};

module.exports = svgSpriteGenerator;
