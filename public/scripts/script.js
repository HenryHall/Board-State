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

    // newCard.uniqueID =
    newCard.info = cardInfo;

    newCard.style = {
      "background-Image": "url('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + cardInfo.multiverseid + "&type=card')",
      "background-size": "cover",
      "background-color": "trasnparent",
      height: '155px',
      width: '111px'
    };

    if(cardInfo.types.indexOf("Creature") != -1) {
      newCard.powerToughness = cardInfo.power + "/" + cardInfo.toughness;
      newCard.types = cardInfo.types;
    } else {
      newCard.powerToughness = "";
    }

    newCard.tapped = false;

    //Add the newCard
    $scope.createdCardArray.push(newCard);
    console.log($scope.createdCardArray);

  }//End createNewCardElement


  $scope.tapCard = function(card){
    card.tapped = !card.tapped;
  };


  $scope.removeCard = function(index){
    $scope.createdCardArray.splice(index, 1);
  };


  $scope.inspectCard = function(index){
    // $scope.createdCardArray[index].inspecting = true;
  };


  $scope.setPT = function(index){
    var newPT = prompt("Set a new power and toughness.  Keep blank to return to default.", $scope.createdCardArray[index].powerToughness);

    if(newPT == ""){
      $scope.createdCardArray[index].powerToughness = $scope.createdCardArray[index].info.power + "/" + $scope.createdCardArray[index].info.toughness;
    } else {
      $scope.createdCardArray[index].powerToughness = newPT;
    }

  };


}])
.directive('inspecting', function(){
  return {
    restrict: 'C',
    link: function(scope, element, attrs){
      console.log(element);
      element.on('mouseleave', function(){
        element.removeClass('inspecting');
      });
      element.on('click', function(){
        element.removeClass('inspecting');
      });
    }
  }
})
.directive('customContextMenu', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/templates/customContextMenu.html',
    link: function(scope, element, attrs){
      element.on('mouseleave', function(){
        element.remove();
      });
      element.on('click', function(){
        element.remove();
      });
    }
  }
})
.directive('ngRightClick', function($parse, $compile) {
    return function(scope, element, attrs) {
        // var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                // fn(scope, {$event:event});
                element.append(($compile('<custom-context-menu />')(scope)).addClass('customContextMenu').css({
                  left: (event.offsetX-10) + 'px',
                  top: (event.offsetY-10) + 'px',
                  'z-index': 1001
                }));
            });
        });
    };
})
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
