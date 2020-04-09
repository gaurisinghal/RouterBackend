$(function() {
    console.log("Application started");

    // Update the variables below with your applicationID and applicationSecret strings
    var applicationID = "b6f834105aed11eabf7e77d14e87b936",
        applicationSecret = "LzUG5l0iM9YproZTONXSkwnRmeAl7cEWrxSyg3ziSHlPpOVGVA8YY5lC2R6B0IwT";

    var RainbowUsername, RainbowPassword, RainbowBubbleId;

    // Define two buttons
    var submitProblemButton = document.getElementById('submitProblem');
    var status = document.getElementById('status');

    // Submit Problem button function here
    submitProblemButton.addEventListener("click", function(){

        // Get data
        var productName = document.getElementById("product");
        var productIssue = document.getElementById("problem");

        // Change window visibility
        var problemStatement = document.getElementById("statement");
        var callWindow = document.getElementById("callWindow");
        problemStatement.style.display = "none";
        callWindow.style.display = "inherit";

        // Send data
        var data = {"product": productName.value, "issue": productIssue.value};
        xhttp.open('POST', 'submitProblem', true);
        xhttp.setRequestHeader('Content-Type','application/json');
        xhttp.send(JSON.stringify(data));
    });

    /* Bootstrap the SDK */
    angular.bootstrap(document, ["sdk"]).get("rainbowSDK");

    /* Callback for handling the event 'RAINBOW_ONREADY' */
    var onReady = function onReady() {
        // Put your own code here
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

    /* Listen to the SDK event RAINBOW_ONREADY */
    document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady)
    /* Listen to the SDK event RAINBOW_ONLOADED */
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded)
    /* Load the SDK */
    rainbowSDK.load();
});