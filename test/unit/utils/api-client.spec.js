/*global describe, it, beforeEach, afterEach*/
import mockedFunctions from "../setupmocks.js";
import chai from "chai";
import {
    hello,
    init,
    close,
    get,
    createTable,
    createDb,
    deleteDb,
    deleteTable,
    put,
    createIndex, getFromIndex, getFromNonIndex, deleteDocument, update, mathAdd
} from "../../../src/index.js";
import {__receiveMessage} from "../../../src/utils/client.js";
import {query} from "../../../src/utils/api.js";

const expect = chai.expect;
describe('api test for client', function () {
    beforeEach(async function () {
        await init('ws://localhost', '12314');

    });
    afterEach(async function () {
        await close();

    });
    it('hello should pass ', async function () {
        const promise = hello();
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    hello: 'world'
                }
            }));
        }, 10);
        const response = await promise;
        expect(response.hello).eql('world');
    });

    it('get  should fail if table name is invalid', async function () {
        let isExceptionOccurred = false;
        try {
            await get('', '123');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid table name');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });
    it('get  should fail if document id invalid', async function () {
        let isExceptionOccurred = false;
        try {
            await get('hello', '');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid documentId');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });

    it('get  should pass for valid inputs', async function () {

        const promise = get('hello', '1234');
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true,
                    document: {
                        hello: 'world'
                    }
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.document.hello).eql('world');
        expect(resp.isSuccess).eql(true);
    });

    it('create Table  should fail if tableName is invalid', async function () {
        let isExceptionOccurred = false;
        try {
            await createTable('');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid tableName');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });

    it('create Table  should pass ', async function () {

        const promise = createTable('hello.world');
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
    });


    it('delete Table  should fail if tableName is invalid', async function () {
        let isExceptionOccurred = false;
        try {
            await deleteTable('');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid table Name');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });

    it('delete Table  should pass ', async function () {

        const promise = deleteTable('hello.world');
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
    });


    it('create db  should fail if database is invalid', async function () {
        let isExceptionOccurred = false;
        try {
            await createDb('');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid databaseName');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });

    it('create db   should pass ', async function () {

        const promise = createDb('hello');
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
    });

    it('delete db  should fail if database is invalid', async function () {
        let isExceptionOccurred = false;
        try {
            await deleteDb('');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid databaseName');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });

    it('delete db   should pass ', async function () {

        const promise = deleteDb('hello');
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
    });

    it('put  should fail if table name is invalid', async function () {
        let isExceptionOccurred = false;
        try {
            await put('', {});
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid table name');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });
    it('put  should fail if document is empty', async function () {
        let isExceptionOccurred = false;
        try {
            await put('hello', {});
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid document');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });

    it('put  should pass for valid inputs', async function () {

        const promise = put('hello', {
            hello: 'world'
        });
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true,
                    documentId: '1234'
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.documentId).eql('1234');
        expect(resp.isSuccess).eql(true);
    });


    it('create Index  should fail if table name is invalid', async function () {
        let isExceptionOccurred = false;
        try {
            await createIndex('', 'a.b', 'INT');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid table name');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });
    it('createIndex  should fail if jsonField is empty', async function () {
        let isExceptionOccurred = false;
        try {
            await createIndex('a.b', '', 'INT');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid json field');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });

    it('createIndex  should fail if document datatype is empty', async function () {
        let isExceptionOccurred = false;
        try {
            await createIndex('a.b', 'x.y', '');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid dataType');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });


    it('createIndex  should pass for valid inputs', async function () {

        const promise = createIndex('a.b', 'x.y', 'INT');
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
    });

    it('getFromIndex  should fail if jsonField is empty', async function () {
        let isExceptionOccurred = false;
        try {
            await getFromIndex('', {
                hello: 'world'
            });
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid table name');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });

    it('getFromIndex  should fail if document datatype is empty', async function () {
        let isExceptionOccurred = false;
        try {
            await getFromIndex('x.y', {});
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid queryObject');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });


    it('getFromIndex  should pass for valid inputs', async function () {

        const promise = getFromIndex('x.y', {
            hello: 'world'
        });
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true,
                    documents: [
                        {
                            hello: 'world'
                        },
                        {
                            hello: 'usa'
                        }

                    ]
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
        expect(resp.documents.length).eql(2);
        expect(resp.documents[0].hello).eql('world');
        expect(resp.documents[1].hello).eql('usa');
    });

    it('getFromNonIndex  should fail if table Name is empty', async function () {
        let isExceptionOccurred = false;
        try {
            await getFromNonIndex('', {
                hello: 'world'
            });
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid table name');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });


    it('getFromNonIndex  should pass for valid inputs', async function () {

        const promise = getFromNonIndex('x.y', {
            hello: 'world'
        });
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true,
                    documents: [
                        {
                            hello: 'world'
                        },
                        {
                            hello: 'india'
                        }

                    ]
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
        expect(resp.documents.length).eql(2);
        expect(resp.documents[0].hello).eql('world');
        expect(resp.documents[1].hello).eql('india');
    });

    it('deleteDocument  should fail if table name is invalid', async function () {
        let isExceptionOccurred = false;
        try {
            await deleteDocument('', '123');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid table name');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });
    it('deleteDocument  should fail if document is empty', async function () {
        let isExceptionOccurred = false;
        try {
            await deleteDocument('x,y', '');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid documentId');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });

    it('deleteDocument  should pass for valid inputs', async function () {

        const promise = deleteDocument('x.y', '123');
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
    });


    it('update  should fail if table name is invalid', async function () {
        let isExceptionOccurred = false;
        try {
            await update('', '123', {
                hello: 'world'
            });
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid table name');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });
    it('update  should fail if document Id is empty', async function () {
        let isExceptionOccurred = false;
        try {
            await update('x.y', '', {
                hello: 'world'
            });
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid documentId');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });
    it('update  should fail if document  is empty', async function () {
        let isExceptionOccurred = false;
        try {
            await update('x.y', '123', {});
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid document');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });

    it('update  should pass for valid inputs', async function () {

        const promise = update('x.y', '123', {hello: 'world'});
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true,
                    documentId: '1234'
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
        expect(resp.documentId).eql('1234');
    });

    it('conditional update should pass for valid inputs', async function () {

        const promise = update('x.y', '123', {hello: 'world'}, "$.x<10");
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true,
                    documentId: '1234'
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
        expect(resp.documentId).eql('1234');
    });


    it('mathAdd  should fail if table name is invalid', async function () {
        let isExceptionOccurred = false;
        try {
            await mathAdd('', '123', {
                hello: 1
            });
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid table name');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });
    it('mathAdd  should fail if document Id is empty', async function () {
        let isExceptionOccurred = false;
        try {
            await mathAdd('x.y', '', {
                hello: 1
            });
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid documentId');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });
    it('mathAdd  should fail if jsonFieldsIncrements  is empty', async function () {
        let isExceptionOccurred = false;
        try {
            await mathAdd('x.y', '1234', {});
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid jsonFieldsIncrements');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });

    it('mathAdd  should pass for valid inputs', async function () {

        const promise = mathAdd('x.y', '123', {hello: 1});
        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
    });


    it('query  should fail if table name is invalid', async function () {
        let isExceptionOccurred = false;
        try {
            await query('', '$.Age = 100');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid table name');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });
    it('query  should fail if query string is empty', async function () {
        let isExceptionOccurred = false;
        try {
            await query('x.y', '');
        } catch (e) {
            expect(e.toString()).eql('Error: Please provide valid query String');
            isExceptionOccurred = true;
        }
        expect(isExceptionOccurred).eql(true);

    });

    it('query  should pass for valid inputs', async function () {

        const promise =  query('x.y', 'x.y = 1');

        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true,
                    documents : []
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
        expect(resp.documents.length).eql(0);
    });
    it('query  should pass for valid inputs valid index', async function () {

        const promise =  query('x.y', 'x.y = 1', ['x']);

        setTimeout(() => {
            __receiveMessage(JSON.stringify({
                id: '1',
                response: {
                    isSuccess: true,
                    documents : []
                }
            }));
        }, 10);
        const resp = await promise;
        expect(resp.isSuccess).eql(true);
        expect(resp.documents.length).eql(0);
    });

});
