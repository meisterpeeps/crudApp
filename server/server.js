
//Start---------------modules-----------------------
  var express = require('express'),
      util = require('util'),
      bodyParser = require('body-parser'),
      authController = require('./authController.js'),
      configsController = require('./configsController.js')
//End-----------------modules-----------------------

//Start---------------Express Init------------------
  var app = express();
//End-----------------Express Init------------------

//Start---------------Controllers-------------------
  var login = authController.login;
  var logout = authController.logout;
  var getConfigs = configsController.getConfigs;
  var createConfig = configsController.createConfig;
  var deleteConfig = configsController.deleteConfig;
  var editConfig = configsController.editConfig;
//End-----------------Controllers-------------------

//Start---------------middleware--------------------
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
//End-----------------middleware--------------------

//Start---------------Routes------------------------
  app.use(express.static(__dirname + '/../client'));
  app.post('/login', login);
  app.post('/logout', logout);
  app.get('/configurations', getConfigs);
  app.post('/configurations', createConfig);
  app.delete('/configurations/:config', deleteConfig);
  app.put('/configurations/:config', editConfig);


  
//End-----------------Routes------------------------

  module.exports = app;