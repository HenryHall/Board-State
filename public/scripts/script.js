var myApp = angular.module('myApp', []);


myApp.controller('createCardController', ['$scope', '$http', function($scope, $http){

  $scope.allSets = {};
  $scope.createdCardArray = [];

  $http({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/HenryHall/MtgJsonTest/gh-pages/JSon/AllSets.json'
  })
  .then(function(data){
    $scope.allSets = data.data;
    console.log($scope.allSets);
  });


  $scope.createNewCard = function(){
    for(var i in $scope.allSets){
      for(var j=0; j<$scope.allSets[i].cards.length; j++){
        if($scope.allSets[i].cards[j].name.toLowerCase() == $scope.newCardModel.toLowerCase()){
          //Check to see if the image can be loaded
          if($scope.allSets[i].cards[j].multiverseid){
            console.log($scope.allSets[i].cards[j]);
            return createNewCardElement($scope.allSets[i].cards[j]);
          } else {
            console.log("No Image was found for this card, will continue looking.");
          }
        }
      }
    }
    return console.log("No card with that name found.");
  };


  function createNewCardElement(cardInfo){
    var newCard = {};

    newCard.style = {
      "background-Image": "url('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + cardInfo.multiverseid + "&type=card')",
      "background-size": "cover",
      "background-color": "trasnparent",
      height: '155px',
      width: '111px'
    };

    if(cardInfo.types.indexOf("Creature") != -1) {
      newCard.powerToughness = cardInfo.power + "/" + cardInfo.toughness;
    } else {
      newCard.powerToughness = "";
    }

    newCard.tapped = false;


    //Add the newCard
    $scope.createdCardArray.push(newCard);

  }//End createNewCardElement


  $scope.tapCard = function(card){

    card.tapped = !card.tapped;

  };


  $scope.removeCard = function(index){
    $scope.createdCardArray.splice(index, 1);
  }


}])
.directive('draggable', function($document) {
  //From AngularJS directive example page
  return function(scope, element, attr) {
    var startX = 0, startY = 0, x = 0, y = 0;
    element.css({
     position: 'absolute',
     cursor: 'pointer',
     display: 'block'
    });
    element.on('mousedown', function(event) {
      // Prevent default dragging of selected content
      event.preventDefault();
      startX = event.screenX - x;
      startY = event.screenY - y;
      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);
    });

    function mousemove(event) {
      y = event.screenY - startY;
      x = event.screenX - startX;
      element.css({
        top: y + 'px',
        left:  x + 'px'
      });
    }

    function mouseup() {
      $document.off('mousemove', mousemove);
      $document.off('mouseup', mouseup);
    }
  };
});
