import {WS} from "./WebSocket.js";
import {isString, isObject, isStringEmpty, COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let client = null,
    cocoDBEndPointURL = null,
    cocoAuthKey = null;
const WEBSOCKET_ENDPOINT_COCO_DB = '/ws/';
const ID_TO_RESOLVE_REJECT_MAP = {};
const CONNECT_BACKOFF_TIME_MS = [1, 500, 1000, 3000, 5000, 10000, 20000];
let id = 0;

let currentBackoffIndex = 0;
function _resetBackoffTime() {
    currentBackoffIndex = 0;
}
function _getBackoffTime() {
    if(currentBackoffIndex >= CONNECT_BACKOFF_TIME_MS.length){
        currentBackoffIndex = CONNECT_BACKOFF_TIME_MS.length - 1;
    }
    return CONNECT_BACKOFF_TIME_MS[currentBackoffIndex++];
}

// @INCLUDE_IN_API_DOCS

function _setupAndMaintainConnection() {
    return new Promise((resolve)=>{
        client = new WS.WebSocket(cocoDBEndPointURL.trim() + WEBSOCKET_ENDPOINT_COCO_DB, {
            perMessageDeflate: false,
            headers: {
                Authorization: `Basic ${cocoAuthKey}`
            }
        });
        client.on('open', function open() {
            if(!client) {
                console.log('client closed before server connected.');
                return;
            }
            console.log('connected to server');
            client.connectionEstablished = true;
            _resetBackoffTime();
            resolve();
        });

        client.on('message', function message(data) {
            __receiveMessage(data);
        });

        function _reEstablishConnectionIfNeeded() {
            if(client.userClosedConnectionCB){
                const userClosedConnectionCB = client.userClosedConnectionCB;
                client = cocoDBEndPointURL = cocoAuthKey = null;
                id = 0;
                userClosedConnectionCB();
                return;
            }
            setTimeout(_setupAndMaintainConnection, _getBackoffTime());
        }

        function _connectionTerminated(reason) {
            console.log(reason);
            client.connectionEstablished = false;
            for (let sequenceNumber in ID_TO_RESOLVE_REJECT_MAP) {
                let rejectHandler = ID_TO_RESOLVE_REJECT_MAP[sequenceNumber].reject;
                rejectHandler(reason);
                delete ID_TO_RESOLVE_REJECT_MAP[sequenceNumber];
            }
            _reEstablishConnectionIfNeeded(client);
        }
        client.on('close', function () {
            _connectionTerminated('connection closed');
        });
        client.on('error', function () {
            _connectionTerminated('connection error');
        });
    });
}

/**
 * Create a connection to the cocoDbServiceEndPoint and listens for messages. The connection will
 * be maintained and it will try to automatically re-establish broken connections if there are network issues.
 * You need to await on this function before staring to use any db APIs. Any APIs called while the connection is
 * not fully setup will throw an error.
 *
 * @param {string} cocoDbServiceEndPoint - The URL of the coco-db service.
 * @param {string} authKey - The authKey is a base64 encoded string of the username and password.
 * @return {Promise<null>} Resolves when the cocodb client is ready to send/receive requests. Never rejects.
 */
export function init(cocoDbServiceEndPoint, authKey) {
    if(client) {
        throw new Error('Please close the existing connection before calling init again');
    }
    if (isStringEmpty(cocoDbServiceEndPoint) || !(cocoDbServiceEndPoint.startsWith('ws://')
        || cocoDbServiceEndPoint.startsWith('wss://'))) {
        throw new Error('Please provide valid cocoDbServiceEndPoint');
    }
    if (isStringEmpty(authKey)) {
        throw new Error('Please provide valid authKey');
    }
    cocoDBEndPointURL = cocoDbServiceEndPoint;
    cocoAuthKey = authKey;
    return _setupAndMaintainConnection();
}

/**
 * Closes the connection to the server. You need to await on this function before you can call init again.
 *
 * @return {Promise<null>} Resolves when the cocodb client is closed and you are free to call init again. Never rejects.
 */
export function close() {
    // we need to save the current client for the callback function hooks below. the global client may change
    // as init and close gets called by the user.
    let currentClient = client;
    if (!currentClient) {
        return Promise.resolve();
    }
    if(currentClient.closePromise){
        return currentClient.closePromise;
    }
    currentClient.closePromise = new Promise((resolve)=>{
        currentClient.userClosedConnectionCB = function () {
            resolve();
        };
        currentClient.terminate();
    });
    return currentClient.closePromise;
}

/**
 * It returns a string representation of the next integer in a sequence
 * @returns {string} A function that increments the id variable and returns the new value as a hexadecimal string.
 */
function getId() {
    id++;
    return id.toString(16);
}


/**
 * It takes a message object, sends it to the server, and returns a promise that resolves when the server responds
 * @param {Object} message - The message to be sent to the server.
 * @returns {Promise} A function that returns a promise.
 */
export function sendMessage(message) {
    return new Promise(function (resolve, reject) {
        if (!client) {
            reject('Please call init before sending message');
            return;
        }
        if (!client.connectionEstablished) {
            reject('Db connection is not ready, please retry in some time');
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
        const sequenceNumber = getId();
        message.id = sequenceNumber;
        ID_TO_RESOLVE_REJECT_MAP[sequenceNumber] = {
            resolve: resolve,
            reject: reject
        };
        client.send(JSON.stringify(message));
    });
}

/**
 * Exported for testing
 *
 *  Process data from the server and resolves client promises
 * @param rawData - The raw data received from the server.
 * @returns A function that takes in a rawData string and returns a boolean.
 */
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
