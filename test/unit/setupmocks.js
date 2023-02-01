import {WS} from "../../src/utils/WebSocket.js";

let setupDone = false;
let mockedFunctions = {
    WS: class WebSocket {
        constructor() {

        }

        on(event, callback) {
            if(event ==='close'){
                mockedFunctions.wsEvents.close = callback;
            } else if(event ==='open'){
                mockedFunctions.wsEvents.open = callback;
                if(mockedFunctions.wsEvents.raiseOpenEventOnCreate){
                    setTimeout(mockedFunctions.wsEvents.open, 10);
                }
            }
        }

        send(message) {
            console.log(message);
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

