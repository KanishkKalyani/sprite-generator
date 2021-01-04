const router = require("express").Router();
const NPMcloudinary = require('cloudinary').v2;
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const http = require('http');
const fs = require('fs');
const SpriteSmith = require('spritesmith');

const file = (name, format) => { 
  return fs.createWriteStream(`./src/downloads/${name}.${format}`);
}

router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {public_id: req.body.outputFileName});
    res.json(result);
  } catch (err) {
    res.json(err);
  }});

router.get("/", async (req, res) => {
  try {
    // Get images from cloudinary
    const result = await NPMcloudinary.api.resources( {
      type: 'upload',
      prefix: req.query.folderName,
      max_results: 5
    }, async function(error, result) {
        if(!error) {
          await result.resources.map(({ url, public_id, format }) => {
            const request = http.get(url, function(response) {
              response.pipe(file(
                public_id.substring(req.query.folderName.length),
                format
              ));
            });
          });
          res.json(result);
        }
        else res.json(error);
      }
    );
  } catch (err) {
    res.json(err);
  }});

router.post("/generate-sprite", async (req, res) => {
  try {
    const fileName = req.body.fileName || "output_sprite";
    const algorithm = req.body.algorithm || "binary-tree";
    const padding = req.body.padding || 1;

    const _dirname = './src/downloads';
    const _outputDir = './src/output';
    const dir = fs.opendirSync('./src/downloads');
    const source = [];
    let dirent
    while ((dirent = dir.readSync()) !== null) {

      if(dirent.name !== '.DS_Store')
        source.push(`${_dirname}/${dirent.name}`);
    }
    dir.closeSync();
    
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

        return imageSrc.substring(16, imageSrc.length - 4);
      };
    
      // Output the image and the CSS file -

      fs.writeFileSync(_outputDir + `/${fileName}.png`, result.image); 

      fs.writeFileSync(_outputDir + `/${fileName}.css`, getCssString());

      res.json({
        message: `Sprite Image ${fileName}.png and CSS file ${fileName}.css successfully generated`
      });
    }); 
    
  } catch (error) {
    res.json(error);
  }});

 module.exports = router;