const path = require('path');

// Html
function getHtmlFilepath(name){
  const pagePath = path.join(__dirname, name);
  return pagePath;
}

module.exports = {
  getHtmlFilepath
};