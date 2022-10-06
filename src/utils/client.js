import WebSocket from 'ws';
import {isString, isObject, isObjectEmpty} from "@aicore/libcommonutils";
import crypto from "crypto";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let client = null;
const WEBSOCKET_ENDPOINT_COCO_DB = '/ws';
const ID_TO_RESOLVE_REJECT_MAP = {};
let id = 0;

export function init(cocoDbServiceEndPoint, authkey) {
    if (!isString(cocoDbServiceEndPoint)) {
        throw new Error('Please provide valid cocoDbServiceEndPoint');
    }
    if (!isString(authkey)) {
        throw new Error('Please provide valid authKey in name:password format');
    }
    client = new WebSocket(`ws://${cocoDbServiceEndPoint}${WEBSOCKET_ENDPOINT_COCO_DB}`, {
        perMessageDeflate: false,
        headers: {
            Authorization: `Basic ${authkey}`
        }
    });
    client.on('open', function open() {
        /*for (let i = 0; i < 10000; i++) {
            client.send(JSON.stringify({fn: 'hello'}));
        }
         */
        console.log('connected to server');

    });

    client.on('message', function message(data) {
        console.log('received: %s', data);
        receiveMessage(data);
    });
}

function close() {
    client = null;
}

function getId() {
    id++;
    return id.toString(16);
}

export function sendMessage(message) {
    return new Promise(function (resolve, reject) {
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

function receiveMessage(rawData) {
    const message = JSON.parse(rawData);

    if (!isString(message.id)) {
        console.error('Server message does not have an Id');
        return;
    }
    const requestResolve = ID_TO_RESOLVE_REJECT_MAP[message.id];
    if (!isObject(requestResolve)) {
        console.error(`Client did not send message with Id ${message.id} to server`);
        return;
    }
    const response = message.response;
    requestResolve.resolve(response);
    delete ID_TO_RESOLVE_REJECT_MAP[message.id];
}


//close();
