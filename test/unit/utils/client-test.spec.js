/*global describe, it, beforeEach, afterEach*/
import mockedFunctions from "../setupmocks.js";
import {__receiveMessage, close, init, sendMessage} from "../../../src/utils/client.js";
import chai from "chai";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

const expect = chai.expect;

let savedSetTimeoutFn = global.setTimeout;
let savedClearTimeoutFn = global.clearTimeout;
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
});
