import {WS} from "../../src/utils/WebSocket.js";

let setupDone = false;
let close = null;
let mockedFunctions = {
    WS: class WebSocket {
        constructor() {

        }

        on(event, callback) {
            if(event ==='close'){
                close = callback;

            }

        }

        send(message) {
            console.log(message);

        }

        terminate() {
            close();

        }
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

