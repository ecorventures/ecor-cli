"use strict";
var fs = require('fs'),
  path = require('path'),
  util = require('./utility'),
  bb = require('bitbucket-api');

var slugify = function(str){
  return str.toLowerCase().replace(/[^A-Za-z0-9-\s\_]/gi,'').replace(/\s/gi,'-');
};

var obj = {

  createRepoWizard: function (repo) {
    var cfg = util.getConfig(),
        teams=[];
    
    var ask = require('inquirer');
    ask.prompt([{
      name: 'bbuser',
      type: 'input',
      message: 'BitBucket Username',
      when: function () {
        return !cfg.hasOwnProperty('bitbucketuser');
      },
      validate: function (input) {
        return input.trim().length > 0 ? true : 'Your BitBucket username is required.';
      }
    },{
      name: 'bbpwd',
      type: 'password',
      message: 'BitBucket Password',
      when: function () {
        return !cfg.hasOwnProperty('bitbucketpassword');
      },
      validate: function (input) {
        return input.trim().length > 0 ? true : 'Your BitBucket password is required.';
      }
    },{
      // List the organizations the user has create access in.
      name: 'team',
      type: 'list',
      message: 'Who will own this repository?',
      when: function(a){
        var fin = this.async();
        var options = {
          hostname: 'bitbucket.org',
          port: 443,
          path: '/api/1.0/user/privileges',
          method: 'GET',
          auth: (cfg.bitbucketuser||a.bbuser)+':'+(cfg.bitbucketpassword||a.bbpwd),
          headers: {
            'user-agent': 'ecor-cli'
          }
        };

        var https = require('https');
        var req = https.request(options, function(res) {
          res.on('data', function(d) {
            var json = JSON.parse(d.toString()).teams;
            teams = Object.keys(json).filter(function(el){
              return json[el] === 'admin';
            });

            if (teams.length === 0){
              a.team = cfg.bitbucketuser||a.bbuser;
              return fin(false);
            }
            
            teams.unshift(cfg.bitbucketuser||a.bbuser);
            
            fin(teams.length > 1);
          });
        });
        req.end();

        req.on('error', function(e) {
          console.error(e);
          fin(e);
        });
      },
      choices: function(){
        return teams;
      },
      default: function(a){
        return cfg.bitbucketuser || a.bbuser
      }
    },{
      name: 'nm',
      type: 'input',
      message: 'Repository name',
      validate: function(input){
        return input.trim().length > 0;
      }
    },{
      name: 'dsc',
      type: 'input',
      message: 'Repository description:',
      validate: function(input){
        return input.trim().length > 0;
      }
    },{
      name: 'code',
      type: 'input',
      message: 'What language (ex: nodejs, javascript, HTML)?',
      validate: function(input){
        return input.trim().length > 0;
      },
      default: 'nodejs'
    },{
      name: 'private',
      type: 'confirm',
      message: 'Make this repository private?',
      default: true
    },{
      name: 'open',
      type: 'confirm',
      message: 'Open this repo in a browser after it is created.',
      default: true
    }], function (a) {
      
      console.log(('Generating '+a.team+'/'+a.nm+' repository on BitBucket.'));
      
      var slug = slugify(a.nm),
          options = {
            hostname: 'bitbucket.org',
            port: 443,
            path: '/api/2.0/repositories/'+a.team+'/'+slug,
            method: 'POST',
            auth: (cfg.bitbucketuser||a.bbuser)+':'+(cfg.bitbucketpassword||a.bbpwd),
            headers: {
              'User-Agent': 'ecor-cli',
              'Content-Type': 'application/json'
            }
          };

        var https = require('https');
        var req = https.request(options, function(res) {
          res.on('data', function(d) {
            if(res.statusCode !== 200 && res.statusCode !== 201){
              return console.error(d.toString().red.bold);
            }
            
            console.log(('Repository created successfully.').green.bold);
            
            if (a.hasOwnProperty('bbuser') || a.hasOwnProperty('bbpwd')){
              console.log('\nRemember, your BitBucket username and password can be saved in the ecor configuration!'.magenta.bold);
              console.log(('  $ ecor config set bitbucketuser='+(cfg.bitbucketuser||a.bbuser)).cyan.bold);
              console.log('  $ ecor config set bitbucketpassword=<masked>'.cyan.bold);
            }
            
            var ref = 'https://bitbucket.org/'+a.team+'/'+slug,
                repo = 'git@bitbucket.org:'+a.team+'/'+slug+'.git';

            console.log('\nTo add this to a local git repo:'.magenta.bold,('\n  $ git remote add origin '+repo+'\n').cyan);
            
            if (a.open) {
              var o = require('open');
                o(ref);
              process.exit(0);
            }
          });
        });
        req.write(JSON.stringify({
          scm: 'git',
          name: a.nm,
          description: a.dsc.trim(),
          is_private: a.private,
          fork_policy: a.private ? 'no_public_forks' : 'allow_forks',
          language: a.code.toLowerCase(),
          has_issues: true,
          has_wiki: false
        }));
        req.end();

        req.on('error', function(e) {
          console.error(e);
          process.exit(1);
        });
      
      
    });
  },
  
  help: function(){
    console.log('\nThe following Bitbucket commands are available:\n');
    console.log('  createrepo'.green,': Create a new remote repository.');
    console.log('');
  }
  
};

module.exports = obj;