$(function() {
    console.log("Application started");

    // Update the variables below with your applicationID and applicationSecret strings
    var applicationID = "b6f834105aed11eabf7e77d14e87b936",
        applicationSecret = "LzUG5l0iM9YproZTONXSkwnRmeAl7cEWrxSyg3ziSHlPpOVGVA8YY5lC2R6B0IwT";

    var RainbowUsername, RainbowPassword, RainbowBubbleId;

    // Define input stuff
    var input = document.getElementById("submission");

    // Define two buttons
    var submitButton = document.getElementById('submit');
    var endChatButton = document.getElementById('endChat');
    var status = document.getElementById('status');

    // Button event listener
    submitButton.addEventListener("click", function(){
        var htmldata = "<div class=\"ms-Grid-row\"><p style=\"margin-left: 20px; margin-right: 20px; margin-top:10px; padding:8px; background-color: #efefef; text-align: left;\"><i class=\"ms-Icon ms-Icon--SkypeMessage\" aria-hidden=\"true\"></i>" + input.value + "</p></div>";
        var container = document.getElementById('sentMessages');
        container.insertAdjacentHTML('beforeend', htmldata);
        var bubble = rainbowSDK.bubbles.getBubbleById(RainbowBubbleId);
        /*
        .then(function(object){
            console.log("bubble retrieved,", object);
            return object;
        }).catch(function(err){
            console.log("Bubble retrieve failed.");
        });
        */
        rainbowSDK.im.sendMessageToBubble(bubble, input.value);
        input.value="";
        // Add info to your own table
        /*
        var htmldata = "<div class=\"ms-Grid-row\"><p style=\"margin-left: 20px; margin-right: 20px; margin-top:10px; padding:8px; background-color: #efefef; text-align: left;\"><i class=\"ms-Icon ms-Icon--SkypeMessage\" aria-hidden=\"true\"></i>" + input.value + "</p></div>";
        var container = document.getElementById('sentMessages');
        container.insertAdjacentHTML('beforeend', htmldata);
        */
    });

    endChatButton.addEventListener("click", function(){
        var data={"bubbleid": RainbowBubbleId};
        var xhttp = new XMLHttpRequest();
        xhttp.open('POST', 'endChat', true);
        xhttp.setRequestHeader('Content-Type','application/json');
        xhttp.send(JSON.stringify(data));
    });

    // Execute a function when the user releases a key on the keyboard
    input.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            submitButton.click();
        }
    });

    /* Bootstrap the SDK */
    angular.bootstrap(document, ["sdk"]).get("rainbowSDK");

    /* Callback for handling the event 'RAINBOW_ONREADY' */
    var onReady = function onReady() {
        // Use of ajax to fetch result
        console.log("Fetching result");
         var data=localStorage.getItem('category');
        var dataTosend={"cat": data};
        var xhttp = new XMLHttpRequest();
        xhttp.open('POST', 'guestLogin', true);
        xhttp.setRequestHeader('Content-Type','application/json');
        // send the data over to server
        xhttp.send(JSON.stringify(dataTosend));
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var result = JSON.parse(this.responseText);
                RainbowUsername = result.Username;
                RainbowPassword = result.Password;
                RainbowBubbleId = result.BubbleId;
                console.log("Data fetched");
                console.log("bubble id is:", RainbowBubbleId);
                
                // Sign in to rainbow
                rainbowSDK.connection.signin(RainbowUsername, RainbowPassword)
                               .then(function(object) {
                                status.innerHTML = 'Agent connected';
                                    console.log("User login successful", object);
                                })
                                .catch(function(err) {
                                    console.log("User login failed", err);
                                });
                console.log("Bubble id is", RainbowBubbleId);
            }else if(this.status != 200){
                console.log("Wrong when fetching data from api");
            }
        };
    }

    /* Callback for handling the event 'RAINBOW_ONCONNECTIONSTATECHANGED' */
    var onLoaded = function onLoaded() {
        console.log("SDK Loading");

        rainbowSDK
            .initialize(applicationID, applicationSecret)
            .then(function() {
                console.log("initialized sdk");
            })
            .catch(function(err) {
                console.log("initialization error", err);
            });
    };

    // Im handler
    var onNewMessageReceived = function onNewMessageReceived(event) {
        console.log("I received new message");
        var htmldata = "<div class=\"ms-Grid-row\"><p style=\"margin-left: 20px; margin-right: 20px; margin-top:10px; padding:8px; background-color: #efefef; text-align: left;\"><i class=\"ms-Icon ms-Icon--DelveAnalyticsLogo\" aria-hidden=\"true\"></i>" + event.detail.message.data + "</p></div>";
        var container = document.getElementById('sentMessages');
        container.insertAdjacentHTML('beforeend', htmldata);
    }

    // add event listener
    document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, onNewMessageReceived)
    /* Listen to the SDK event RAINBOW_ONREADY */
    document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady)
    /* Listen to the SDK event RAINBOW_ONLOADED */
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded)
    /* Load the SDK */
    rainbowSDK.load();
});