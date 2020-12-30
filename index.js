/*
---------------------------------------------------------------------------------------------------
  Instructions for use:

    1. Add the images in /src/icons folder to be included in the spritesheet.
    2. Change the file names in lines 38 and 41 to appropriate file names in context with your use.
    3. Do 'npm start'
---------------------------------------------------------------------------------------------------
*/

const fs = require('fs');
const Spritesmith = require('spritesmith');
 
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
Spritesmith.run({
  src: source,
  algorithm: 'left-right', // Available algotithms are: "top-down"	"left-right"	"diagonal"	"alt-diagonal"	"binary-tree"
  padding: 5 // Edit padding as per requirement
}, (err, result) => {
  // If there was an error, throw it
  if (err) {
    throw err;
  }
 
  // Output the image -

  // Change name of output sprite png file
  fs.writeFileSync(_outputDir + '/output-sprite.png', result.image); 

  // Change name of output sprite js file which contains dimensional details of the generated sprite image, useful to use the spritesheet in css
  fs.writeFileSync(_outputDir+ '/output-sprite.js', 
    JSON.stringify({
      ...result.coordinates,
      properties: result.properties
    }, null, 4));
  }
);

// refer https://www.npmjs.com/package/spritesmith for further details
