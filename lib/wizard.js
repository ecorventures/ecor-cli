"use strict";

var request = require('request'),
    ask = require('inquirer'),
    pkg = require('../package.json');

var obj = {};

Object.defineProperties(obj,{
  
  setup: {
    enumerable: false,
    writable: false,
    configurable: false,
    value: function(callback){
      if (!callback){
        throw new Error('Callback is required for setup() to function.');
      }
      
      console.log((' >>> INITIAL '+pkg.name.toUpperCase()+' CLI SETUP <<< ').bgMagenta.bold.bold);
      ask.prompt([{
        type: 'input',
        name: 'username',
        message: 'Username',
        validate: function(input){
          console.log('Check against Stormpath for user existance?');
          return true;
        }
      },{
        type: 'password',
        name: 'password',
        message: 'Password',
        validate: function(input){
          console.log('Check against Stormpath for validity.');
          return true;
        }
      }],function(answers){
        callback();
      });
    }
  }
  
});

module.exports = obj;