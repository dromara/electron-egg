const Log = require('ee-core/module/log');

exports.welcome = function () {
  Log.info('[child-process] [jobs/example/hello] welcome ! ');
}