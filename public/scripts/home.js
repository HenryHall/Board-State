var myApp = angular.module('myApp', []);


myApp.controller('homeController', ['$scope', '$http', function($scope, $http){
  console.log("here");

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


  //DO THIS
  $scope.tutorialLink = "NotMadeYet";

  // $scope.popularBS = [
  //   {
  //     title: 'Tarmogoyf and Lightning Bolt',
  //     category: 'Rules Question',
  //     username: 'Day[J]',
  //     date: '12/14/16'
  //   },
  //   {
  //     title: 'How can I stop this',
  //     category: 'Rules Question',
  //     username: 'Comatose',
  //     date: '12/12/16'
  //   },
  //   {
  //     title: 'I can\'t believe this',
  //     category: 'Story',
  //     username: 'Kingler',
  //     date: '12/13/16'
  //   },
  //   {
  //     title: 'What happens here',
  //     category: 'Rules Question',
  //     username: 'Ziggy Stardew',
  //     date: '12/14/16'
  //   },
  //   {
  //     title: 'Sick decision making',
  //     category: 'Story',
  //     username: 'Robo Dick',
  //     date: '12/8/16'
  //   }
  // ];


  // $scope.recentBS = [
  //   {
  //     title: 'Tarmogoyf and Lightning Bolt',
  //     category: 'Rules Question',
  //     username: 'Day[J]',
  //     date: '12/14/16'
  //   },
  //   {
  //     title: 'How can I stop this',
  //     category: 'Rules Question',
  //     username: 'Comatose',
  //     date: '12/14/16'
  //   },
  //   {
  //     title: 'I can\'t believe this',
  //     category: 'Story',
  //     username: 'Kingler',
  //     date: '12/14/16'
  //   },
  //   {
  //     title: 'What happens here',
  //     category: 'Rules Question',
  //     username: 'Ziggy Stardew',
  //     date: '12/14/16'
  //   },
  //   {
  //     title: 'Sick decision making',
  //     category: 'Story',
  //     username: 'Robo Dick',
  //     date: '12/14/16'
  //   }
  // ];


}]);
