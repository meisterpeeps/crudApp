//------------------START MODULES----------------------------
  var EventEmitter = require('events').EventEmitter,
      bcrypt       = require('bcrypt-nodejs'),
      jwt          = require('jwt-simple'),
      util         = require('util');
//------------------END MODULES------------------------------

//------------------START DATABASE INIT----------------------
  function DB(){
    EventEmitter.call(this);
    this.mongoose = require('mongoose');
  } 
  util.inherits(DB,EventEmitter);
  var db = new DB();

  //Initialize Schemas
  db.Schema = db.mongoose.Schema;
  db.ConfigSchema = new db.Schema({
      name: { type: String},
      hostname: { type: String },
      port: {type: Number },
      username: {type: String}
  });
  db.UserSchema = new db.Schema({
    username: {type: String},
    password: {type: String}
  });

  //Initialize Models
  db.Config = db.mongoose.model('Config',db.ConfigSchema);
  db.User = db.mongoose.model('User', db.UserSchema);
  
  db.mongoose.connect('mongodb://localhost/crudApp');
  db.mongoose.connection.on('open', function(){
    console.log("Connected to Database");
  });
  db.once('dbError', function(err){
    console.log(err);
  })
//------------------END DATABASE INIT------------------------

//----------------AUTH API START-----------------------------
db.findUser = function(username){
  console.log("Finding user:" + username);
  db.User.findOne(
    {'username' : username},'username password', 
    function(err,user){
      if(err){
        Console.log("Error Finding User")
        db.emit('dbError', err);
      }
      else{
        if(!user){
          user = undefined;
          console.log("User" + username + "does not exist.");
          db.emit("foundUser", false)
        }
        else{
          console.log(user + "Found");
          db.emit('foundUser', user);
        }
      }
    });
}

db.addUser = function(user){
  db.once('foundUser', function(found){
    if(!found){
      bcrypt.genSalt(10, function(err, salt) {
        if (err) {
          db.emit('dbError', err);
          return; 
        }
        bcrypt.hash(user.password, salt, null, function(err, hash) {
          if (err) {
            db.emit('dbError', err);
            return;
          }
          user.password = hash;
          console.log(user);
          var newUser = new db.User(user);  
          newUser.save(function(err, savedUser) {
            if(err){
              db.emit('dbError', err);
              return;
            }
            console.log("User Saved");
            token = jwt.encode(user.username, 'secret');
            db.emit("userAdded", token);
          });
        });
      });
    }
    else{
      token = undefined;
      console.log('User already exists');
      db.emit("userAdded", token);
    }

  });
  var token;
  console.log("Finding user: " + user.username);
  db.findUser(user.username);
}


db.login = function(candidate){
  console.log('Login attempt: ' + candidate.username);
  //if the user is found in the database
  //the password provided will be compared
  //to the hashed password in the database
  //if it is a match, a token will be generated
  db.once("foundUser", function(user){
    if(user){
      console.log("User Password is: " + user.password);
      var candidatePassword = candidate.password;
      var savedPassword = user.password;
      bcrypt.compare(candidatePassword, savedPassword,  function (err, isMatch) {
        if(err){
          console.log("Error comparing passwords");
          db.emit('dbError', err);
        }
        else{
          if(isMatch){
            token = jwt.encode(user.username, 'secret');
            db.emit('userLogin', token);
          }
          else{
            token = undefined;
            console.log("Password Incorrect");
            db.emit('userLogin', false)
          }
        }
      })
    }
    else{
      db.emit('userLogin', false);
    }
  });
  var token;
  db.findUser(candidate.username)
}
//----------------AUTH API END-------------------------------


//----------------CONFIGURATIONS API START-------------------
db.findConfig = function(configName){
  console.log("Finding configuration:" + configName);
  db.Config.findOne(
    {'name' : configName},'name hostname port username', 
    function(err,config){
      if(err){
        console.log("Error Finding Configuration")
        db.emit('dbError', err);
      }
      else{
        if(!config){
          console.log("Configuration" + configName + "does not exist.");
          db.emit("foundConfig", false)
        }
        else{
          console.log(configName + "Found");
          db.emit('foundConfig', true);
        }
      }
    });
}

db.getConfigs = function(params){

  db.Config.find(function(err, configs){
    if(err){
      db.emit('dbError', err)
    }
    else{
      db.emit('gotConfigs', configs);
    }
  });

  // {
  //   sortBy: name,hostname,port,username
  //   pageMax : 20;
  // }
}

db.createConfig = function(config){
  console.log("Adding Configuration: " + config.name);
  db.once('foundConfig', function(found){
    if(!found){
      var newConfig = new db.Config(config);  
      newConfig.save(function(err, savedConfig) {
        if(err){
          db.emit('dbError', err);
          return;
        }
        console.log("Configuration Saved");
        db.emit("configCreated", true);
      });
    }
    else
      db.emit("configCreated", false)
  });
  db.findConfig(config.name);
}

db.editConfig = function(configName,config){
  console.log("Editing Configuration: " + configName);
  db.once('foundConfig', function(found){
      if(found){
        db.Config.update({name: configName}, {$set: config},function(err,raw){
          if(err){
            db.emit('dbError', err);
            return;
          }
          console.log("Configuration updated");
          db.emit("configEdited")  
        });
      }
    })
  db.findConfig(configName);
}

db.deleteConfig = function(configName){
  console.log("Deleting Configuration: " + configName);
  db.once('foundConfig', function(found){
    if(found){
      db.Config.remove({name: configName}, function(err){
        if(err){
          console.log("Error");
          db.emit('dbError', err);
        }
        else{
          console.log("Configuration Deleted");
          db.emit("configDeleted", true);
        }
      });
    }
    else{
      db.emit("configDeleted", false)
    }
  })
  db.findConfig(configName);
}

//----------------CONFIGURATIONS API END---------------------



//----------------SEED CONFIGURATIONS START------------------
var newConfig;
for(var i = 0; i < 10 ; i++){
  newConfig = {
    name : "host" + i,
    hostname : "nessus-ntp.lab.com",
    port : 1241 + i,
    username : "toto"
  }
  db.createConfig(newConfig);
}

var newConfig2;
for(var i = 10; i < 20 ; i++){
  newConfig2 = {
    name : "host" + i,
    hostname : "nessus-ntp.lab.com",
    port : 1241 + i,
    username : "admin"
  }
  db.createConfig(newConfig2);
}

//----------------SEED CONFIGURATIONS END--------------------

//----------------SEED AUTH START----------------------------
var gilgamesh = {
  username: 'Gilgamesh',
  password: '123'
};
db.addUser(gilgamesh);
var enkidu = {
  username: 'Enkidu',
  password: '321'
};
db.addUser(enkidu);
//----------------SEED AUTH END------------------------------

module.exports = db;



























