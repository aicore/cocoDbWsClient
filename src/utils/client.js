import WebSocket from 'ws';
import {isString, isObject} from "@aicore/libcommonutils";

let client = null;
const WEBSOCKET_ENDPOINT_COCO_DB = '/ws';

export function init(cocoDbServiceEndPoint, authkey) {
    if (!isString(cocoDbServiceEndPoint)) {
        throw new Error('Please provide valid cocoDbServiceEndPoint');
    }
    if (!isString(authkey) || authkey.split(':').length !== 2) {
        throw new Error('Please provide valid authKey in name:password format');
    }
    client = new WebSocket(`ws://${authkey}@${cocoDbServiceEndPoint}${WEBSOCKET_ENDPOINT_COCO_DB}`, {
        perMessageDeflate: false
    });
    client.on('open', function open() {
        for (let i = 0; i < 10000; i++) {
            client.send(JSON.stringify({fn: 'hello'}));
        }

    });

    client.on('message', function message(data) {
        console.log('received: %s', data);
    });
}

function close() {
    client = null;
}

export function sendMessage(message) {
    return new Promise(function (resolve, reject) {
        if (!isObject(message)) {
            reject('Please provide valid Object');
            return;
        }
        if (!isString(message.id)) {
            reject('Please provide valid id');

        }

    });

}

init('localhost:5000', 'aladdin:opensesame');

//close();
