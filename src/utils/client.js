import {WS} from "./WebSocket.js";
import {isString, isObject, isObjectEmpty, isStringEmpty} from "@aicore/libcommonutils";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let client = null;
const WEBSOCKET_ENDPOINT_COCO_DB = '/ws';
const ID_TO_RESOLVE_REJECT_MAP = {};
let id = 0;

export function init(cocoDbServiceEndPoint, authkey) {
    if (isStringEmpty(cocoDbServiceEndPoint)) {
        throw new Error('Please provide valid cocoDbServiceEndPoint');
    }
    if (isStringEmpty(authkey)) {
        throw new Error('Please provide valid authKey');
    }
    client = new WS.WebSocket(`ws://${cocoDbServiceEndPoint}${WEBSOCKET_ENDPOINT_COCO_DB}`, {
        perMessageDeflate: false,
        headers: {
            Authorization: `Basic ${authkey}`
        }
    });
    client.on('open', function open() {
        console.log('connected to server');
    });

    client.on('message', function message(data) {
        console.log('received: %s', data);
        __receiveMessage(data);
    });
    client.on('close', function close() {
        console.log('closing connection');
        for (let id in ID_TO_RESOLVE_REJECT_MAP) {
            let reject = ID_TO_RESOLVE_REJECT_MAP[id].reject;
            reject('connection closed');
            delete ID_TO_RESOLVE_REJECT_MAP[id];
        }
        client = null;
    });
}

export function close() {
    if(!client){
        return;
    }
    client.terminate();
}

function getId() {
    id++;
    return id.toString(16);
}

export function sendMessage(message) {
    return new Promise(function (resolve, reject) {
        if (!client) {
            reject('Please call init before sending message');
            return;
        }
        if (!isObject(message)) {
            reject('Please provide valid Object');
            return;
        }
        if (!isString(message.fn) || !(message.fn in COCO_DB_FUNCTIONS)) {
            reject('please provide valid function name');
            return;
        }
        const id = getId();
        message.id = id;
        ID_TO_RESOLVE_REJECT_MAP[id] = {
            resolve: resolve,
            reject: reject
        };
        client.send(JSON.stringify(message));
    });
}

//Exported for testing
export function __receiveMessage(rawData) {
    const message = JSON.parse(rawData);

    if (!isString(message.id)) {
        //TODO: Emit metrics
        console.error('Server message does not have an Id');
        return false;
    }
    const requestResolve = ID_TO_RESOLVE_REJECT_MAP[message.id];
    if (!isObject(requestResolve)) {
        //TODO: Emit metrics

        console.error(`Client did not send message with Id ${message.id} to server`);
        return false;
    }
    const response = message.response;
    requestResolve.resolve(response);
    delete ID_TO_RESOLVE_REJECT_MAP[message.id];
    return true;
}


//close();
