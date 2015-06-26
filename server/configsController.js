var db = require('./database.js');

module.exports = {

  getConfigs : function(req,res){
    // var sortBy = req.params('sortBy');
    // var pages = req.params('pages');
    console.log("Request Params:" + req.params.pages);
    db.once('gotConfigs', function(configs){
      res.json(configs);
    })
    db.getConfigs();
  },
  createConfig : function(req,res){
    db.once('createdConfig', function(){
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
  }
}