/* Wait for the page to load */
$(function() {
    console.log("[DEMO] :: Rainbow Application started!");


    // Update the variables below with your applicationID and applicationSecret strings
    var applicationID = "",
        applicationSecret = "";

    /* Bootstrap the SDK */
    angular.bootstrap(document, ["sdk"]).get("rainbowSDK");

    /* Callback for handling the event 'RAINBOW_ONREADY' */
    var onReady = function onReady() {
        console.log("[DEMO] :: On SDK Ready !");
        // do something when the SDK is ready
    };

    /* Callback for handling the event 'RAINBOW_ONCONNECTIONSTATECHANGED' */
    var onLoaded = function onLoaded() {
        console.log("[DEMO] :: On SDK Loaded !");

        // Activate full SDK log
        rainbowSDK.setVerboseLog(true);

        rainbowSDK
            .initialize(applicationID, applicationSecret)
            .then(function() {
                console.log("[DEMO] :: Rainbow SDK is initialized!");
            })
            .catch(function(err) {
                console.log("[DEMO] :: Something went wrong with the SDK...", err);
            });
    };

    /* Listen to the SDK event RAINBOW_ONREADY */
    document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady)

    /* Listen to the SDK event RAINBOW_ONLOADED */
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded)

    /* Load the SDK */
    rainbowSDK.load();
});