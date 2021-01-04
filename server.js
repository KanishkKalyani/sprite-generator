const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { default: axios } = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const prompt = require('prompt');

dotenv.config(); 

// Middleware
app.use(express.json());

// Route
app.use('/user', require('./routes/user'));

let folderName, outputFileName;

let dir = './src/downloads';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
dir = './src/output';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const startDownload = () => {
  return new Promise(function (resolve, reject) {
    axios.get('http://localhost:5000/user', {
    params: {
      folderName
    }
  })
  .then((response) => {
    console.log(response);
    resolve(response)}
  )
.catch((error) => reject(error));
  });
}

const startSpriteGeneration = () => {
  return new Promise(function (resolve, reject) {
    axios.post('http://localhost:5000/user/generate-sprite', {
        fileName: outputFileName,
        algorithm: "binary-tree",
        padding: 1
    })
    .then((response) => {
      console.log(response);
      resolve(response)}
    )
    .catch((error) => reject(error));
  });
}

const startUploadingSprite = () => {
  let form = new FormData();
  form.append('image', fs.createReadStream(`./src/output/${outputFileName}.png`));
  form.append('outputFileName', outputFileName);

  return new Promise(function (resolve, reject) {
    axios.post('http://localhost:5000/user', form, {
      headers: {
        'accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.8',
        'Content-Type': `multipart/form-data; boundary=${form._boundary}`,
      }
    })
    .then((response) => {
      console.log(response);
      resolve(response)}
    )
    .catch((error) => reject(error));
  });
}

const clearDirectories = () => {
  fs.rmdir("./src/downloads", { 
    recursive: true, 
  }, (error) => { 
    if (error) { 
      console.log(error); 
    } 
    else { 
      console.log("Recursive: Directories Deleted!"); 
    } 
  });
  fs.rmdir("./src/output", { 
    recursive: true, 
  }, (error) => { 
    if (error) { 
      console.log(error); 
    } 
    else { 
      console.log("Recursive: Directories Deleted! The CSS File is also deleted, will show it in UI"); 
    } 
  });
}

function start() {
  startDownload();
  setTimeout( () => {
    startSpriteGeneration();
  }, 3000);
  setTimeout( () => {
    startUploadingSprite();
  }, 6000);
  setTimeout( () => {
    clearDirectories();
  }, 10000);
}

// async function start() {
//   await startDownload();
//   await startSpriteGeneration();
//   await startUploadingSprite();
//   console.log(`ALL Processes Completed`);
// }

prompt.start();

prompt.get(['Coudinary_Folder_Name', 'Output_Sprite_File_Name'], (err, result) => {
  if (err) {
    throw err;
  }

  folderName = result.Coudinary_Folder_Name || 'hevo-blog-dev';
  outputFileName = result.Output_Sprite_File_Name || "output_sprite";

  start();
});

// app.listen(process.env.PORT, () => console.log(`Server is running at PORT ${process.env.PORT}`));
app.listen(process.env.PORT);
