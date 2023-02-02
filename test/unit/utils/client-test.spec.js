/*global describe, it, beforeEach, afterEach*/
import mockedFunctions from "../setupmocks.js";
import {__receiveMessage, close, init, sendMessage} from "../../../src/utils/client.js";
import chai from "chai";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

const expect = chai.expect;

let savedSetTimeoutFn = global.setTimeout;
let savedClearTimeoutFn = global.clearTimeout;
let savedSetIntervalFn = global.setInterval;
let savedClearIntervalFn = global.clearInterval;
function _awaits(timeMs) {
    return new Promise(resolve =>{
        savedSetTimeoutFn(resolve, timeMs);
    });
}

describe('Ut for client', function () {
    afterEach(async function () {
        await close();
        mockedFunctions.wsEvents.raiseOpenEventOnCreate = true;
        global.setTimeout = savedSetTimeoutFn;
        global.clearTimeout = savedClearTimeoutFn;
        global.setInterval = savedSetIntervalFn;
        global.clearInterval = savedClearIntervalFn;
    });
    it('should pass', async function () {
        let isExceptionOccurred = false;
        try {
            await init('wss://hello', 'world');
        } catch (e) {
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(false);
    });
    it('should fail if endpoint not specified', async function () {
        let isExceptionOccurred = false;
        try {
            await init('', 'world');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid cocoDbServiceEndPoint');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);
    });
    it('should fail if authkey not specified', function () {
        let isExceptionOccurred = false;
        try {
            init('ws://hello', '');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid authKey');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);
    });
    it('should fail if double init called', async function () {
        let isExceptionOccurred = false;
        try {
            await init('wss://hello', 'world');
            await init('wss://hello', 'world');
        } catch (e) {
            expect(e.toString()).eql('Error: Please close the existing connection before calling init again');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);
    });
    it('sendMessage should throw exception if valid function not specified', async function () {
        let isExceptionOccurred = false;
        try {
            await init('wss://hello', 'world');
            await sendMessage({
                hello: 'world'
            });
        } catch (e) {
            expect(e.toString()).eql('please provide valid function name');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);
    });
    it('sendMessage should throw exception if valid message not specified', async function () {
        let isExceptionOccurred = false;
        try {
            await init('ws://hello', 'world');
            await sendMessage('hello');
        } catch (e) {
            expect(e.toString()).eql('Please provide valid Object');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);
    });
    it('sendMessage should pass', async function () {

        await init('wss://hello', 'world');
        setTimeout(() => {
            console.log('Foo bar');
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    hello: 'world'
                }
            }));
        }, 10);
        const response = await sendMessage({
            fn: COCO_DB_FUNCTIONS.hello
        });
        expect(response.hello).eql('world');


    });

    it('sendMessage should throw exception if connection not established', async function () {
        let isExceptionOccurred = false;
        try {
            mockedFunctions.wsEvents.raiseOpenEventOnCreate = false;
            init('wss://hello', 'world');
            await sendMessage({
                hello: 'world'
            });
        } catch (e) {
            expect(e.toString()).eql('Db connection is not ready, please retry in some time');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);
    });

    it('__receiveMessage  should fail if server did not send id test', function () {
        const isSuccess = __receiveMessage(JSON.stringify({}));
        expect(isSuccess).eql(false);

    });
    it('__receiveMessage  should fail if server proactively send message', function () {
        const isSuccess = __receiveMessage(JSON.stringify({id: '1000'}));
        expect(isSuccess).eql(false);

    });
    it('sendMessage should fail with out init', async function () {
        let isExceptionOccurred = false;
        try {
            await close();
            const response = await sendMessage({
                fn: COCO_DB_FUNCTIONS.hello
            });
            expect(response.hello).eql('world');


        } catch (e) {
            expect(e.toString()).eql('Please call init before sending message');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);
    });
    it('close Should Pass', async function () {
        let isExceptionOccurred = false;
        try {
            await close();
        } catch (e) {
            isExceptionOccurred = true;

        }
        expect(isExceptionOccurred).eql(false);
    });

    it('should double close Pass and resolve to same promise', async function () {
        await init('ws://hello', 'world');
        let savedClose = mockedFunctions.wsEvents.close;
        mockedFunctions.wsEvents.close = function () {
            // just swallow
        };
        let promise1 = close();
        let promise2 = close();
        expect(promise1).eql(promise2);
        mockedFunctions.wsEvents.close = savedClose;
        mockedFunctions.wsEvents.close(); // now close on ws connection
        await promise1;
    });
    it('init should retry connection on error', async function () {
        let isExceptionOccurred = false;
        try {
            mockedFunctions.wsEvents.raiseOpenEventOnCreate = false;
            let timeout;
            global.setTimeout = function (cb, timeoutms) {
                timeout = timeoutms;
                cb();
            };
            let initPromise = init('wss://hello', 'word');
            await _awaits(10);
            mockedFunctions.wsEvents.close();// fake close
            await _awaits(10);
            expect(timeout).to.eql(1);
            mockedFunctions.wsEvents.open();
            await initPromise;
            await close();
        } catch (e) {
            isExceptionOccurred = true;

        }
        expect(isExceptionOccurred).eql(false);
    });

    it('init should reject if user closed connection before connection open', async function () {
        let isExceptionOccurred = false;
        try {
            mockedFunctions.wsEvents.raiseOpenEventOnCreate = false;
            let backoffCalled = false;
            global.setTimeout = function (cb) {
                backoffCalled = true;
                cb();
            };
            let initPromise = init('wss://hello', 'word');
            await close();
            expect(backoffCalled).to.eql(false);
            mockedFunctions.wsEvents.open();
            await initPromise;
        } catch (e) {
            isExceptionOccurred = true;

        }
        expect(isExceptionOccurred).eql(true);
    });

    it('should clear backoff timers when user closed connection', async function () {
        mockedFunctions.wsEvents.raiseOpenEventOnCreate = false;
        const MOCK_TIMER_ID = "mockTimerID";
        let backoffCalled = false, clearTimerID;
        global.setTimeout = function () {
            backoffCalled = true;
            return MOCK_TIMER_ID;
        };
        global.clearTimeout = function (timerID) {
            clearTimerID = timerID;
        };
        init('wss://hello', 'word');
        mockedFunctions.wsEvents.close();// fake close
        await _awaits(10);
        expect(backoffCalled).to.eql(true);
        backoffCalled = false;

        // now close the connection. The connection is in backoff phase at this point,
        await close();
        await _awaits(10);
        expect(backoffCalled).to.eql(false);
        expect(clearTimerID).to.eql(MOCK_TIMER_ID);
    });

    let mockTimeout;
    async function _mockConnectionClose(backoffArray) {
        for(let i=0; i<backoffArray.length; i++){
            mockedFunctions.wsEvents.close();// fake close
            await _awaits(10);
            expect(mockTimeout).to.eql(backoffArray[i]);
        }
    }

    it('init should retry connection with backoff', async function () {
        mockedFunctions.wsEvents.raiseOpenEventOnCreate = false;
        global.setTimeout = function (cb, timeoutms) {
            mockTimeout = timeoutms;
            cb();
        };
        let initPromise = init('wss://hello', 'word');
        await _awaits(10);
        await _mockConnectionClose([1, 500, 1000, 3000, 5000, 10000, 20000, 20000, 20000]);

        mockedFunctions.wsEvents.open();
        await _awaits(10);
        // after connection is open, the backoff timers should reset
        await _mockConnectionClose([1, 500, 1000, 3000]); // smaller backoff

        mockedFunctions.wsEvents.open();
        await _awaits(10);
        // after connection is open, the backoff timers should reset again
        await _mockConnectionClose([1, 500, 1000]);

        await initPromise;
        await close();
    });

    it('should start hibernate timers and clear it on closed', async function () {
        const TIMER_ID = "mockIntervalHibernate";
        let mockIntervalTime = 0, clearIntervalCalled = false;
        global.setInterval = function (cb, timeoutms) {
            mockIntervalTime = timeoutms;
            return TIMER_ID;
        };
        global.clearInterval = function (timerid) {
            clearIntervalCalled = true;
            expect(timerid).eq(TIMER_ID);
        };
        await init('wss://hello', 'word');
        expect(mockIntervalTime).eq(8000);
        expect(clearIntervalCalled).eq(false);

        await close();
        expect(clearIntervalCalled).eq(true);
    });

    it('should not start hibernate timers till connection is established', async function () {
        mockedFunctions.wsEvents.raiseOpenEventOnCreate = false;
        let timerCalled = false;
        global.setInterval = function (cb, timeoutms) {
            timerCalled = true;
        };
        let initPromise = init('wss://hello', 'word');
        await _awaits(10);
        expect(timerCalled).eq(false);

        mockedFunctions.wsEvents.open();
        await _awaits(10);

        await initPromise;
        expect(timerCalled).eq(true);
        await close();
    });

    it('should hibernate after inactivity', async function () {
        let timerCalled = false, hibernateCheckTimerFn, socketCloseCalled = false;
        global.setInterval = function (cb, timeoutms) {
            timerCalled = true;
            hibernateCheckTimerFn = cb;
        };
        await init('wss://hello', 'word');
        let savedClose = mockedFunctions.wsEvents.close;
        mockedFunctions.wsEvents.close = function () {
            socketCloseCalled = true;
            savedClose();
        };
        expect(timerCalled).eq(true);

        // now call hibernate check simulating advancing time
        hibernateCheckTimerFn();
        await _awaits(10);
        // we will not close connection as at the first check, the socket establish itself is an activity
        expect(socketCloseCalled).eq(false);

        hibernateCheckTimerFn();
        await _awaits(10);
        // no activity happened on next activity check interval, so will close.
        expect(socketCloseCalled).eq(true);

        await close();
    });

    function _mockSendMessageResponse(id) {
        __receiveMessage(JSON.stringify({
            id,
            response: {
                hello: 'world'
            }
        }));
    }

    it('should not hibernate if activity on socket', async function () {
        let timerCalled = false, hibernateCheckTimerFn, socketCloseCalled = false;
        global.setInterval = function (cb, timeoutms) {
            timerCalled = true;
            hibernateCheckTimerFn = cb;
        };
        await init('wss://hello', 'word');
        let savedClose = mockedFunctions.wsEvents.close;
        mockedFunctions.wsEvents.close = function () {
            socketCloseCalled = true;
            savedClose();
        };
        mockedFunctions.wsEvents.send = function (message) {
            _mockSendMessageResponse(JSON.parse(message).id);
        };
        expect(timerCalled).eq(true);

        // now call hibernate check simulating advancing time
        hibernateCheckTimerFn();
        await _awaits(10);
        // we will not close connection as at the first check, the socket establish itself is an activity
        expect(socketCloseCalled).eq(false);

        await sendMessage({
            fn: COCO_DB_FUNCTIONS.hello
        });
        hibernateCheckTimerFn();
        await _awaits(10);
        // send activity, so we wont hibernate.
        expect(socketCloseCalled).eq(false);

        hibernateCheckTimerFn();
        await _awaits(10);
        // no activity, hibernate.
        expect(socketCloseCalled).eq(true);

        await close();
    });

    it('should exit hibernation when send message is triggered', async function () {
        let timerCalled = false, hibernateCheckTimerFn;
        global.setInterval = function (cb, timeoutms) {
            timerCalled = true;
            hibernateCheckTimerFn = cb;
        };
        mockedFunctions.wsEvents.send = function (message) {
            _mockSendMessageResponse(JSON.parse(message).id);
        };

        await init('wss://hello', 'word');
        expect(timerCalled).eq(true);

        mockedFunctions.wsEvents.openCalled = false;
        // now call hibernate check simulating advancing time
        hibernateCheckTimerFn();
        await _awaits(10);
        hibernateCheckTimerFn();
        await _awaits(10);
        expect(mockedFunctions.wsEvents.closeCalled).eq(true);
        expect(mockedFunctions.wsEvents.openCalled).eq(false);

        mockedFunctions.wsEvents.closeCalled = false;
        let response = await sendMessage({
            fn: COCO_DB_FUNCTIONS.hello
        });
        // send activity, so we reestablish connection
        expect(mockedFunctions.wsEvents.openCalled).eq(true);
        // we should still get response
        expect(response.hello).eq("world");

        hibernateCheckTimerFn();
        await _awaits(10);
        // the previous send activity, dont hibernate.
        expect(mockedFunctions.wsEvents.closeCalled).eq(false);

        hibernateCheckTimerFn();
        await _awaits(10);
        // no activity, hibernate.
        expect(mockedFunctions.wsEvents.closeCalled).eq(true);

        await close();
    });

    it('should not hibernate if responses are pending', async function () {
        let timerCalled = false, hibernateCheckTimerFn;
        global.setInterval = function (cb, timeoutms) {
            timerCalled = true;
            hibernateCheckTimerFn = cb;
        };
        let savedMessage;
        mockedFunctions.wsEvents.send = function (message) {
            // swallow send, dont respond
            savedMessage = message;
        };

        mockedFunctions.wsEvents.closeCalled = false;
        await init('wss://hello', 'word');
        expect(mockedFunctions.wsEvents.openCalled).eq(true);
        expect(timerCalled).eq(true);

        // now send an event that will never be resolved
        sendMessage({
            fn: COCO_DB_FUNCTIONS.hello
        });

        // now call hibernate check simulating advancing time. wont hibernate as havent got a response yet
        for(let i=0; i<10; i++){
            hibernateCheckTimerFn();
            await _awaits(10);
            expect(mockedFunctions.wsEvents.closeCalled).eq(false);
        }

        // now respond
        _mockSendMessageResponse(JSON.parse(savedMessage).id);
        await _awaits(10);

        // will hibernate on next timer check as no activity in last time period. receive doesnt count
        hibernateCheckTimerFn();
        await _awaits(10);
        expect(mockedFunctions.wsEvents.closeCalled).eq(true);

        // now send a message to bring back frmo hibernation
        mockedFunctions.wsEvents.closeCalled = mockedFunctions.wsEvents.openCalled = false;
        let sendPromise = sendMessage({
            fn: COCO_DB_FUNCTIONS.hello
        });
        await _awaits(100);
        _mockSendMessageResponse(JSON.parse(savedMessage).id);
        let response = await sendPromise;
        // send activity, so we reestablish connection
        expect(mockedFunctions.wsEvents.openCalled).eq(true);
        // we should still get response
        expect(response.hello).eq("world");

        hibernateCheckTimerFn();
        await _awaits(10);
        // the previous send activity, dont hibernate.
        expect(mockedFunctions.wsEvents.closeCalled).eq(false);

        hibernateCheckTimerFn();
        await _awaits(10);
        // no activity, hibernate.
        expect(mockedFunctions.wsEvents.closeCalled).eq(true);

        await close();
    });

    it('should not buffer more than allowed number of requests while hibernating', async function () {
        let timerCalled = false, hibernateCheckTimerFn, socketCloseCalled = false;
        global.setInterval = function (cb, timeoutms) {
            timerCalled = true;
            hibernateCheckTimerFn = cb;
        };
        await init('wss://hello', 'word');
        let savedClose = mockedFunctions.wsEvents.close;
        mockedFunctions.wsEvents.close = function () {
            socketCloseCalled = true;
            savedClose();
        };
        expect(timerCalled).eq(true);

        // now call hibernate check simulating advancing time
        hibernateCheckTimerFn();
        await _awaits(10);
        // we will not close connection as at the first check, the socket establish itself is an activity
        expect(socketCloseCalled).eq(false);

        hibernateCheckTimerFn();
        await _awaits(10);
        // no activity happened on next activity check interval, so will close.
        expect(socketCloseCalled).eq(true);

        mockedFunctions.wsEvents.sendCalled = false;
        let promises = [];
        for(let i=0; i< 2020; i++){
            promises.push(sendMessage({
                fn: COCO_DB_FUNCTIONS.hello
            }));
        }
        let error;
        try{
            await Promise.race(promises);
        } catch (e) {
            error = e;
        }
        expect(error).eq("Too many requests sent while waking up from hibernation");

        await close();
        expect(mockedFunctions.wsEvents.sendCalled).eq(false);

        // as we closed the connection manually, all pending send requests should now reject
        let allResults = await Promise.allSettled(promises);
        for(let result of allResults){
            expect(result.status).eq("rejected");
        }
    });

    it('should not hibernate if reconnection is in progress', async function () {
        mockedFunctions.wsEvents.raiseOpenEventOnCreate = false;
        let timerCalled = false, hibernateCheckTimerFn;
        global.setInterval = function (cb) {
            hibernateCheckTimerFn = cb;
            timerCalled = true;
        };
        let savedMessage;
        mockedFunctions.wsEvents.send = function (message) {
            savedMessage = message;
        };
        let initPromise = init('wss://hello', 'word');
        await _awaits(10);
        mockedFunctions.wsEvents.open();
        await initPromise;
        expect(timerCalled).eq(true);

        hibernateCheckTimerFn();
        await _awaits(10);
        hibernateCheckTimerFn();
        await _awaits(10);
        expect(mockedFunctions.wsEvents.closeCalled).eq(true);
        mockedFunctions.wsEvents.newSocketCreated = false;
        mockedFunctions.wsEvents.closeCalled = false;

        // send a message to restart connection
        let sendPromise = sendMessage({
            fn: COCO_DB_FUNCTIONS.hello
        });
        await _awaits(10);
        expect(mockedFunctions.wsEvents.newSocketCreated).eq(true);

        // will not hibernate till the connection moved to open or close state.
        hibernateCheckTimerFn();
        await _awaits(10);
        hibernateCheckTimerFn();
        await _awaits(10);
        expect(mockedFunctions.wsEvents.closeCalled).eq(false);

        // move to open state
        mockedFunctions.wsEvents.open();
        await _awaits(10);
        _mockSendMessageResponse(JSON.parse(savedMessage).id);
        await sendPromise;

        // will not it should hibernate as there are no pending requests and connection established.
        hibernateCheckTimerFn();
        await _awaits(10);
        expect(mockedFunctions.wsEvents.closeCalled).eq(false);
        hibernateCheckTimerFn();
        await _awaits(10);
        expect(mockedFunctions.wsEvents.closeCalled).eq(true);

        await close();
    });
});
