$(function() {
    console.log("Application started");

    // Update the variables below with your applicationID and applicationSecret strings
    var applicationID = "6d99b2a079cc11ea88b46f998ddae648",
        applicationSecret = "S6Hi04Pwsoa1pJ5g3eK7qlr8P7KxKjwStUCga8ab0X86bc4nmMNGrl2xW9yYw6EH";

    var RainbowUsername, RainbowPassword, RainbowBubbleId, contact, bubble;

    // Define two buttons
    //var submitProblemButton = document.getElementById('submitProblem');
    var status = document.getElementById('status');
    var callButton = document.getElementById('callButton');
    var endCallButton = document.getElementById('endCall');
    //var endCall = document.getElementById('endCall');
    var call, userId;

    // Submit Problem button function here
    /*submitProblemButton.addEventListener("click", function(){

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
        loginhttp.open('POST', 'submitProblem', true);
        loginhttp.setRequestHeader('Content-Type','application/json');
        loginhttp.send(JSON.stringify(data));

        
    });*/

    /* Bootstrap the SDK */
    angular.bootstrap(document, ["sdk"]).get("rainbowSDK");

    /* Callback for handling the event 'RAINBOW_ONREADY' */
    var onReady = function onReady() {
        // Put anything that you are going to use here
        };

        callButton.addEventListener("click",function(){
            var problemStatement = document.getElementById("statement");
            var callWindow = document.getElementById("callWindow");
            console.log("callbutton pressed");
            var sendData;
            // Todo 1: put the problem into sendData as a string. for example, "iphone,crash"
            // an example will be: sendData = {"problem" : "iphone,crash"}
            var product = document.getElementById("product");
            var productIndex = product.selectedIndex;
            var productBrand = product.options[productIndex].value;
            var problem = document.getElementById("problem");
            var problemIndex = problem.selectedIndex;
            var problemIssue = problem.options[problemIndex].value;
            var sendText = productBrand + "," + problemIssue;
            var sendData = {"problem" : sendText, "type":"call"};
            console.log(sendData);
            console.log("data find start sending");
            // Display finding message
            problemStatement.innerHTML = "<h1> We are finding you an agent, please wait</h1>";
            // use checkQueue to check if we are able to be put into the queue. the framework has been implemented for you
            var xhttp = new XMLHttpRequest();
            var queueStatus;
            xhttp.open('POST', 'checkQueue', true);
            xhttp.setRequestHeader('Content-Type','application/json');
            xhttp.send(JSON.stringify(sendData));
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var result = JSON.parse(this.responseText);
                    queueStatus = result.time;
                    console.log(queueStatus);
                    console.log("check queue");
                    // Check queue status. If "Long", we change the page and tell the customer to stop waiting
                    // Else if it is "Ok", we start queueing
                    // Else, we change the page to "An error has occurred"
                    if(queueStatus == "Long"){
                        problemStatement.innerHTML = "<h1> Sorry, No available agents right now. </h1>";
                    }else if(queueStatus == "Ok"){
                        console.log("that's right");
                        problemStatement.style.display = "none";
                        callWindow.style.display = "inherit";
                        status = "found you an agent. You are in the queue now. We are logging you in. Please do not leave now.";
                        // Do guest login here
                        console.log("Fetching result");
                        var dataTosend={"cat": sendText};
                        var loginhttp = new XMLHttpRequest();
                        loginhttp.open('POST', 'guestLogin', true);
                        loginhttp.setRequestHeader('Content-Type','application/json');
                        // send the data over to server
                        loginhttp.send(JSON.stringify(dataTosend));
                        // wait for server to return the guest user cred
                        loginhttp.onreadystatechange = function() {
                            if (this.readyState == 4 && this.status == 200) {
                                var result = JSON.parse(this.responseText);
                                RainbowUsername = result.Username;
                                RainbowPassword = result.Password;
                                //RainbowBubbleId = result.BubbleId;
                                console.log("Data: result fetched");
                                //console.log("bubble id is:", RainbowBubbleId);
                            
                                // Sign in to rainbow
                                rainbowSDK.connection.signin(RainbowUsername, RainbowPassword)
                                            .then(function(object) {
                                                    status.innerHTML = 'Agent connected';
                                                    console.log("User login successful", object);
                                                    userId = object.account.userId;
                                                    console.log(userId);
                                                    console.log(RainbowUsername);
                                                    console.log(RainbowPassword);
                                                    //callButton.removeAttribute("disabled");
                                                    call();                      
                                                })
                                                .catch(function(err) {
                                                    console.log("User login failed", err);
                                                });
                                //console.log("Bubble id is", RainbowBubbleId);

                            }else if(this.status != 200){
                                console.log("Wrong when fetching data from api");
                            }
                        };
                        console.log("long pull start");
                        // Using Long Poll Here to retrieve Agent ID
                        function call(){
                        var longPoll = null;
                        longPoll = new XMLHttpRequest();
                        longPoll.open('POST', 'longPoll', true);
                        longPoll.setRequestHeader('Content-Type','application/json');
                        sendData2 = {"problem":sendText,"guestuserid":userId};
                        console.log(sendData2);
                        longPoll.send(JSON.stringify(sendData2));
                        console.log("sendData, check ready state");
                        longPoll.onreadystatechange = function() {
                            var result = JSON.parse(this.responseText);
                            if(result.agentid == null){
                                setTimeout(call(),10000);
                            }
                            else{
                                console.log("I recieved");
                                status.innerHTML = "Agent Connected";
                            }
                            if (this.readyState == 4 && this.status == 200) {
                                var agentID = result.agentid;
                                console.log(agentID);
                                // Process the longPoll data and get the agent contact id
                                // Please store the ID in agentID
                                rainbowSDK.contacts.searchById(agentID).then(function (contact) {
                                    console.log(contact);
                                    call = rainbowSDK.webRTC.callInAudio(contact);
                                    if (call.label === "OK") {
                                        console.log("Successfully found an agent");
                                    }
                                    else{
                                        console.log("Error occured when fetching agent");
                                    }
                                });
                            }else if(this.status != 200){
                                console.log("Wrong when fetching data from api");
                            }
                        };}
                    }else{
                        status = "An error has occurred.";
                        problemStatement.innerHTML = "<h1> Sorry but an error has occurred. Please try again later.</h1>"
                    }
                    console.log("Data fetched");
                }else if(this.status != 200){
                    console.log("Wrong when fetching data from api");
                }
            };
            console.log("check queue");
            // Check queue status. If "Long", we change the page and tell the customer to stop waiting
            // Else if it is "Ok", we start queueing
            // Else, we change the page to "An error has occurred"

            console.log("finish");

            // Please do finish this part
            endCallButton.addEventListener("click",  function(){
                console.log("endcall button pressed");
                var endData = {"guestuserid" : userId};
                console.log(endData);
                rainbowSDK.webRTC.release(call);
                var xhttp = new XMLHttpRequest();
                xhttp.open('POST', 'endCall', true);
                xhttp.setRequestHeader('Content-Type','application/json');
                xhttp.send(JSON.stringify(endData));
                console.log("end data sent");
                window.location.replace('/');
                });
            
        });
    
    

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
        
            console.log("start fetching device");
            navigator.mediaDevices.getUserMedia({audio: true, video: true}).then(function(stream) {
                /* Stream received which means that the user has authorized the application to access to the audio and video devices. Local stream can be stopped at this time */
                stream.getTracks().forEach(function(track) {
                    track.stop();
                });
            
                /*  Get the list of available devices */
                navigator.mediaDevices.enumerateDevices().then(function(devices){
                    console.log("start navigating");
                    /* Do something for each device (e.g. add it to a selector list) */
                    devices.forEach(function(device) {
                        switch (device.kind) {
                            case "audioinput":
                                // This is a device of type 'microphone'
                                console.log("audio input");
                                break;
                            case "audiooutput":
                                // This is a device of type 'speaker'
                                console.log("audiooutput");
                                break;
                            case "videoinput":
                                // This is a device of type 'camera'
                                console.log("videoinput");
                                break;
                            default:
                                console.log("nothing");
                                break;
                        }
                    });
            
                }).catch(function(error) {
                    /* In case of error when enumerating the devices */
                    console.log("error");
                });
            }).catch(function(error) {
                /* In case of error when authorizing the application to access the media devices */
                console.log("autorize failed");
            });
            console.log("ends");
            /*
            var bubble = rainbowSDK.bubbles.getBubbleById(RainbowBubbleId);
            console.log(bubble.dbId);
            rainbowSDK.bubbles.startOrJoinWebRtcConference(bubble).then(function(bubbleWithWebConf) {
                //Everything went fine, WebRTC conference is launched
                console.log("yee");
                bubble = bubbleWithWebConf;

            })
            .catch(function(error) {
                //Something went wrong, handle the error
                console.log("nooo");
            });*/
    };


    /* Listen to the SDK event RAINBOW_ONREADY */
    document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady)
    /* Listen to the SDK event RAINBOW_ONLOADED */
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded)
    /* Load the SDK */
    rainbowSDK.load();
});