#!/usr/bin/env node

"use strict";

// Dependencies
require('colors');
var fs = require('fs'),
    path = require('path'),
    events = require('events'),
    pkg = require('../package.json'),
    EventEmitter = events.EventEmitter,
    wizard = require('../lib/wizard'),
    updates = require('../lib/update'),
    util = require('../lib/utility');

// Constants
var home = path.join(process.env.APPDATA || process.env.HOME, '.ecor'),
    cfgfile = path.join(home,'config.json'),
    status = new EventEmitter();

// If there is no configuration directory, make one.
if (!fs.existsSync(home)){
  fs.mkdirSync(home);
}

// Check for updates (async)
status.on('checkversion', function(){
  updates.check(function(e){

    // If there is an error other than a TCP timeout, show it.
    if (e && e.code !== 'ETIMEDOUT'){
      console.error(e);
      process.exit(1);
    }  

    var argv = require('yargs')
      .usage('Usage $0 <command> [options]')
      .command('install','Install a '+pkg.name+' app, tool, or module.')
      .example('$0 install primer', 'Install the primer SASS package.')
      .alias('i','install')
      .help('help')
      .version(pkg.version)
      .showHelpOnFail(false, "Specify --help for available options")
      .wrap(80)
      .epilog('Copyright (c) '+(new Date()).getFullYear()+' Ecor Ventures, LLC. All Rights Reserved.');
    
    process.flag = argv.argv;
    process.arg = argv.argv._;
    
    delete process.flag._;
    delete process.flag.$0;
    
    switch(process.arg[0]){
      case 'i':
      case 'install':
        return util.install(process.arg[1]);
      case 'help':
      default:
        argv.showHelp();
    }
    
  });
});


// If there is no config, set one up.
//if (!fs.existsSync(cfgfile)){
//  wizard.setup(function(){
//    status.emit('checkversion');
//  });
//} else {
  status.emit('checkversion');
//}

/**
  TODO
  1. Add Hipchat
  2. Add Github
  3. Add BitBucket
  4. Add id_rsa.pub reference
  5. Add ability to provide standup notes
  6. Update npm config for private registry
  
**/