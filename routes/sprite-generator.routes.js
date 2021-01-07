const router = require('express').Router();
const fs = require('fs');

const downloadCloudinaryImages = require('../logic/cloudinary-downloader');
const clearDirectories = require('../logic/clear-directories');

// ----------------------------- Upload to Cloudinary ---------------------------

router.post('/', async (req, res) => {
  console.log('REQUEST', req.body);
  const {
    folderName,
    outputFileName,
    algorithm,
    padding,
    isSvgType,
  } = req.body;
  let dir = './src/downloads';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  dir = './src/output';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const uploadResponse = await downloadCloudinaryImages(
    folderName,
    outputFileName,
    algorithm,
    padding,
    isSvgType
  );
  if (uploadResponse.error) {
    res.status(404);
  }
  if (fs.existsSync('./src/output') || fs.existsSync('./src/downloads')) {
    clearDirectories();
  }

  res.json(uploadResponse);
});

module.exports = router;
