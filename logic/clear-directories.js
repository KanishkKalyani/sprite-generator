const fs = require('fs');

const clearDirectories = () => {
  fs.rmdir('./src/downloads', { recursive: true }, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Recursive: Downloads Directory Deleted!');
    }
  });

  fs.rmdir('./src/output', { recursive: true }, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Recursive: Output Directory Deleted!');
    }
  });
};

module.exports = clearDirectories;
