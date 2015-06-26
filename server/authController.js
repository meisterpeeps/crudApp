var db = require('./database.js');

exports.login = function(req, res){
 db.once('userLogin', function(token){
 	if(token){
 		res.json(token)
 	}
 	else
 		res.send(401);

 });
 db.login(req.body);
};

exports.logout = function(req, res){
};