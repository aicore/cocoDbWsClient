/*global describe, it, beforeEach, afterEach*/
import mockedFunctions from "../setupmocks.js";
import {__receiveMessage, close, init, sendMessage} from "../../../src/utils/client.js";
import chai from "chai";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

const expect = chai.expect;

describe('Ut for client', function () {
    afterEach(async function () {
        await close();

    });
    it('should pass', function () {
        let isExceptionOccurred = false;
        try {
            init('wss://hello', 'world');
        } catch (e) {
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(false);
    });
    it('should fail if endpoint not specified', function () {
        let isExceptionOccurred = false;
        try {
            init('', 'world');
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
            close();
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
    it('close Should Pass', function () {
        let isExceptionOccurred = false;
        try {
            close();
        } catch (e) {
            isExceptionOccurred = true;

        }
        expect(isExceptionOccurred).eql(false);
    });
    it('close Should Pass', function () {
        let isExceptionOccurred = false;
        try {
            init('wss://hello','word');
            close();
        } catch (e) {
            isExceptionOccurred = true;

        }
        expect(isExceptionOccurred).eql(false);
    });

});
