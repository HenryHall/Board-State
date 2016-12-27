var myApp = angular.module('myApp', []);


myApp.controller('homeController', ['$scope', '$http', function($scope, $http){

  //List of partials
  $scope.tabURL = {
    main: "../views/templates/home/main.html",
    quickStart: "../views/templates/home/quickStart.html",
    about: "../views/templates/home/about.html"
  };

  //Initialize the page to the 'main' partial
  $scope.active = 0;

  $scope.tabChange = function(number){
    switch (number) {
      case 0:
        return $scope.tabURL.main;
        break;

      case 1:
        return $scope.tabURL.quickStart;
        break;

      case 2:
        return $scope.tabURL.about;
        break;

      default:
      return $scope.tabURL.main;
    }
  }


}]);


myApp.controller('mainController', ['$scope', '$http', function($scope, $http){

  $scope.recentBS = [];
  $scope.popularBS = [];

  $scope.url = 'https://board-state.herokuapp.com/new/#/?stateId=';

  //Grab data for the popular and recent sections
  $http({
    method: 'GET',
    url: '/homeData'
  }).then(function(data){
    data = data.data;
    console.log(data);

    for (var i=0; i<data.newest.length; i++){
      data.newest[i].info.hash = data.newest[i].hashed_id;
      $scope.recentBS.push(data.newest[i].info);
    }

    for (var i=0; i<data.popular.length; i++){
      data.popular[i].info.hash = data.popular.hashed_id;
      $scope.popularBS.push(data.popular[i].info);
    }

  });

}]);


myApp.controller('quickStartController', ['$scope', function($scope){

  //Phyrexian Metamorph
  $scope.card = {
    powerToughness: "0/0",
    style: {
      'background-color': 'transparent',
      'background-image': "url('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=214375&type=card')",
      'background-size': 'cover',
      height: '155px',
      width: '111px'
    },
    tapped: false
  }

  $scope.tapCard = function(){
    if ($scope.card.tapped == true) {
      $scope.card.tapped = false;
      document.getElementById('displayCard').removeClass('tapped');
    } else {
      $scope.card.tapped = true;
      document.getElementById('displayCard').addClass('tapped');
    }
  }


}]);
