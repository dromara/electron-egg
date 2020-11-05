'use strict';

const fs = require('fs');
const path = require('path');

module.exports = () => {
  const files = fs.readdirSync(__dirname);
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    if (path.extname(filename) === '.js' && filename !== 'index.js') {
      console.log('[ electron ] setup', path.basename(filename, '.js'));
      require(`./${filename}`).setup();
    }
  }
}