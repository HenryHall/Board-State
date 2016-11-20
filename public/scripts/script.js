var myApp = angular.module('myApp', []);


myApp.controller('createCardController', ['$scope', '$http', function($scope, $http){

  $scope.allSets = {};
  $scope.createdCardArray = [];
  $scope.uniqueID = 0;

  $http({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/HenryHall/MtgJsonTest/gh-pages/JSon/AllSets.json'
  })
  .then(function(data){
    $scope.allSets = data.data;
    console.log($scope.allSets);
  });


  $scope.clearInput = function(){
    $scope.newCardModel = "";
  };


  $scope.createNewCard = function(key){

    //Make sure there is text to create a card
    if($scope.newCardModel == "" || $scope.newCardModel == undefined){
      return;
    }

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


  function getCardInfo(card){

    for(var i in $scope.allSets){
      for(var j=0; j<$scope.allSets[i].cards.length; j++){
        if($scope.allSets[i].cards[j].name.toLowerCase() == card.toLowerCase()){
          //Check to see if the image can be loaded
          if($scope.allSets[i].cards[j].multiverseid){
            console.log($scope.allSets[i].cards[j]);
            return $scope.allSets[i].cards[j];
          } else {
            console.log("No Image was found for this card, will continue looking.");
          }
        }
      }
    }
    return console.log("No card with that name found.");

  }


  function createNewCardElement(cardInfo){
    var newCard = {};

    newCard.uniqueID = $scope.uniqueID++;
    newCard.info = cardInfo;

    if(newCard.info.layout == "double-faced"){
      newCard.night = {};
      newCard.night.info = getCardInfo(newCard.info.names[1]);
      newCard.night.style = {
        "background-Image": "url('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + cardInfo.multiverseid + "&type=card')",
        "background-size": "cover",
        "background-color": "trasnparent",
        height: '155px',
        width: '111px',
        'z-index': 100
      };
      if(newCard.night.info.types.indexOf("Creature") != -1) {
        newCard.night.powerToughness = newCard.night.info.power + "/" + newCard.night.info.toughness;
        newCard.night.types = newCard.night.info.types;
      } else {
        newCard.night.powerToughness = "";
      }
      if(newCard.night.info.type.indexOf("Planeswalker") != -1){
        newCard.night.loyalty = newCard.night.info.loyalty;
      }

      newCard.night.tapped = false;
    }

    newCard.style = {
      "background-Image": "url('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + cardInfo.multiverseid + "&type=card')",
      "background-size": "cover",
      "background-color": "trasnparent",
      height: '155px',
      width: '111px',
      'z-index': 100
    };

    if(cardInfo.types.indexOf("Creature") != -1) {
      newCard.powerToughness = cardInfo.power + "/" + cardInfo.toughness;
      newCard.types = cardInfo.types;
    } else {
      newCard.powerToughness = "";
    }

    if(cardInfo.type.indexOf("Planeswalker") != -1){
      newCard.loyalty = cardInfo.loyalty;
    }

    newCard.tapped = false;

    //Add the newCard
    $scope.createdCardArray.push(newCard);
    console.log($scope.createdCardArray);

    return newCard;
  }//End createNewCardElement


  $scope.clearBoard = function(){
    var confirmClear;
    if($scope.createdCardArray.length == 0){
      return;
    }
    if (confirmClear = confirm("Are you sure you want to clear the board?")){
      $scope.createdCardArray = [];
      $scope.uniqueID = 0;
    }

    return;
  };


  $scope.tapCard = function(card){
    card.tapped = !card.tapped;
  };


  $scope.removeCard = function(index){
    $scope.createdCardArray.splice(index, 1);
  };


  $scope.inspectCard = function($event){
    var currentCard = angular.element($event.target).parent().parent().parent();
    currentCard.addClass('inspecting');
    currentCard.on('mouseleave', function(){
      currentCard.removeClass('inspecting');
    });
  };


  $scope.setPT = function(index){
    var newPT = prompt("Set a new power and toughness.  Keep blank to return to default.", $scope.createdCardArray[index].powerToughness);

    if(newPT == ""){
      $scope.createdCardArray[index].powerToughness = $scope.createdCardArray[index].info.power + "/" + $scope.createdCardArray[index].info.toughness;
    } else {
      $scope.createdCardArray[index].powerToughness = newPT;
    }
  };


  $scope.setLoyalty = function(index){
    var newLoyalty = prompt("Set a new loyalty.  Keep blank to return to default.", $scope.createdCardArray[index].loyalty);

    if(newLoyalty == ""){
      $scope.createdCardArray[index].loyalty = $scope.createdCardArray[index].info.loyalty;
    } else {
      $scope.createdCardArray[index].loyalty = newLoyalty;
    }
  };


  $scope.flipDFCard = function(index){
    //rotate the card
    // var currentCard = angular.element($event.target).parent().parent().parent();
    // currentCard.addClass('rotating');

    var tempCard = $scope.createdCardArray.splice(index, 1);
    var length = $scope.createdCardArray.push(tempCard[0].night);
    $scope.createdCardArray[length-1].night = tempCard[0];
    $scope.createdCardArray[length-1].style['background-Image'] = "url('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + tempCard[0].night.info.multiverseid  + "&type=card')";
    delete $scope.createdCardArray[length-1].night['night'];
    console.log(tempCard);
    console.log($scope.createdCardArray[index]);

  };


  $scope.moveCardUp = function(index){
    if(!$scope.createdCardArray[index].style['z-index']){
      $scope.createdCardArray[index].style['z-index'] = 100;
    } else if($scope.createdCardArray[index].style['z-index'] == 999) {
      return;
    }
    $scope.createdCardArray[index].style['z-index']++;
  };


  $scope.moveCardDown = function(index){
    if(!$scope.createdCardArray[index].style['z-index']){
      $scope.createdCardArray[index].style['z-index'] = 100;
    } else if($scope.createdCardArray[index].style['z-index'] == 1) {
      return;
    }
    $scope.createdCardArray[index].style['z-index']--;
  };


  $scope.duplicateCard = function(index){
    var newCard = createNewCardElement($scope.createdCardArray[index].info);
    newCard.powerToughness = $scope.createdCardArray[index].powerToughness;
  };


}])
// .directive('rotating', function(){
//   restrict: 'C',
//   scope: {rotation: 0},
//   link: function(scope, element, attrs){
//     element.css({
//       transform: "rotate(" + $scope.rotation + "deg)"
//     });
//     if(element){
//       function(){
//         for(var i=0; i<91; i++){
//           $scope.rotation = i;
//         }
//         for(var i=90; i>-1; i++){
//           $scope.rotation = i;
//         }
//       }
//     }
//   }
// })
.directive('uiPanel', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/templates/uiPanel.html'
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
      if(element.parent().hasClass('tapped')){
        element.css({
          transform: "rotate(-90deg)",
          top: '-20px',
          left: '75px',
          // 'z-index': 1000
        });
      }
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
     position: 'relative',
     cursor: 'pointer',
     display: 'block'
    });
    element.on('mousedown', function(event) {
      // Prevent default dragging of selected content
      console.log(event);
      event.preventDefault();
      startX = event.screenX - x;
      startY = event.screenY - y;
      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);
    });


    function mousemove(event) {

      //Make sure the element can't leave the gameBoard element
      var elementBounds = event.target.getBoundingClientRect();
      var gameBoard = document.getElementById('gameBoard').getBoundingClientRect();

      console.log("elementBounds", elementBounds);
      console.log("gameBoard", gameBoard);
      console.log("element", element);

      //correction for a weird glitch
      if(elementBounds.left == 0){
        console.log("out of bounds");
        return
      }


      if(elementBounds.left < gameBoard.left + 10){
        element.css({
          left: (gameBoard.left + 15) + 'px'
        });
        x = gameBoard.left + 15;
        $document.off('mousemove', mousemove);
      } else if (elementBounds.right > gameBoard.right - 10){
        element.css({
          left: (elementBounds.right - 160) + 'px'
        });
        x = elementBounds.right - 160;
        $document.off('mousemove', mousemove);
      } else if (elementBounds.top < gameBoard.top + 10){
        element.css({
          top: 15 + 'px'
        });
        y = 15;
        $document.off('mousemove', mousemove);
      } else if (elementBounds.bottom > gameBoard.bottom - 10){
        element.css({
          top: (elementBounds.top - 200) + 'px'
        });
        y = elementBounds.top - 200;
        $document.off('mousemove', mousemove);
      } else {
        y = event.screenY - startY;
        x = event.screenX - startX;
        element.css({
          top: y + 'px',
          left:  x + 'px'
        });
      }
    }


    function mouseup() {
      $document.off('mousemove', mousemove);
      $document.off('mouseup', mouseup);
    }
  };
});
