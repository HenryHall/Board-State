var myApp = angular.module('myApp', []);

var currentZoom = 1;

myApp.controller('homeController', ['$scope', '$http', function($scope, $http){

  //List of partials
  $scope.tabURL = {
    main: "../views/templates/home/main.html",
    quickStart: "../views/templates/home/quickStart.html",
    about: "../views/templates/home/about.html"
  };

  //Initialize the page to the 'main' partial
  $scope.active = 1;

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


myApp.controller('quickStartController', ['$scope', '$http', '$window',  function($scope, $http, $window){

  //Initialize data
  $scope.allSets = {};
  $scope.createdCardArray = [];
  $scope.uniqueID = 0;
  $scope.playerLife = 20;

  //Load the card data
  $http({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/HenryHall/Board-State/master/public/JSon/AllSets-x.json'
  })
  .then(function(data){
    $scope.allSets = data.data;
    console.log($scope.allSets);

    //Create suggestion array
    $scope.allCardNames = [];
    for (set in $scope.allSets){
      for (var i=0; i<$scope.allSets[set].cards.length; i++){
        $scope.allCardNames.push($scope.allSets[set].cards[i].name);
      }
    }

    //cardPortalInput is now ready to be used
    document.getElementById('cardPortalInput').removeAttribute("readonly");

    //Add a demo card: Phyrexian Metamorph
    var newCardInfo = findCard('Phyrexian Metamorph');
    if (newCardInfo == undefined){
      console.log("No card with that name was found.");
      return;
    }

    var newCardElement = createNewCardElement(newCardInfo);
    $scope.createdCardArray.push(newCardElement);

  });

  $scope.clearInput = function(){
    $scope.newCardModel = "";
  };

  $scope.selectSuggestion = function(cardName){
    $scope.newCardModel = cardName;
    document.getElementById('cardPortalInput').select();
    document.getElementById('suggestions').style.display = 'none';
  };

  $scope.selectZoneSuggestion = function(cardName){
    $scope.newCurrentZoneCard = cardName;
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

    $scope.$emit('form:submit');

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
            // console.log($scope.allSets[i].cards[j]);
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
    newCard.tapped = false;

    newCard.style = {
      "background-image": "url('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + cardInfo.multiverseid + "&type=card')",
      "background-size": "cover",
      "background-color": "trasnparent",
      height: '155px',
      width: '111px',
      'z-index': 100
    };


    if(cardInfo.layout == "double-faced"){
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



    if(cardInfo.types.indexOf("Creature") != -1) {
      newCard.powerToughness = cardInfo.power + "/" + cardInfo.toughness;
      newCard.types = cardInfo.types;
    } else {
      newCard.powerToughness = "";
    }

    if(cardInfo.type.indexOf("Planeswalker") != -1){
      newCard.loyalty = cardInfo.loyalty;
    }

    return newCard;
  }//End createNewCardElement


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

  $scope.tapCard = function(card){
    card.tapped = !card.tapped;
  };

  $scope.removeCard = function(index){
    $scope.createdCardArray.splice(index, 1);
  };

  $scope.inspectCard = function(card){
    //Lock scroll
    document.body.style.overflow = 'hidden';

    $scope.inspectModalInfo = card.info;
    var inspectModal = document.getElementById('inspectModal');
    inspectModal.style.display = 'block';
    inspectModal.style.top = $window.pageYOffset + 'px';
    inspectModal.style.left = $window.pageXOffset + 'px';
    document.getElementById('inspectCardImage').style.backgroundImage = card.style['background-image'];
  };

  $scope.closeInspect = function(){
    //Lock scroll
    document.body.style.overflow = 'auto';

    document.getElementById('inspectModal').style.display = 'none';
  };

  $scope.fixInspectText = function(text){
    if (text) {
      return text.replace(/↵/g, /n/);
    }
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


  $scope.setRedCounters = function(card){
    var promptMessage = "Set the amount of red counters you would like on " + card.name + ". (0-99)"
    var redCounterPrompt = prompt(promptMessage);

    //Validate
    if (typeof parseInt(redCounterPrompt) != 'number' || parseInt(redCounterPrompt) > 99 || parseInt(redCounterPrompt) < 0){
      alert("Please enter a number 0-99.");
      return;
    }

    if (redCounterPrompt == 0){
      card.redCounters = undefined;
    } else {
      card.redCounters = redCounterPrompt;
    }

  };


  $scope.setBlueCounters = function(card){
    var promptMessage = "Set the amount of blue counters you would like on " + card.name + ". (0-99)"
    var blueCounterPrompt = prompt(promptMessage);

    //Validate
    if (typeof parseInt(blueCounterPrompt) != 'number' || parseInt(blueCounterPrompt) > 99 || parseInt(blueCounterPrompt) < 0){
      alert("Please enter a number 0-99.");
      return;
    }

    if (blueCounterPrompt == 0){
      card.blueCounters = undefined;
    } else {
      card.blueCounters = blueCounterPrompt;
    }

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


  $scope.incrementLife = function(){
    $scope.playerLife++;
  };


  $scope.decrementLife = function(){
    $scope.playerLife--;
  };

  // $scope.goHome = function(){
  //   $scope.$parent.active = 0;
  // };

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

  $scope.currentState = 1;
  $scope.previousState = function(){
    if ($scope.currentState - 1 < 1){
      return;
    }

    $scope.currentState--;
  };


  $scope.nextState = function(){
    if ($scope.currentState == 4){
      return;
    }

    $scope.currentState++;
  };

  $scope.getPreviousState = function(){
    if ($scope.currentState - 1 == 0){
      return "-";
    } else {
      return ($scope.currentState - 1);
    }
  };

  $scope.getNextState = function(){
    $scope.states = 4;
    if ($scope.currentState + 1 > $scope.states){
      return "N";
    } else {
      return ($scope.currentState + 1);
    }
  };

  $scope.zoom = 100;
  $scope.elementScale = 1;

  $scope.zoomOut = function(){
    if ($scope.zoom == 50){
      return;
    }
    $scope.zoom -= 10;
    $scope.elementScale = $scope.zoom/100;
  };

  $scope.zoomIn = function(){
    if ($scope.zoom == 200){
      return;
    }
    $scope.zoom += 10;
    $scope.elementScale = $scope.zoom/100;
  };


}])
.filter('cardFilter', function(){
  return function(input, model){

    input = input || '';
    var output = [];
    var maxCount = 0;

    //Only filter after at least 2 characters have been entered
    if (model && model.length > 1){

      //Search for matches starting at index 0 first
      for (var i=0; i<input.length; i++){
        if (input[i].toLowerCase().indexOf(model.toLowerCase()) == 0 && output.indexOf(input[i]) == -1){
          output.push(input[i]);
          maxCount++;
          if (maxCount == 10){return output;}
        }
      }

      //Then search at any index
      for (var i=0; i<input.length; i++){
        if (input[i].toLowerCase().indexOf(model.toLowerCase()) !== -1 && output.indexOf(input[i]) == -1){
          output.push(input[i]);
          maxCount++;
          if (maxCount == 10){return output;}
        }
      }

    }

    return output;
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
.directive('cardPortal', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/templates/boardState/cardPortal.html',
    controllerAs: 'createCardController',
    replace: true,
    link: function(scope, element, attrs){

      //Set cardPortal input to readonly until card data is loaded
      document.getElementById('cardPortalInput').setAttribute("readonly", "true");

      //Traverse the suggestions
      var index;

      scope.$on('form:submit', function(){
        //Form was submitted
        index = undefined;
        document.getElementById('suggestions').style.display = 'none';
      });

      element.on('keydown', function(event){

        document.getElementById('suggestions').style.display = 'block';

        var keyPress = event.which;
        var suggestions = document.querySelectorAll('.suggestion a');

        if (suggestions.length !== 0){

          if(keyPress == 9 || keyPress == 40){
            //Tab or down arrow key
            if(index == undefined){
              index = 0;
            } else if(suggestions[index + 1]) {
              index++;
            } else {
              index = 0;
            }
            //Prevent tabbing to new element
            event.preventDefault();
            suggestions[index].focus();
          } else if(keyPress == 38){
            //Up arrow
            if(suggestions[index - 1]){
              index--;
              suggestions[index].focus();
            } else {
              index = suggestions.length - 1;
              suggestions[index].focus();
            }
          }
        }


      });
    }
  }
})
.directive('cardportaldraggable', function($document) {
  //From AngularJS directive example page
  return function(scope, element, attr) {

    var startX;
    var startY;
    var x = 0, y = 0;

    element.css({
     position: 'relative',
     cursor: 'move',
     display: 'block'
    });

    element.on('mousedown', function(event) {
      // Allow focus
      if(event.target.tagName == "INPUT"){
        event.target.focus();
      } else {
        event.preventDefault();
      }


      startX = ((event.clientX/currentZoom) - x);
      startY = ((event.clientY/currentZoom) - y);

      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);
    });


    function mousemove(event) {

        y = ((event.clientY/currentZoom) - startY);
        x = ((event.clientX/currentZoom) - startX);

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
})
.directive('carddraggable', function($document, $window) {
  return {
    restrict: 'A',
    scope: {},
    link: function(scope, element, attr) {
        var x = 0, y = 0;
        var startX, startY;


        //calculate where the card cradle is
        var createdCardCradle = document.getElementById('createdCardCradle').getBoundingClientRect();
        var y = (createdCardCradle.top + $window.pageYOffset);
        var x = (createdCardCradle.left + $window.pageXOffset);

        element.css({
         position: 'absolute',
         cursor: '-webkit-grab',
         display: 'block',
         top: y + 'px',
         left: x + 'px'
        });

        element.on('mousedown', function(event) {
          // Prevent default dragging of selected content
          event.preventDefault();

          element.css({
            cursor: '-webkit-grabbing'
          });

          startX = (event.clientX - x);
          startY = (event.clientY - y);

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        });


        function mousemove(event) {

          x = ((event.clientX/currentZoom) - startX);
          y = ((event.clientY/currentZoom) - startY);

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
.directive('customContextMenu', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/templates/boardState/customContextMenu.html',
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
.directive('contextmenurightclick', function($compile) {
    return function(scope, element, attrs) {
        element.on('contextmenu', function(event) {
            scope.$apply(function() {
                event.preventDefault();

                var body = angular.element(document.body);

                if (element.hasClass('createdCard')){
                  body.append(($compile('<custom-context-menu />')(scope)).addClass('customContextMenu').css({
                    left: (event.pageX-10) + 'px',
                    top: (event.pageY-10) + 'px',
                    'z-index': 1001
                  }));
                } else if (element.hasClass('currentZoneCard')){
                  body.append(($compile('<other-zone-context-menu />')(scope)).addClass('customContextMenu').css({
                    left: (event.pageX-10) + 'px',
                    top: (event.pageY-10) + 'px',
                    'z-index': 1001
                  }));

                }

            });
        });
    };
});
