var path = require('path'),
  fs = require('fs'),
  util = require('./utility');

module.exports = function (args) {

  switch (args[0].toLowerCase()) {
    
    // Set a new value
    case 'set':
      cfg = util.getConfig();
      args.splice(1, args.length - 1).forEach(function (arg) {
        var a = arg.split('=');
        if (a.length > 1 && a[1].trim().length > 0){
          cfg[a[0]] = a[1];
        } else {
          return console.log(('ABORTING: '+a[0]+' must have a value assigned, i.e. var=value.').red.bold);
        }
      });
      
      // If the directory doesn't exist, make it.
      if (!fs.existsSync(util.cfgpath)){
        fs.mkdirSync(util.cfgpath);
      }
      
      // Save the file to disk
      util.saveConfig(cfg);
      return;
      
    // Get an existing value
    case 'get':
      var out = util.getConfig()[args[1]];
      if (!out){
        console.log((args[1].bold+' not found in the configuration.').red);
      } else {
         console.log(out);
      }
      return;

    // Delete a value
    case 'del':
    case 'delete':
    case 'remove':
    case 'rm':
      var cfg = util.getConfig();
      delete cfg[args[1]];
      util.saveConfig(cfg);
      return;
      
    // Show the whole list 
    case 'list':
      var cfg = util.getConfig();
      Object.keys(cfg).forEach(function(el){
        console.log(el.green.bold+': '+cfg[el].gray);
      });
      return;
      
    default:
      console.log(args[0], 'is not a supported configuration command.');
  }

};