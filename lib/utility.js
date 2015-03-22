"use strict";
var fs = require('fs'),
    path = require('path');

var obj = {};
Object.defineProperties(obj,{
  
  // Include a library by reading in all of the files
  // USAGE: includeLib(path, [ignoredFileArray]);
  includeLib: {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function(p,ignored){
      ignored = ignored || [];
      p = path.resolve(p);
      
      if (!fs.existsSync(p)){
        return {};
      }
      
      var ns = {};
      fs.readdirSync(p).filter(function(file){
        return ignored.indexOf(file) < 0; 
      }).forEach(function(file){
        ns[path.basename(file,'.js').toLowerCase()] = require(path.join(p,file));
      });

      return ns;
    }
  },
  
  install: {
    enumerable: true,
    writable: false,
    configurable: false,
    value: function(app,ignored){
      
      if (!app){
        console.log('Nothing specified! Install failed.'.red.bold);
        process.exit(1);
      } else if (app === 'help'){
        var me = this;
        var ask = require('inquirer');
        var ns = [];
        p = path.resolve(__dirname,'installers');
        
        ignored = ignored || [];
        
        // A subroutine to retrieve the comments from a JS file
        // This is used to extract the description from the installer files
        var getDesc = function(pth){
          var parse = require('comment-parser');
          return parse(fs.readFileSync(pth).toString())[0].description.replace(/\n/gi,' ');
        };
        
        fs.readdirSync(p).filter(function(file){
          return ignored.indexOf(file) < 0; 
        }).forEach(function(file){
          ns.push({
            name: path.basename(file,'.js').toLowerCase().bold+': '+getDesc(path.join(p,file)),
            value: path.basename(file,'.js')
          });
        });
        ns.unshift({
          name: 'Don\'t install anything. (Quit)'.toUpperCase().yellow.bold,
          value: null
        });
        ask.prompt([{
          type: 'list',
          name: 'apps',
          message: 'Would you like to install one of these?',
          default: 0,
          choices: ns
        }],function(a){
          if (a.apps !== null){
            me.install(a.apps)
          } else {
            process.exit(0);
          }
        });
        return;
      }
      
      var p = path.join(__dirname,'..','lib','installers',app.toLowerCase()+'.js');

      fs.exists(p,function(exists){
        if (!exists){
          console.log((app+' is not a recognized installer.').red.bold);
          process.exit(1);
        } else {
          require(p)();
        }
      });
    }
  }
  
});

module.exports = obj;