var http = require('http');
var base64_encode = require('base64').encode;
var config = require("../config");
var sys = require('sys');
var exec = require('child_process').exec;

var couch_http = http.createClient(config.opt.couch_port, config.opt.couch_host);
var request = couch_http.request(
  'GET',
  '/apps' + '/_design/nodeapps/_view/all',
  {
    'host': config.opt.couch_host,
    'Authorization': "Basic " + base64_encode(new Buffer(config.opt.couch_user + ":" + (config.opt.couch_pass || "")))
  }
);
request.end();
request.on('response', function (response) {
  var buff = '';
  if (response.statusCode != 200) {
    console.log('Error: Cannot query CouchDB');
    process.exit(1);
  }
  response.setEncoding('utf8');
  response.on('data', function (chunk) {
    buff += chunk;
  });
  response.on('end', function () {
    var resp = JSON.parse(buff);
    start_running_apps(resp.rows);
  });
});

var start_running_apps = function (apps_arr) {
  for(var i in apps_arr) {
    var doc = apps_arr[i].value;
    if (doc.running == 'true') {
      var app_home = config.opt.home_dir + '/' + config.opt.hosted_apps_subdir + '/' + doc.username + '/' + doc.repo_id;
      var cmd = config.opt.app_dir + '/scripts/launch_app.sh ' + config.opt.app_dir + ' ' + app_home + ' ' + doc.start;
      var child = exec(cmd, function (error, stdout, stderr) {});
    }
  }
};
