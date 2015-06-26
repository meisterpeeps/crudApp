var db = require('./database.js');

module.exports = {

  getConfigs : function(req,res){
    var sortBy = req.query.sortBy;
    var pages = req.query.pages;
    console.log("Request Params:" + sortBy + " and " + pages);
    db.once('gotConfigs', function(configs){
      res.json(configs);
    })
    db.getConfigs(req.query);
  },
  createConfig : function(req,res){
    db.once('configCreated', function(){
      res.send(200);
    });
    db.createConfig(req.body)
  },
  deleteConfig : function(req,res){
    db.once('configDeleted', function(success){
      if(success){
      res.send(200);
      console.log("Successfully Deleted");
      }
      else{
        console.log("did not delete")
        res.send(400);
      }
    });
    db.deleteConfig(req.params.config);
  },
  editConfig : function(req,res){
    db.once('configEdited', function(){
      res.send(200);
    });
    db.editConfig(req.params.config,req.body);
  }
}