var myApp = angular.module('myApp', []);

var currentZoom = 1;

myApp.controller('createCardController', ['$scope', '$http', '$location', '$window', function($scope, $http, $location, $window){

  //Initialize data
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
    stack: [],
    description: ""
  };

  $scope.states = [];
  $scope.currentState = 1;

  $scope.toasts = [];
  var toastId = 0;


  //If this is a preloaded state, get the data
  if($location.search().stateId !== undefined){

    var boardStateParams = $location.search().stateId;
    $scope.uploadString = boardStateParams;
    console.log("Sending:", boardStateParams);
    $http({
      method: 'GET',
      url: '/boardStates/' + boardStateParams
    }).then(function(data){

      if (data.status == 204){
        //There was no board state found with that hash
        toast({type: 'Danger', message: "There was no Board State found with this url.", duration: 30});
        return;
      }

      $scope.states = data.data.allStates;

      $scope.bStateTitle = data.data.info.title;
      $scope.bStateUsername = data.data.info.username;
      $scope.bStateCategory = data.data.info.category;
      $scope.bStateDescription = data.data.info.description;
      $scope.bStateDate = data.data.info.date;

      document.getElementById('cardPortal').style.display = 'none';


      for (var i=0; i<$scope.states.length; i++){
        //Save the state
        $scope.createdCardArray = $scope.states[i].createdCardArray;
        $scope.gameStats = $scope.states[i].gameStats;
        $scope.currentState = $scope.states[i].stateNumber;
        $scope.saveState();
      }

      for (var i=0; i<$scope.states.length; i++){
        if ($scope.states[i].stateNumber == 1) {
          //load first state
          console.log("Loading state");
          $scope.createdCardArray = $scope.states[i].createdCardArray;
          $scope.gameStats = $scope.states[i].gameStats;
          $scope.currentState = $scope.states[i].stateNumber;
          setCardPositions();
          if($scope.gameStats.description){
            document.getElementById('stateDescription').style.bottom = '0px';
          }
          toast({type: "Success", message: "Board State Successfuly Loaded!", duration: 3});
          document.getElementById('infoModal').style.display = 'block';
          return;
        }
      }
    });

  }


  //Load the card data
  toast({type: "Warning", message: "Loading Card Data...", duration: 5});
  $http({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/HenryHall/Board-State/master/public/JSon/AllSets.json'
    // url: 'https://raw.githubusercontent.com/HenryHall/Board-State/master/public/JSon/AllSets-x.json'
  })
  .then(function(data){
    $scope.allSets = data.data;
    console.log($scope.allSets);

    //Load tokens and add to allSets under 'Tokens'
    $http({
      method: 'GET',
      url: 'https://raw.githubusercontent.com/HenryHall/Board-State/master/public/JSon/tokens.json'
    })
    .then(function(data){
      $scope.allSets.tokens = {};
      $scope.allSets.tokens.cards = data.data;

      //Create suggestion array
      $scope.allCardNames = [];
      for (set in $scope.allSets){
        for (var i=0; i<$scope.allSets[set].cards.length; i++){
          $scope.allCardNames.push($scope.allSets[set].cards[i].name);
        }
      }

      //cardPortalInput is now ready to be used
      document.getElementById('cardPortalInput').removeAttribute("readonly");

      toast({type: "Success", message: "Card Data Successfuly Loaded!", duration: 3});

    });


  });

  function setCardPositions(){

    var gameBoard = document.getElementById('gameBoard')
    console.log(gameBoard);

    for (var i=0; i<$scope.createdCardArray.length; i++){
      $scope.createdCardArray[i].style.top = ((gameBoard.offsetHeight) * (parseInt($scope.createdCardArray[i].positionPercent.top)/100)) + 'px';
      $scope.createdCardArray[i].style.left = ((gameBoard.offsetWidth) * (parseInt($scope.createdCardArray[i].positionPercent.left)/100)) + 'px';
    }
    return;
  }


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


  $scope.saveState = function(){

    //Get the current coordinates of each card
    var allCreatedCards = document.querySelectorAll('.createdCard');
    var currentIndex;
    var gameBoard = document.getElementById('gameBoard');

    //Save them to the card array
    for (var i=0; i<allCreatedCards.length; i++){
      currentIndex = allCreatedCards[i].dataset.index;

      $scope.createdCardArray[currentIndex].style.top = allCreatedCards[i].style.top;
      $scope.createdCardArray[currentIndex].style.left = allCreatedCards[i].style.left;

      //Store the position percentages
      $scope.createdCardArray[currentIndex].positionPercent = {};
      $scope.createdCardArray[currentIndex].positionPercent.top = parseInt(allCreatedCards[i].style.top) * 100 / (gameBoard.offsetHeight) + '%';
      $scope.createdCardArray[currentIndex].positionPercent.left = parseInt(allCreatedCards[i].style.left) * 100 / (gameBoard.offsetWidth) + '%';
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
          duration: 3
        };

        return toast(newToast);
      }
    }


    //No saves found, add new state
    $scope.states.push(newState);
    console.log("New State", newState);
    console.log("All states", $scope.states);
    console.log("Current State", $scope.currentState);

    var newToast = {
      type: "success",
      message: "A new state has been saved!",
      duration: 3
    };

    return toast(newToast);

  };


  function toast(newToast){
    //accepts an object with three fields: type, message, duration(seconds)

    var toastToPush = {};
    var newStyle;
    switch (newToast.type.toLowerCase()) {
      case 'success':
        newStyle = {
          'background-color': 'rgb(223, 240, 216)',
          color: '#3c763d',
          border: '2px solid #d6e9c6'
        };
        break;

      case 'info':
        newStyle = {
          'background-color': 'rgb(218, 237, 247)',
          color: '#31708f',
          border: '2px solid #bce8f1'
        };
        break;

      case 'warning':
        newStyle = {
          'background-color': 'rgb(252, 248, 227)',
          color: '#8a6d3b',
          border: '2px solid #faebcc'
        };
        break;


      case 'danger':
        newStyle = {
          'background-color': 'rgb(242, 222, 222)',
          color: '#a94442',
          border: '2px solid #ebccd1'
        };
        break;


      default:
        newStyle = {
          'background-color': '#ff7674',
          color: '#fc2a27'
        };

    }

    toastToPush.toastStyle = newStyle;
    toastToPush.toastMessage = newToast.message;
    toastToPush.id = toastId;
    toastId++;
    $scope.toasts.push(toastToPush);

    setTimeout(function(){
      for(var i=0; i<$scope.toasts.length; i++){
        if($scope.toasts[i].id == toastToPush.id){
          $scope.toasts.splice(i, 1);
          $scope.$apply();
        }
      }
    }, (newToast.duration * 1000));

  }


  $scope.saveFinish = function(){

    //Make sure the state is saved
    isStateSaved();

    document.getElementById('saveModal').style.display = "block";
  };


  $scope.showInfoModal = function(){
    document.getElementById('infoModal').style.display = "block";
  };


  $scope.saveFinishConfirm = function(){

    var confirmSaveAndFinish = confirm('Are you sure you would like to finish and upload your states?  Once you do this you cannot edit it.');
    if (!confirmSaveAndFinish) {
      return;
    }

    //Make sure the form is valid
    if ($scope.bStateTitle.length > 50){
      toast({type: 'Danger', message: 'Your title is too long.', duration: 5});
      return;
    } else if ($scope.bStateUsername.length > 25){
      toast({type: 'Danger', message: 'Your username is too long.', duration: 5});
      return;
    } else if (!$scope.bStateCategory) {
      toast({type: 'Danger', message: 'Please select a category.', duration: 5});
      return;
    } else if ($scope.bStateDescription.length > 300) {
      toast({type: 'Danger', message: 'Your description is too long.', duration: 5});
      return;
    }

    //Remove the variants from cards, otherwise file size is massive
    for (var i=0; i<$scope.states.length; i++){
      for (var j=0; j<$scope.states[i].createdCardArray.length; j++){
        var currentCard = $scope.states[i].createdCardArray[j];
        if (currentCard.info.variant){
          delete currentCard.info.variant;
        }
      }
    }

    var newData = {
      allStates: $scope.states,
      info: {
        title: $scope.bStateTitle,
        username: $scope.bStateUsername,
        category: $scope.bStateCategory,
        description: $scope.bStateDescription
      }
    }


    $http({
      method: 'POST',
      url: '/saveStates',
      data: newData
    }).then(function(data){
      console.log(data.data);
      $scope.uploadString = data.data;
      toast({type: 'success', message: 'Your state has been successfully uploaded!', duration: 3});
    });

    document.getElementById('saveModal').style.display = 'none';
    document.getElementById('infoModal').style.display = 'block';

  };


  $scope.closeSaveModal = function(){
    document.getElementById('saveModal').style.display = 'none';
  };


  $scope.closeInfoModal = function(){
    document.getElementById('infoModal').style.display = 'none';
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
        toast({type: "warning", message: "State " + $scope.currentState + " was not saved.", duration: 5});
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
        setCardPositions();
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
      toast({type: "warning", message: "There were no changes to this state from the previous.  The state was not changed.", duration: 5});
      return;
    }

    //See if the next state exists
    for (var i=0; i<$scope.states.length; i++){
      if ($scope.states[i].stateNumber == $scope.currentState + 1) {
        //It exists, load it
        $scope.createdCardArray = $scope.states[i].createdCardArray;
        $scope.gameStats = $scope.states[i].gameStats;
        $scope.currentState = $scope.states[i].stateNumber;
        setCardPositions();
        return;

      }
    }

    //Create a new state
    console.log($scope.currentState);
    $scope.createdCardArray = angular.copy($scope.createdCardArray);
    $scope.gameStats = angular.copy($scope.gameStats);
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
    var foundCard;
    for(var i in $scope.allSets){
      for(var j=0; j<$scope.allSets[i].cards.length; j++){

        //Skip mtgjson tokens since we made our own
        if ($scope.allSets[i].cards[j].layout == "token") {
          continue;
        }

        if($scope.allSets[i].cards[j].name.toLowerCase() == cardName.toLowerCase()){
          //Check to see if the image can be loaded
          if($scope.allSets[i].cards[j].multiverseid || $scope.allSets[i].cards[j].picURL){

            //Check to see if this is a variant
            if (foundCard != undefined){
              //It is

              if (!foundCard.variant){
                //First Variant
                foundCard.variant = [];
              }
              var newVariant = $scope.allSets[i].cards[j];
              newVariant.set = i;
              foundCard.variant.push(newVariant);

            } else {
              foundCard = $scope.allSets[i].cards[j];
              foundCard.set = i;
            }

          } else {
            console.log("No Image was found for this card, will continue looking.");
          }
        }
      }
    }
    return foundCard;
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


  function createNewCardElement(cardInfo){
    var newCard = {};

    newCard.uniqueID = $scope.uniqueID++;
    newCard.info = cardInfo;
    newCard.tapped = false;

    newCard.style = {
      "background-size": "cover",
      "background-color": "trasnparent",
      height: '155px',
      width: '111px',
      'z-index': 100
    };

    //Set the image for tokens and non-tokens
    if (cardInfo.picURL) {
      newCard.style["background-image"] = "url('" + cardInfo.picURL + "')";
    } else if (cardInfo.multiverseid) {
      newCard.style["background-image"] = "url('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=" + cardInfo.multiverseid + "&type=card')";
    }


    if(cardInfo.layout == "double-faced"){
      newCard.night = {};
      newCard.night.info = findCard(newCard.info.names[1]);
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



    if(cardInfo.type.indexOf("Creature") != -1) {
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


  $scope.goHome = function(){
    var confirmation = confirm("Are you sure you would like to return to the homepage?");

    if (confirmation == true){
      $window.location.href = "/";
    }
  }


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
    document.getElementById('cardPortal').style.transform = 'scale(' + Math.pow(currentZoom, -1) + ')';
    $scope.zoom = Math.floor(currentZoom * 100);
  }


  $scope.zoomOut = function(){
    if (currentZoom <= .6) {
      return;
    }
    currentZoom = currentZoom - .1;
    $scope.gameBoardStyle.transform = 'scale(' + currentZoom + ')';
    document.getElementById('cardPortal').style.transform = 'scale(' + Math.pow(currentZoom, -1) + ')';
    $scope.zoom = Math.floor(currentZoom * 100);
  }


  $scope.recenterGameBoard = function(){

    //Re-center gameBoard and cardPortal


  };


  $scope.tapCard = function(card){
    card.tapped = !card.tapped;
  };


  $scope.removeCard = function(index){
    $scope.createdCardArray.splice(index, 1);
  };


  $scope.inspectCard = function(card){
    $scope.inspectModalInfo = card.info;
    document.getElementById('inspectModal').style.display = 'block';
    if (card.info.picURL){
      document.getElementById('inspectCardImage').style.backgroundImage = "url('" + card.info.picURL + "')";
    } else {
      document.getElementById('inspectCardImage').style.backgroundImage = card.style['background-image'];
    }
  };


  $scope.closeInspect = function(){
    document.getElementById('inspectModal').style.display = 'none';
  };


  $scope.fixInspectText = function(text){
    if (text) {
      return text.replace(/↵/g, /n/);
    }
  };


  $scope.removeToast = function(toastId){
    for(var i=0; i<$scope.toasts.length; i++){
      if($scope.toasts[i].id == toastId){
        $scope.toasts.splice(i, 1);
      }
    }
  };


  $scope.positionVariants = function(){
    console.log("Here");
    //Set the position of #cardVariants
    var variantHoverZone = document.getElementById('variantHoverZone').getBoundingClientRect();
    console.log(variantHoverZone);
    var cardVariants = document.getElementById('cardVariants');
    // cardVariants.style.top = -variantHoverZone.height + 'px';
    console.log(cardVariants.getBoundingClientRect().top);

    cardVariants.style.top = (3 * variantHoverZone.height) + 'px';
    cardVariants.style.left = variantHoverZone.width + 20 + 'px';

  };


  $scope.chooseVariant = function(card, index, parentIndex){
    //Set the selected variant
    var newVariant = createNewCardElement(card.info.variant[index]);

    // console.log(card.info.variant);
    //
    // card.info.variant.splice(index, 1);
    // card.info.variant.push(card.info);
    // console.log(card.info.variant);
    // delete card.info.variant[card.info.variant.length - 1].variant;
    //
    // console.log(card.info);
    // newVariant.info.variant = card.info.variant;

    $scope.createdCardArray.splice(parentIndex, 1);
    $scope.createdCardArray.push(newVariant);



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


  $scope.duplicateOtherZoneCard = function(index){
    var newCardInfo = findCard($scope.currentZoneCards[index].info.name);
    var newCardElement = createNewCardElement(newCardInfo);
    $scope.currentZoneCards.push(newCardElement);
    positionCurrentZoneCards();
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


  $scope.currentZoneSuggestion = function(event){

    document.getElementById('otherZoneSuggestions').style.display = "block";

    var keyPress = event.which;
    var suggestions = document.querySelectorAll('.otherZonesSuggestion a');

    var index = -1;
    for (var i=0; i<suggestions.length; i++){
      if (document.activeElement == suggestions[i]){
        index = i;
      }
    }

    if (suggestions.length !== 0){

      if(keyPress == 9 || keyPress == 40){
        //Tab or down arrow key
        if (suggestions[index + 1]) {
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
      } else if (keyPress == 13 && $scope.newCurrentZoneCard != suggestions[index].innerHTML){
        //Enter key
        $scope.newCurrentZoneCard = suggestions[index].innerHTML;
        document.getElementById('currentZoneInput').focus();
        document.getElementById('otherZoneSuggestions').style.display = "none";
      }
    }


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

    } else if (player == "The"){
      $scope.currentZoneCards = $scope.gameStats.stack;
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

    } else if ($scope.currentPlayer == "The"){

      $scope.gameStats.stack.push(newCardElement);

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
.directive('gameBoardUi', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/templates/boardState/gameBoardUi.html',
    controllerAs: 'createCardController'
  }
})
.directive('gameStats', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/templates/boardState/gameStats.html'
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
.directive('otherZoneContextMenu', function(){
  return {
    restrict: 'E',
    templateUrl: '../views/templates/boardState/otherZoneContextMenu.html',
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
})
.directive('carddraggable', function($document) {
  return {
    restrict: 'A',
    scope: {},
    link: function(scope, element, attr) {
        var startX = 0, startY = 0;


        //calculate where the card portal is
        var cardPortal = document.getElementById('cardPortal').style;

        var allCards = [].slice.call(document.querySelectorAll('.createdCard'));

        function cardPortalCheck(cardCount, cardArray){

          //calculate how many cards are under the card portal
          for (var i=0; i<cardArray.length; i++){
            if (parseInt(cardArray[i].style.top) == parseInt(cardPortal.top) + 125/currentZoom + (25*cardCount) && parseInt(cardArray[i].style.left) == parseInt(cardPortal.left) + 45/currentZoom + (25*cardCount)){
              cardArray.splice(i, 1);
              cardCount++;
              return cardPortalCheck(cardCount, cardArray);
            }
          }
          return cardCount;

        }

        var cardCount = cardPortalCheck(0, allCards);

        //cardPortal position + offset + offset for additional cards
        var y = parseInt(cardPortal.top) + 125/currentZoom + (25*cardCount);
        var x = parseInt(cardPortal.left) + 45/currentZoom + (25*cardCount);

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
          element.css({
            cursor: '-webkit-grab'
          })
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }
      }
    }
})
.directive('gameboarddraggable', function($document) {
  //From AngularJS directive example page
  return function(scope, element, attr) {

    //Set the starting coords for the gameBoard
    var gameBoard = document.getElementById('gameBoard').getBoundingClientRect();
    var startX = gameBoard.left;
    var startY = gameBoard.top;
    var x = gameBoard.left;
    var y = gameBoard.top;

    element.css({
     position: 'absolute',
     cursor: 'move',
     display: 'block',
     left: x + 'px'
    });

    element.on('mousedown', function(event) {

      event.preventDefault();

      //Make sure the gameBoard doesnt move when another draggable is targeted
      if (event.target.id !== 'gameBoardOpponent' && event.target.id !== 'gameBoardOurs'){
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
})
.directive('cardportaldraggable', function($document) {
  //From AngularJS directive example page
  return function(scope, element, attr) {

    var gameBoard = document.getElementById('gameBoard').getBoundingClientRect();
    var startLeft = (gameBoard.right - gameBoard.left)/4 + 150;
    var startTop = (gameBoard.bottom - gameBoard.top)/4;

    var startX = startLeft;
    var x = startLeft;
    var startY = startTop;
    var y = startTop;

    element.css({
     position: 'absolute',
     cursor: 'move',
     display: 'block',
     left: x + 'px',
     top: y + 'px'
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
});
