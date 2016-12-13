var myApp = angular.module('myApp', []);


myApp.controller('homeController', ['$scope', '$http', function($scope, $http){
  console.log("here");

  $scope.popularBS = [
    {
      title: 'Tarmogoyf and Lightning Bolt',
      category: 'Rules Question',
      username: 'Day[J]',
      date: '12/14/16'
    },
    {
      title: 'How can I stop this',
      category: 'Rules Question',
      username: 'Comatose',
      date: '12/12/16'
    },
    {
      title: 'I can\'t believe this',
      category: 'Story',
      username: 'Kingler',
      date: '12/13/16'
    },
    {
      title: 'What happens here',
      category: 'Rules Question',
      username: 'Ziggy Stardew',
      date: '12/14/16'
    },
    {
      title: 'Sick decision making',
      category: 'Story',
      username: 'Robo Dick',
      date: '12/8/16'
    }
  ];


  $scope.recentBS = [
    {
      title: 'Tarmogoyf and Lightning Bolt',
      category: 'Rules Question',
      username: 'Day[J]',
      date: '12/14/16'
    },
    {
      title: 'How can I stop this',
      category: 'Rules Question',
      username: 'Comatose',
      date: '12/14/16'
    },
    {
      title: 'I can\'t believe this',
      category: 'Story',
      username: 'Kingler',
      date: '12/14/16'
    },
    {
      title: 'What happens here',
      category: 'Rules Question',
      username: 'Ziggy Stardew',
      date: '12/14/16'
    },
    {
      title: 'Sick decision making',
      category: 'Story',
      username: 'Robo Dick',
      date: '12/14/16'
    }
  ];


}]);
