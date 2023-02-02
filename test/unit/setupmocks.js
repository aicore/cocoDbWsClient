import {WS} from "../../src/utils/WebSocket.js";

let setupDone = false;
let mockedFunctions = {
    WS: class WebSocket {
        constructor() {

        }

        on(event, callback) {
            if(event ==='close'){
                mockedFunctions.wsEvents.close = function (...args) {
                    mockedFunctions.wsEvents.closeCalled = true;
                    callback(...args);
                };
            } else if(event ==='open'){
                mockedFunctions.wsEvents.open = function (...args) {
                    mockedFunctions.wsEvents.openCalled = true;
                    callback(...args);
                };
                if(mockedFunctions.wsEvents.raiseOpenEventOnCreate){
                    setTimeout(mockedFunctions.wsEvents.open, 10);
                }
            }
        }

        send(message) {
            console.log(message);
            mockedFunctions.wsEvents.send && mockedFunctions.wsEvents.send(message);
        }

        terminate() {
            mockedFunctions.wsEvents.close();
        }
    },
    wsEvents: {
        raiseOpenEventOnCreate: true
    }

};

function _setup() {
    if (setupDone) {
        return;
    }
    WS.WebSocket = mockedFunctions.WS;

}

_setup();

export default mockedFunctions;

