import {WS} from "./WebSocket.js";
import {isString, isObject, isStringEmpty, COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

let client = null,
    cocoDBEndPointURL = null,
    cocoAuthKey = null;
const WEBSOCKET_ENDPOINT_COCO_DB = '/ws/';
const ID_TO_RESOLVE_REJECT_MAP = new Map();
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


/**
 * Sets up the websocket client and returns a promise that will be resolved when the connection is closed or broken.
 *
 * @param {function} connectedCb a callbak that will be executed when a connection is established to db
 * @return {Promise<null>} promise that will be resolved when the connection is closed/broken/error.
 * @private
 */
function _setupClientAndWaitForClose(connectedCb) {
    return new Promise(resolve =>{
        client = new WS.WebSocket(cocoDBEndPointURL.trim() + WEBSOCKET_ENDPOINT_COCO_DB, {
            perMessageDeflate: false,
            headers: {
                Authorization: `Basic ${cocoAuthKey}`
            }
        });
        client.on('open', function open() {
            console.log('connected to server');
            client.connectionEstablished = true;
            connectedCb && connectedCb();
        });

        client.on('message', function message(data) {
            __receiveMessage(data);
        });

        function _connectionTerminated(reason) {
            console.log(reason);
            client.connectionEstablished = false;
            for (let [sequenceNumber, handler] of ID_TO_RESOLVE_REJECT_MAP) {
                handler.reject(reason);
                ID_TO_RESOLVE_REJECT_MAP.delete(sequenceNumber);
            }
            resolve();
        }
        client.on('close', function () {
            // https://websockets.spec.whatwg.org/#eventdef-websocket-error
            // https://stackoverflow.com/questions/40084398/is-onclose-always-called-after-onerror-for-websocket
            // we do not need to listen for error event as an error event is immediately followed by a close event.
            _connectionTerminated('connection closed');
        });
    });
}

let backoffTimer = null, backoffResolveFn = null;
function _backoffTimer(timeInMilliSec) {
    return new Promise(resolve => {
        backoffResolveFn = resolve;
        backoffTimer = setTimeout(()=>{
            backoffTimer = null;
            backoffResolveFn = null;
            resolve();
        }, timeInMilliSec);
    });
}

function _cancelBackoffTimer() {
    _resetBackoffTime();
    if(backoffTimer){
        clearTimeout(backoffTimer);
        backoffTimer = null;
        backoffResolveFn();
        backoffResolveFn = null;
    }
}

async function _setupAndMaintainConnection(firstConnectionCb, neverConnectedCB) {
    backoffTimer = null;
    function connected() {
        _resetBackoffTime();
        if(firstConnectionCb){
            firstConnectionCb("connected");
            firstConnectionCb = null;
        }
    }
    while(!client || !client.userClosedConnection){
        await _setupClientAndWaitForClose(connected);
        if(!client || !client.userClosedConnection){
            await _backoffTimer(_getBackoffTime());
        }
    }
    client.userClosedConnectionCB && client.userClosedConnectionCB();
    client = cocoDBEndPointURL = cocoAuthKey = null;
    id = 0;
    if(neverConnectedCB){
        neverConnectedCB(new Error("user Cancelled"));
    }
}

/**
 * Create a connection to the cocoDbServiceEndPoint and listens for messages. The connection will
 * be maintained and it will try to automatically re-establish broken connections if there are network issues.
 * You need to await on this function before staring to use any db APIs. Any APIs called while the connection is
 * not fully setup will throw an error.
 *
 * @param {string} cocoDbServiceEndPoint - The URL of the coco-db service.
 * @param {string} authKey - The authKey is a base64 encoded string of the username and password.
 * @return {Promise<null>} Resolves when the cocodb client is ready to send/receive requests for the first time.
 * Rejects only if the user calls `close` API before any connection is established.
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
    return new Promise((resolve, reject) => {
        _setupAndMaintainConnection(resolve, reject);
    });
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
        currentClient.userClosedConnection = true;
        currentClient.userClosedConnectionCB = function () {
            resolve();
        };
        _cancelBackoffTimer(); // this is for if the connection is broken and, we are retrying the connection
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
        ID_TO_RESOLVE_REJECT_MAP.set(sequenceNumber, {
            resolve: resolve,
            reject: reject
        });
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
    const requestHandler = ID_TO_RESOLVE_REJECT_MAP.get(message.id);
    if (!isObject(requestHandler)) {
        //TODO: Emit metrics

        console.error(`Client did not send message with Id ${message.id} to server`);
        return false;
    }
    requestHandler.resolve(message.response);
    ID_TO_RESOLVE_REJECT_MAP.delete(message.id);
    return true;
}
