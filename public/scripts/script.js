var myApp = angular.module('myApp', []);

var currentZoom = 1;

myApp.controller('createCardController', ['$scope', '$http', function($scope, $http){

  $scope.allSets = {};
  $scope.createdCardArray = [];
  $scope.uniqueID = 0;
  $scope.ui = {
    all: false,
    description: false
  };
  $scope.zoom = currentZoom * 100;
  $scope.gameBoardStyle = {
    transform: 'scale(' + currentZoom + ')'
  };

  $scope.gameStats = {
    opponent: {
      life: 20,
      hand: [],
      graveyard: [],
      exile: [],
      library: []
    },
    self: {
      life: 20,
      hand: [],
      graveyard: [],
      exile: [],
      library: []
    },
    description: ""
  };

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


  $scope.toggleUI = function(){
    console.log("toggle");
    $scope.ui.all = !$scope.ui.all;
  };


  $scope.toggleDescription = function(){
    if(document.getElementById('stateDescription').style.bottom == '0px'){
      document.getElementById('stateDescription').style.bottom = '-40vh';
    } else {
      document.getElementById('stateDescription').style.bottom = '0px';
    }
  };


  function findCard(cardName){
    for(var i in $scope.allSets){
      for(var j=0; j<$scope.allSets[i].cards.length; j++){
        if($scope.allSets[i].cards[j].name.toLowerCase() == cardName.toLowerCase()){
          //Check to see if the image can be loaded
          if($scope.allSets[i].cards[j].multiverseid){
            var foundCard = $scope.allSets[i].cards[j];
            return foundCard;
          } else {
            console.log("No Image was found for this card, will continue looking.");
          }
        }
      }
    }
    return undefined;
  }


  $scope.createNewCard = function(){

    console.log($scope.newCardModel);

    //Make sure there is text to create a card
    if($scope.newCardModel == "" || $scope.newCardModel == undefined){
      return;
    }

    var newCardInfo = findCard($scope.newCardModel);
    console.log(newCardInfo);
    if (newCardInfo == undefined){
      console.log("No card with that name was found.");
      return;
    }

    var newCardElement = createNewCardElement(newCardInfo);
    console.log(newCardElement);
    $scope.createdCardArray.push(newCardElement);

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
      newCard.night.uniqueID = $scope.uniqueID;
      newCard.night.style = {
        "background-Image": "url('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + cardInfo.multiverseid + "&type=card')",
        "background-size": "cover",
        "background-color": "trasnparent",
        height: '155px',
        width: '111px',
        'z-index': 100,
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
  };


  $scope.zoomIn = function(){
    if (currentZoom >= 2) {
      return;
    }
    currentZoom = currentZoom + .1;
    $scope.gameBoardStyle.transform = 'scale(' + currentZoom + ')';
    $scope.zoom = Math.floor(currentZoom * 100);
  }


  $scope.zoomOut = function(){
    if (currentZoom <= .6) {
      return;
    }
    currentZoom = currentZoom - .1;
    $scope.gameBoardStyle.transform = 'scale(' + currentZoom + ')';
    $scope.zoom = Math.floor(currentZoom * 100);
  }


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


  $scope.flipDFCard = function(index, event){
    var thisElementBounds = event.target.getBoundingClientRect();

    var tempCard = $scope.createdCardArray.splice(index, 1);
    var length = $scope.createdCardArray.push(tempCard[0].night);
    $scope.createdCardArray[length-1].night = tempCard[0];
    $scope.createdCardArray[length-1].style.transform = 'scale(' + currentZoom + ')';
    $scope.createdCardArray[length-1].style.top = thisElementBounds.top;
    $scope.createdCardArray[length-1].style.left = thisElementBounds.left;
    $scope.createdCardArray[length-1].style['background-Image'] = "url('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + tempCard[0].night.info.multiverseid  + "&type=card')";
    delete $scope.createdCardArray[length-1].night['night'];

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


  $scope.incrementSelf = function(){
    $scope.gameStats.self.life++;
  };


  $scope.decrementSelf = function(){
    $scope.gameStats.self.life--;
  };


  $scope.incrementOpponent = function(){
    $scope.gameStats.opponent.life++;
  };


  $scope.decrementOpponent = function(){
    $scope.gameStats.opponent.life--;
  };


  $scope.viewZone = function(player, zone){
    console.log("In viewZone with:", player, zone);
    console.log(document.getElementById('otherZones').style.left);

    // if (document.getElementById('otherZones').style.left == '-400px') {
    //   console.log("Opening otherZones");
    //   document.getElementById('otherZones').style.left = '150px';
    // } else if (player == $scope.currentPlayer && zone == $scope.currentZone) {
    //   document.getElementById('otherZones').style.left = '-400px';
    //   return;
    // }

    if(player == $scope.currentPlayer && zone == $scope.currentZone || $scope.currentPlayer == undefined){
      if (document.getElementById('otherZones').style.left == '150px'){
        document.getElementById('otherZones').style.left = '-400px';
        return;
      } else {
        document.getElementById('otherZones').style.left = '150px';
      }
    }

    $scope.currentPlayer = player;
    $scope.currentZone = zone;

    if (player == "Opponents") {

      switch (zone) {
        case "Library":
          $scope.currentZoneCards = $scope.gameStats.opponent.library;
          break;

        case "Hand":
          $scope.currentZoneCards = $scope.gameStats.opponent.hand;
          break;

        case "Graveyard":
          $scope.currentZoneCards = $scope.gameStats.opponent.graveyard;
          break;

        case "Exile":
          $scope.currentZoneCards = $scope.gameStats.opponent.exile;
          break;

        default:
          console.log("How the hell did you get here?");

      }

    } else if (player == "Our") {

      switch (zone) {
        case "Library":
          $scope.currentZoneCards = $scope.gameStats.self.library;
          break;

        case "Hand":
          $scope.currentZoneCards = $scope.gameStats.self.hand;
          break;

        case "Graveyard":
          $scope.currentZoneCards = $scope.gameStats.self.graveyard;
          break;

        case "Exile":
          $scope.currentZoneCards = $scope.gameStats.self.exile;
          break;

        default:
          console.log("How the hell did you get here?");

      }

    }

    //Position the array properly
    if ($scope.currentZoneCards.length > 0){
      positionCurrentZoneCards();
    }

  };


  function positionCurrentZoneCards(){

    var currentTop = document.getElementById('otherZonesCardArea').getBoundingClientRect().top;
    var divBottom = document.getElementById('otherZones').getBoundingClientRect().bottom + 30;
    var currentLeft = 10;

    for (var i=0; i<$scope.currentZoneCards.length; i++){
      $scope.currentZoneCards[i].style.top = currentTop + 'px';
      $scope.currentZoneCards[i].style.left = currentLeft + 'px';

      currentTop = currentTop + 25;
      if ((currentTop + 200) > divBottom){
        //create a new row
        currentTop = document.getElementById('otherZonesCardArea').getBoundingClientRect().top;
        currentLeft = currentLeft + 121;
      }

    }

  }


  $scope.createNewCurrentZone = function(){

    //Make sure there is text to create a card
    if($scope.newCurrentZoneCard == "" || $scope.newCurrentZoneCard == undefined){
      return;
    }

    var newCardInfo = findCard($scope.newCurrentZoneCard);
    var newCardElement = createNewCardElement(newCardInfo);

    //add the card to the proper array
    if ($scope.currentPlayer == "Opponents"){

      switch ($scope.currentZone) {
        case "Library":
          $scope.gameStats.opponent.library.push(newCardElement);
          break;

        case "Hand":
          $scope.gameStats.opponent.hand.push(newCardElement);
          break;

        case "Graveyard":
          $scope.gameStats.opponent.graveyard.push(newCardElement);
          break;

        case "Exile":
          $scope.gameStats.opponent.exile.push(newCardElement);
          break;

        default:
          console.log("That is not a propper zone.");

      }

    } else if ($scope.currentPlayer == "Our"){

      switch ($scope.currentZone) {
        case "Library":
          $scope.gameStats.self.library.push(newCardElement);
          break;

        case "Hand":
          $scope.gameStats.self.hand.push(newCardElement);
          break;

        case "Graveyard":
          $scope.gameStats.self.graveyard.push(newCardElement);
          break;

        case "Exile":
          $scope.gameStats.self.exile.push(newCardElement);
          break;

        default:
          console.log("That is not a propper zone.");

      }

    } else {
      console.log("How the hell did you get here?");
    }

    positionCurrentZoneCards();

  };


  $scope.clearCurrentZoneInput = function(){
    $scope.newCurrentZoneCard = "";
  };


  $scope.removeOtherZoneCard = function(index){
    $scope.currentZoneCards.splice(index, 1);
    positionCurrentZoneCards();
  };


  $scope.clearCurrentZone = function(){
    var confirmClear;
    if($scope.currentZoneCards.length == 0){
      return;
    }
    if (confirmClear = confirm("Are you sure you want to clear " + $scope.currentZone + "?")){

      if ($scope.currentPlayer == "Opponents") {

        switch ($scope.currentZone) {
          case "Library":
            $scope.gameStats.opponent.library = [];
            break;

          case "Hand":
            $scope.gameStats.opponent.hand = [];
            break;

          case "Graveyard":
            $scope.gameStats.opponent.graveyard = [];
            break;

          case "Exile":
            $scope.gameStats.opponent.exile = [];
            break;

          default:
            console.log("How the hell did you get here?");

        }

      } else if ($scope.currentPlayer == "Our") {

        switch ($scope.currentZone) {
          case "Library":
            $scope.gameStats.self.library = [];
            break;

          case "Hand":
            $scope.gameStats.self.hand = [];
            break;

          case "Graveyard":
            $scope.gameStats.self.graveyard = [];
            break;

          case "Exile":
            $scope.gameStats.self.exile = [];
            break;

          default:
            console.log("How the hell did you get here?");

        }

      }
      $scope.currentZoneCards = [];

    }
  };



}])
.directive('cardPortal', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/templates/cardPortal.html',
    controllerAs: 'createCardController',
    replace: true
  }
})
.directive('gameBoardUi', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/templates/gameBoardUi.html',
    controllerAs: 'createCardController'
  }
})
.directive('gameStats', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/templates/gameStats.html'
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
          left: '75px'
        });
      }
    }
  }
})
.directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
        var fn = $parse(attrs.ngRightClick);
        element.bind('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();
                fn(scope, {$event:event});
            });
        });
    };
})
.directive('contextmenurightclick', function($parse, $compile) {
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
.directive('carddraggable', function($document) {
  //From AngularJS directive example page
  return {
    restrict: 'A',
    scope: {},
    link: function(scope, element, attr) {
        var startX = 0, startY = 0;

        //calculate where the card portal is
        var cardPortal = document.getElementById('cardPortal').getBoundingClientRect();
        var gameBoard = document.getElementById('gameBoard').getBoundingClientRect();
        console.log("gameboard", gameBoard);
        console.log("cardPortal", cardPortal);
        var y = (gameBoard.bottom - gameBoard.top)/4 + (cardPortal.top/currentZoom) + (125/currentZoom);
        var x = (gameBoard.right - gameBoard.left)/4 + (cardPortal.left/currentZoom) + (45/currentZoom);
        element.css({
          top: y + 'px',
          left: x + 'px'
        });

        element.css({
         position: 'absolute',
         cursor: 'pointer',
         display: 'block'
        });

        element.on('mousedown', function(event) {
          // Prevent default dragging of selected content
          event.preventDefault();

          startX = (event.clientX/currentZoom) - x;
          startY = (event.clientY/currentZoom) - y;

          // console.log('x', x);
          // console.log('y', y);
          // console.log('startX', startX);
          // console.log('startY', startY);
          // console.log('event x', event.clientX);
          // console.log('event y', event.clientY);
          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });


        function mousemove(event) {
          // console.log('x', x);
          // console.log('y', y);
          // console.log('startX', startX);
          // console.log('startY', startY);
          // console.log('event x', event.clientX);
          // console.log('event y', event.clientY);


            y = ((event.clientY/currentZoom) - startY);
            x = ((event.clientX/currentZoom) - startX);

            // console.log('x', x);
            // console.log('y', y);
            // console.log('startX', startX);
            // console.log('startY', startY);
            // console.log('event x', event.clientX);
            // console.log('event y', event.clientY);
            element.css({
              top: y + 'px',
              left:  x + 'px'
            });
        }


        function mouseup() {
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }
      }
    }
})
.directive('draggable', function($document) {
  //From AngularJS directive example page
  return function(scope, element, attr) {
    var startX = 150, startY = 0, x = 150, y = 0;

    //Set the starting coords for the gameBoard
    if(element[0].id == "gameBoard"){
      var gameBoard = document.getElementById('gameBoard').getBoundingClientRect();
      console.log(gameBoard);
      startX = gameBoard.left;
      startY = gameBoard.top;
      x = gameBoard.left;
      y = gameBoard.top;
    }

    element.css({
     position: 'absolute',
     cursor: 'pointer',
     display: 'block',
     left: x + 'px'
    });
    element.on('mousedown', function(event) {
      // Prevent default dragging of selected content
      if(event.target.tagName != "INPUT"){
        event.preventDefault();
      }

      //make sure the gameBoard doesnt move when a card is dragged
      if(event.target.classList.contains('createdCard')){
        return;
      }

      startX = (event.clientX - x);
      startY = (event.clientY - y);

      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);
    });


    function mousemove(event) {

        y = (event.clientY - startY);
        x = (event.clientX - startX);

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
