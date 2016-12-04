var myApp = angular.module('myApp', []);

var currentZoom = 1;

myApp.controller('createCardController', ['$scope', '$http', '$location', function($scope, $http, $location){

  $scope.allSets = {};
  $scope.createdCardArray = [];
  $scope.uniqueID = 0;
  $scope.ui = {
    all: false
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

  $scope.states = [];
  $scope.currentState = 1;

  $http({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/HenryHall/MtgJsonTest/gh-pages/JSon/AllSets.json'
  })
  .then(function(data){
    $scope.allSets = data.data;
    console.log($scope.allSets);
  });

  var boardStateParams = $location.search().stateId;
  console.log("Sending:", boardStateParams);
  $http({
    method: 'GET',
    url: '/boardStates/' + boardStateParams
  }).then(function(data){
    $scope.states = data.data.allStates;
    console.log($scope.states);

    for (var i=0; i<$scope.states.length; i++){
      console.log("i", i);
      if ($scope.states[i].stateNumber == 1) {
        //load it
        console.log("Loading state");
        $scope.createdCardArray = $scope.states[i].createdCardArray;
        $scope.gameStats = $scope.states[i].gameStats;
        $scope.currentState = $scope.states[i].stateNumber;
        // return;
      }
    }
  });


  $scope.clearInput = function(){
    $scope.newCardModel = "";
  };


  $scope.saveState = function(){

    //Get the current coordinates of each card
    var allCreatedCards = document.querySelectorAll('.createdCard');
    var currentIndex;

    //Save them to the card array
    for (var i=0; i<allCreatedCards.length; i++){
      currentIndex = allCreatedCards[i].dataset.index;
      $scope.createdCardArray[currentIndex].style.top = allCreatedCards[i].style.top;
      $scope.createdCardArray[currentIndex].style.left = allCreatedCards[i].style.left;
    }

    //New state
    var newState = {
      stateNumber: $scope.currentState,
      createdCardArray: $scope.createdCardArray,
      gameStats: $scope.gameStats
    };

    newState = angular.copy(newState);
    console.log(newState);


    //See if this state already has a save
    for (var i=0; i<$scope.states.length; i++){
      if ($scope.states[i].stateNumber == $scope.currentState){

        //Save the state
        $scope.states[i] = newState;
        console.log("All states", $scope.states);
        console.log("Current State", $scope.currentState);

        var newToast = {
          type: "success",
          message: "Your state has been saved as state " + $scope.currentState + "!",
          duration: 5
        };

        return toast(newToast);
      }
    }


    //Add new state
    $scope.states.push(newState);
    console.log("New State", newState);
    console.log("All states", $scope.states);
    console.log("Current State", $scope.currentState);

    var newToast = {
      type: "success",
      message: "A new state has been saved!",
      duration: 5
    };

    return toast(newToast);

  };


  function toast(newToast){
    //accepts an object with three fields: type, message, duration(seconds)

    var newStyle;
    switch (newToast.type.toLowerCase()) {
      case 'success':
        newStyle = {
          'background-color': 'rgb(223, 240, 216)',
          color: '#3c763d'
        };
        break;

      case 'info':
        newStyle = {
          'background-color': 'rgb(218, 237, 247)',
          color: '#31708f'
        };
        break;

      case 'warning':
        newStyle = {
          'background-color': 'rgb(252, 248, 227)',
          color: '#8a6d3b'
        };
        break;


      case 'danger':
        newStyle = {
          'background-color': 'rgb(242, 222, 222)',
          color: '#a94442'
        };
        break;


      default:
        newStyle = {
          'background-color': '#ff7674',
          color: '#fc2a27'
        };

    }

    $scope.toastStyle = newStyle
    $scope.toastMessage = newToast.message;

    //display the element
    var alertToast = document.getElementById('alertToast');
    alertToast.style.display = "block";
    alertToast.style.opacity = 1;
    alertToast.style.transition = 'opacity ' + newToast.duration + 's';

    setTimeout(function(){
      alertToast.style.display = "none";
    }, (newToast.duration * 1000));

    // alertToast.style.opacity = 0;

  }


  $scope.saveFinish = function(){

    //Make sure the state is saved
    isStateSaved();

    var confirmSaveAndFinish = confirm('Are you sure you would like to finish and upload your states?  Once you do this you cannot edit it.');
    if (!confirmSaveAndFinish) {
      return;
    }

    $http({
      method: 'POST',
      url: '/saveStates',
      data: $scope.states
    }).then(function(data){
      console.log(data.data);
      toast({type: 'success', message: 'Your state has been successfully uploaded!', duration: 5});
    });

  };


  function isStateSaved(){

    //Check to see if the current state is saved
    var newState = {
      stateNumber: $scope.currentState,
      createdCardArray: $scope.createdCardArray,
      gameStats: $scope.gameStats
    };

    //find curent state
    var stateCheck;
    for (var i=0; i<$scope.states.length; i++){
      if ($scope.states[i].stateNumber == $scope.currentState){
        stateCheck = $scope.states[i];
      }
    }

    if(angular.equals(stateCheck, newState)){
      console.log("There were no changes to the state");
    } else {
      var statePrompt = confirm("There are unsaved changes to this state. Would you like to save first?");
      if (statePrompt){
        $scope.saveState();
      } else {
        toast({type: "warning", message: "State " + $scope.currentState + " was not saved.", duration: 3});
        return false;
      }
    }

  }


  $scope.previousState = function(){

    if ($scope.currentState - 1 < 1){
      toast({type: 'warning', message: "There is no previous state!", duration: 3});
      return;
    }

    //Find the previous state
    for (var i=0; i<$scope.states.length; i++){
      if ($scope.states[i].stateNumber == $scope.currentState - 1) {
        console.log("In previous with states[i]", $scope.states[i].stateNumber, " and current state", $scope.currentState);
        //Make sure the state is saved
        isStateSaved();
        //Then load
        $scope.createdCardArray = $scope.states[i].createdCardArray;
        $scope.gameStats = $scope.states[i].gameStats;
        $scope.currentState = $scope.states[i].stateNumber;
        console.log("Current State:", $scope.currentState);
        return;
      }
    }
    console.log("No previous state was found.  Current State:", $scope.currentState);

  };


  $scope.nextState = function(){

    //Make sure the state is saved
    isStateSaved();

    //See if there were any changes from the previous state
    var stateCheck;

    var currentStateObject = {
      stateNumber: $scope.currentState - 1,
      createdCardArray: $scope.createdCardArray,
      gameStats: $scope.gameStats
    };

    for (var i=0; i<$scope.states.length; i++){
      if ($scope.states[i].stateNumber == $scope.currentState - 1){
        stateCheck = $scope.states[i];
      }
    }

    if(angular.equals(stateCheck, currentStateObject)){
      toast({type: "warning", message: "There were no changes to this state from the previous.  The state was not changed.", duration: 3});
      return;
    }

    //See if the next state exists
    for (var i=0; i<$scope.states.length; i++){
      if ($scope.states[i].stateNumber == $scope.currentState + 1) {
        //It exists, load it
        $scope.createdCardArray = $scope.states[i].createdCardArray;
        $scope.gameStats = $scope.states[i].gameStats;
        $scope.currentState = $scope.states[i].stateNumber;
        return;

      }
    }

    //Create a new state
    console.log($scope.currentState);
    $scope.currentState += 1;
    console.log($scope.currentState);

  };


  $scope.getPreviousState = function(){
    if ($scope.currentState - 1 == 0){
      return "-";
    } else {
      return ($scope.currentState - 1);
    }
  };


  $scope.getNextState = function(){
    if ($scope.currentState + 1 > $scope.states.length){
      return "N";
    } else {
      return ($scope.currentState + 1);
    }
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
        "background-image": "url('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + cardInfo.multiverseid + "&type=card')",
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
      "background-image": "url('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + cardInfo.multiverseid + "&type=card')",
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


  $scope.inspectCard = function(backgroundUrl){
    document.getElementById('inspectModal').style.display = 'block';
    document.getElementById('inspectCardImage').style.backgroundImage = backgroundUrl;
  };


  $scope.closeInspect = function(){
    document.getElementById('inspectModal').style.display = 'none';
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

    var newCardElement = createNewCardElement($scope.createdCardArray[index].info);
    newCardElement.powerToughness = $scope.createdCardArray[index].powerToughness;
    $scope.createdCardArray.push(newCardElement);

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


  $scope.hideOtherZones = function(){
    document.getElementById('otherZones').style.left = '-400px';
  };


  $scope.viewZone = function(player, zone){

    //Decide if the div should open, close or do nothing
    if (document.getElementById('otherZones').style.left == '-400px' || $scope.currentZone == undefined) {
      document.getElementById('otherZones').style.left = '150px';
    } else if (player == $scope.currentPlayer && zone == $scope.currentZone) {
      document.getElementById('otherZones').style.left = '-400px';
    }

    $scope.currentPlayer = player;
    $scope.currentZone = zone;

    //Set the array that should be used with ng-repeat card displaying
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
.directive('contextmenurightclick', function($compile) {
    return function(scope, element, attrs) {
        element.on('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();

                var body = angular.element(document.body);
                body.append(($compile('<custom-context-menu />')(scope)).addClass('customContextMenu').css({
                  left: (event.pageX-10) + 'px',
                  top: (event.pageY-10) + 'px',
                  'z-index': 1001
                }));

            });
        });
    };
})
.directive('carddraggable', function($document) {
  return {
    restrict: 'A',
    scope: {},
    link: function(scope, element, attr) {
        var startX = 0, startY = 0;


        //calculate where the card portal is
        var cardPortal = document.getElementById('cardPortal').getBoundingClientRect();
        var gameBoard = document.getElementById('gameBoard').getBoundingClientRect();
        // console.log("gameboard", gameBoard);
        // console.log("cardPortal", cardPortal);
        var y = (gameBoard.bottom - gameBoard.top)/4 + (cardPortal.top/currentZoom) + (125/currentZoom);
        var x = (gameBoard.right - gameBoard.left)/4 + (cardPortal.left/currentZoom) + (45/currentZoom);
        element.css({
          top: y + 'px',
          left: x + 'px'
        });

        //Correct the start coords on state change
        if (attr.toplocation){
          y = parseInt(attr.toplocation);
          element.css({top: attr.toplocation});
        }

        if (attr.leftlocation){
          x = parseInt(attr.leftlocation);
          element.css({top: attr.leftlocation});
        }

        element.css({
         position: 'absolute',
         cursor: '-webkit-grab',
         display: 'block'
        });

        element.on('mousedown', function(event) {
          // Prevent default dragging of selected content
          event.preventDefault();

          element.css({
            cursor: '-webkit-grabbing'
          })

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
          element.css({
            cursor: '-webkit-grab'
          })
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
      startX = gameBoard.left;
      startY = gameBoard.top;
      x = gameBoard.left;
      y = gameBoard.top;
    }

    element.css({
     position: 'absolute',
     cursor: 'move',
     display: 'block',
     left: x + 'px'
    });

    element.on('mousedown', function(event) {
      // Allow focus
      if(event.target.tagName != "INPUT"){
        event.preventDefault();
      }

      //Make sure the gameBoard doesnt move when a card is dragged
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