const SVGSpriter = require('svg-sprite');
const path = require('path');
const fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

const cloudinaryUploader = require('./cloudinary-uploader');

const svgSpriteGenerator = (folderName, fileName, isSvgType) => {
  return new Promise((resolve, reject) => {
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

    spriter.compile(function (error, result, data) {
      const cssString = decoder.write(result.css['css'].contents);

      if (error) {
        reject(error);
        return;
      }

      fs.writeFileSync(
        _outputDir + `/${fileName}.svg`,
        result.css['sprite'].contents
      );
      fs.writeFileSync(
        _outputDir + `/${fileName}.css`,
        result.css['css'].contents
      );

      setTimeout(async () => {
        const urlObj = await cloudinaryUploader(
          folderName,
          fileName,
          isSvgType
        );
        resolve({
          cssCode: cssString,
          ...urlObj,
        });
      }, 3000);
    });
  }).catch((error) => {
    return error;
  });
};

module.exports = svgSpriteGenerator;
