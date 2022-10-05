import {init, sendMessage} from "./client.js";
import {COCO_DB_FUNCTIONS} from "@aicore/libcommonutils";

/**
 * > The function `hello` sends a message to the background script, which in turn sends a message to the content script,
 * which in turn sends a message to the database script, which in turn sends a message to the database, which in turn sends
 * a message to the database script, which in turn sends a message to the content script, which in turn sends a message to
 * the background script, which in turn sends a message to the function `hello`, which in turn returns the message
 * @returns A promise.
 */
export function hello() {
    return sendMessage({
        fn: COCO_DB_FUNCTIONS.hello
    });
}

/**
 * `get` is a function that takes two parameters, `tableName` and `documentId`, and returns a promise that resolves to the
 * document with the given `documentId` from the table with the given `tableName`
 * @param {string} tableName - The name of the table you want to get the document from.
 * @param {string} documentId - The document id of the document you want to get.
 * @returns{Promise<Document>} A promise.
 */
export function get(tableName, documentId) {
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.get,
            request: {
                tableName: tableName,
                documentId: documentId
            }
        });
}

/**
 * > This function creates a table with the name `tableName` in the database
 * @param {string}tableName - The name of the table to create.
 * @returns {Promise}A promise.
 */
export function createTable(tableName) {
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.createTable,
            request: {
                tableName: tableName
            }
        });
}


/**
 * It creates a database with the name `dataBaseName` and returns a promise
 * @param dataBaseName - The name of the database you want to create.
 * @returns {Promise}A promise.
 */
export function createDb(databaseName) {
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.createDb,
            request: {
                databaseName: databaseName
            }
        });
}

/**
 * It deletes the database.
 * @param <string> dataBaseName - The name of the database you want to delete.
 * @returns {Promise}A promise.
 */
export function deleteDb(databaseName) {
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.deleteDb,
            request: {
                databaseName: databaseName
            }
        });
}

/**
 * > The `put` function sends a message to the background script, which in turn sends a message to the content script,
 * which in turn sends a message to the page script, which in turn sends a message to the database script, which in turn
 * sends a message to the database, which in turn sends a message to the database script, which in turn sends a message to
 * the page script, which in turn sends a message to the content script, which in turn sends a message to the background
 * script, which in turn sends a message to the `put` function, which in turn returns the message
 * @param tableName - The name of the table to put the document into.
 * @param document - The document to be inserted into the database.
 * @returns A promise.
 */
export function put(tableName, document) {
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.put,
            request: {
                tableName: tableName,
                document: document
            }
        });
}

init('localhost:5000', 'YWxhZGRpbjpvcGVuc2VzYW1l');

async function test() {

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(1000);
    const databaseName = 'test';
    const createDbStatus = await createDb(databaseName);
    console.log(JSON.stringify(createDbStatus));
    const tableName = `${databaseName}.customers`;
    const createTableStatus = await createTable(tableName);
    console.log(JSON.stringify(createTableStatus));

    const putDocumentStatus = await put(tableName, {
        hello: 'world'
    });
    console.log(JSON.stringify(putDocumentStatus));
    const getDocumentStatus = await get(tableName, putDocumentStatus.documentId);
    console.log(JSON.stringify(getDocumentStatus));

    const deleteDbStatus = await deleteDb(databaseName);
    console.log(JSON.stringify(deleteDbStatus));

}

async function stressTest() {
    const promises = [];
    for (let i = 0; i < 1000000; i++) {
        const promise = hello();
        promises.push(promise);
    }
    await Promise.all(promises);

}

test();
