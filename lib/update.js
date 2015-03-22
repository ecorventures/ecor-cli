"use strict";

var request = require('request'),
    semver,
    pkg = require('../package.json');

var opt = {
  headers: {
    'User-Agent': 'Ecor CLI'
  },
  timeout: 900
};

var obj = {};

Object.defineProperties(obj,{
  
  check: {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function(callback){
      // Set the timer so this doesn't take too long
      var timedout = false,
        timer = setTimeout(function(){
          timedout = true;
          var msg = 'Internet connection could not be established.';
          console.log(msg.gray.bold);
          return callback(new Error(msg));
        },opt.timeout+100);
      
      // 1. Check for updated version of the CLI
      request.get(pkg.releases, opt, function(err,res,body){
        if (!err){
          var data = typeof body === 'string' ? JSON.parse(body) : body;
          if (data.hasOwnProperty('prerelease') && !data.prerelease){
            semver = require('semver');
            var version = require('../package.json').version;
            if (semver.lt(version, data.tag_name)){
              console.log(('\n>>> A new version ('+data.tag_name+') is available. Type ').bgCyan.bold.black+'npm i -g ecor-cli'.bgCyan.magenta+' to update automatically. <<<'.bgCyan.bold.black);
              console.log(('>>> '+data.body+' <<<').bgCyan.bold.grey,'\n')
            }
          }
        }
        if (!timedout){
          clearTimeout(timer);
          callback(err);
        }
      });
    }
  }
  
});

module.exports = obj;