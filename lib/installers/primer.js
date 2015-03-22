/**
 * Primer is a SASS library used as the foundation
 * for most Ecor products.
 */
var path = require('path'),
    fs = require('fs'),
    ask = require('inquirer');
var url = 'https://github.com/ecorventures/primer.git';
var spawn = require('child_process').spawn;

var run = function(){
  var child = spawn('git', ['clone',url,'./primer'], {
    env: process.env
  });
  
  child.stdout.on('data', function(data) {
    console.log(data.toString());
  });
  
  child.stderr.on('data', function(data) {
    console.log(data.toString());
  });
  
  child.on('close', function(code){
    process.exit(code);
  });
}

module.exports = function(callback){
  var cmd = 'git clone '+url+' ./primer',
      p = path.resolve('./primer');
  
  fs.exists(p, function(exists){
    if (exists){
      console.log((p+' already exists!').yellow.bold);
      ask.prompt({
        type: 'confirm',
        default: true,
        name: 'overwrite',
        message: 'Overwrite the directory?'
      },function(a){
        if (a.overwrite){
          require('rimraf')(p,function(err){
            if (err) throw err;
            run();
          });
        }
      })
    } else {
      run();
    }
  });
  
};