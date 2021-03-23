function getMyLuckNum(vue, name) {
  return vue.$callMain('example.test', name)
}

module.exports = getMyLuckNum
