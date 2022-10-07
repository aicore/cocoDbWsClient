import {init, sendMessage,close} from "./client.js";
import {COCO_DB_FUNCTIONS, isObject, isString} from "@aicore/libcommonutils";

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
    if (!isString(tableName)) {
        throw new Error('Please provide valid table name');
    }
    if (!isString(documentId)) {
        throw new Error('Please provide valid documentId');

    }
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
    if (!isString(tableName)) {
        throw new Error('Please provide valid tableName');
    }
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
    if (!isString(databaseName)) {
        throw new Error('Please provide valid databaseName');
    }
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
    if (!isString(databaseName)) {
        throw new Error('Please provide valid databaseName');
    }
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
    if (!isString(tableName)) {
        throw new Error('Please provide valid table name');
    }
    if (!isObject(document)) {
        throw new Error('Please provide valid document');

    }
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.put,
            request: {
                tableName: tableName,
                document: document
            }
        });
}

/**
 * It creates an index on a table.
 * @param tableName - The name of the table to create the index on.
 * @param jsonField - The name of the field in the JSON object that you want to index.
 * @param dataType - The data type of the index. This can be one of the following:
 * @param isUnique - true/false
 * @param isNotNull - If true, the index will be created with the NOT NULL constraint.
 * @returns A promise.
 */
export function createIndex(tableName, jsonField, dataType, isUnique, isNotNull) {
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.createIndex,
            request: {
                tableName: tableName,
                jsonField: jsonField,
                dataType: dataType,
                isUnique: isUnique,
                isNotNull: isNotNull
            }
        });
}

/**
 * It returns the index of the first element in the array that satisfies the provided testing function.
 * @param tableName - The name of the table you want to query.
 * @param queryObject - This is the object that you want to query the table with.
 */
export function getFromIndex(tableName, queryObject) {
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.getFromIndex,
            request: {
                tableName: tableName,
                queryObject: queryObject
            }
        });
}

/**
 * > This function deletes a document from a table
 * @param tableName - The name of the table you want to delete the document from.
 * @param documentId - The id of the document to delete.
 * @returns A promise.
 */
/**
 * > This function deletes a document from a table
 * @param tableName - The name of the table you want to delete the document from.
 * @param documentId - The id of the document to delete.
 * @returns A promise.
 */
export function deleteDocument(tableName, documentId) {
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.deleteDocument,
            request: {
                tableName: tableName,
                documentId: documentId
            }
        });
}

/**
 * > This function deletes a table from the database
 * @param tableName - The name of the table to delete.
 * @returns A promise.
 */
export function deleteTable(tableName) {
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.deleteTable,
            request: {
                tableName: tableName
            }
        });
}

/**
 * > This function deletes a table from the database
 * @param tableName - The name of the table to delete.
 * @returns A promise.
 */
export function mathAdd(tableName, documentId, jsonFieldsIncrements) {
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.mathAdd,
            request: {
                tableName: tableName,
                documentId: documentId,
                jsonFieldsIncrements: jsonFieldsIncrements
            }
        });
}

/**
 * > Update a document in a table
 * @param tableName - The name of the table to update the document in.
 * @param documentId - The id of the document to update.
 * @param document - The document to be updated.
 * @returns A promise.
 */
export function update(tableName, documentId, document) {
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.update,
            request: {
                tableName: tableName,
                documentId: documentId,
                document: document
            }
        });
}


init('localhost:5000', 'YWxhZGRpbjpvcGVuc2VzYW1l');

async function test() {

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(1000);
    hello();
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
    createDb('@');
}

async function stressTest() {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(1000);
    const promises = [];
    for (let i = 0; i < 1000; i++) {
        const promise = hello();
        promises.push(promise);
    }
    await Promise.all(promises);
    close();

}

stressTest();

//test();
