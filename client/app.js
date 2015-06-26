//-----------------START ANGULAR APP------------------
  var app = angular.module('CrudApp', [
    'ui.router']);
//-----------------END ANGULAR APP--------------------

//-----------------START ANGULAR CONFIG---------------
  app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    $stateProvider
    //LOGIN STATE & DEFAULT STATE
      .state('login', {
        url:"/login",
        views:{
            "navBar" : {
              templateUrl:"navBar.html",
              controller: "NavBarController"
            },
            "dashboard" : {
              templateUrl: "login.html",
              controller: "PortalController"
            }
        }
      })
    //EDITCONFIG STATE
      .state('editConfig', {
        url:"/editConfig",
        views:{
            "navBar" : {
              templateUrl:"navBar.html",
              controller: "NavBarController"
            },
            "dashboard" : {
              templateUrl: "editConfig.html",
              controller: "EditConfigController"
            }
        }
      })
  });
//-----------------END ANGULAR CONFIG-----------------

//-----------------START AUTH FACTORY-----------------
  app.factory('Auth', function($window, $location){
    var loggedIn = false;
    var username = null;


    return {
      loggedIn : loggedIn,
      username : username
    }

  });
//-----------------END AUTH FACTORY-------------------

//-----------------START CONFIGURATIONS FACTORY-------
  app.factory('Configurations', function($window,$http, $location, Auth){
    var configurations = {
      list : []
    };
    var params = [];
    var query = "";
    var addParams = function(params){
        params = params;
    }
    var getConfigs = function(){
      var url = '/configurations';
      if(params.length > 0){  
        for(var i = 0; i > params.length; i++){
          if(i === 0){
            query += "?" + params[i];
          }
          else{
            query += "&" + params[i]
          }
        }
        url += query;
      }

      $http.get(url,{
         username: Auth.username,
         token   : localStorage.getItem('CrudToken')
      })
      .success(function(configs){       
        console.log("Configurations Received:" + configs);
        configurations.list = configs;
      });
      query = "";
    };

    var deleteConfig = function(config){
      console.log("Deleting Config");
      console.log(": " + config.name);

      $http.delete('/configurations/' + config.name,{
         username: Auth.username,
         token   : localStorage.getItem('CrudToken')
      })
      .success(function(configs){       
        console.log("Deleted Config");
        getConfigs();
      });
    };
    var createConfig = function(config){
      console.log("Creating Config");
      console.log(": " + config.name);
      config.auth = {
        username : Auth.username,
        token    : localStorage.getItem('CrudToken')
      }
      $http.post('/configurations', config)
      .success(function(){
        console.log("Created Config");
        getConfigs();
      })
    };

    var editConfig = function(){};

    return{
      list: configurations,
      getConfigs : getConfigs,
      addParams : addParams,
      createConfig : createConfig,
      editConfig : editConfig,
      deleteConfig : deleteConfig
    }
  });  
//-----------------END CONFIGURATIONS FACTORY---------



//-----------------START NAVBAR CONTROLLER------------
  app.controller('NavBarController', function($scope, $state, $http, $window, $location, Auth) {
    $scope.loggedIn = Auth.loggedIn;

    $scope.logout = function(){
      localStorage.removeItem('CrudToken');
      localStorage.removeItem('CrudUserName')
      Auth.loggedIn = false;
      $state.go('login');
      $http.post('/logout',{
        username: Auth.username
      })
      .success(function(response){
        Auth.username = '';
        console.log("Logged Out");
      })
    }
  });
//-----------------END NAVBAR CONTROLLER--------------

//-----------------START PORTAL CONTROLLER------------
  app.controller('PortalController', function($scope,$state, $window, $http, $location, Auth) {
    $scope.username = '';
    $scope.password = '';

    $scope.login = function(username, password){
      $http.post('/login',{
        username: $scope.username,
        password: $scope.password
      })
      .success(function(response){
        localStorage.setItem('CrudToken', response.token);
        localStorage.setItem('CrudUserName', username);
        Auth.loggedIn = true;
        Auth.username = $scope.username;
        console.log("Logged In");
        $scope.username = '';
        $scope.password = '';
        $state.go('editConfig')
      })
      .error(function(error){
        console.log("Error: " + error);
      });
    };


  });
//-----------------END PORTAL CONTROLLER--------------

//-----------------START EDIT CONFIG CONTROLLER-------
  app.controller('EditConfigController', function($scope, Configurations, $window, $location, Auth){
    $scope.params = [];
    $scope.pages = null;
    $scope.sortBy = null;
    $scope.config ={};
    $scope.username = Auth.username;
    $scope.configurations = Configurations.list;
    $scope.sendRequest = function(params){
      if($scope.pages){
        $scope.params.push("pages=true")
      }
      if($scope.sortBy){
        $scope.params.push("sortBy=" + $scope.sortBy);
      }
      $scope.addParams(params);
      $scope.getConfigs();
    }
    $scope.setSort = function(criteria){
      $scope.sortBy = criteria;
      console.log("Setting sortyBy: " + criteria);
    }
    $scope.getConfigs = Configurations.getConfigs;
    $scope.addParams = Configurations.addParams;
    $scope.deleteConfig = Configurations.deleteConfig;
    $scope.createConfig =Configurations.createConfig;
    $scope.editConfig = Configurations.editConfig;
  });
//-----------------END EDIT CONFIG CONTROLLER---------

