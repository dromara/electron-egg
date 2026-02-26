import path from 'path';

// Html
function getHtmlFilepath(name: string){
  const pagePath = path.join(__dirname, name);
  return pagePath;
}

export {
  getHtmlFilepath
};
