import path from "path";
function getHtmlFilepath(name) {
  const pagePath = path.join(__dirname, name);
  return pagePath;
}
export {
  getHtmlFilepath
};
