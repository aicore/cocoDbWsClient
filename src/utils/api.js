import {sendMessage} from "./client.js";

export {init, close} from "./client.js";
import {COCO_DB_FUNCTIONS, isObjectEmpty, isString, isStringEmpty} from "@aicore/libcommonutils";

// @INCLUDE_IN_API_DOCS


/**
 * > The function `hello` sends a message to the background script, which in turn sends a message to the content script,
 * which in turn sends a message to the database script, which in turn sends a message to the database, which in turn
 * sends a message to the database script, which in turn sends a message to the content script, which in turn sends a
 * message to the background script, which in turn sends a message to the function `hello`, which in turn returns the
 * message
 * @returns A promise.
 */
export function hello() {
    return sendMessage({
        fn: COCO_DB_FUNCTIONS.hello
    });
}

/**
 * `get` is a function that takes two parameters, `tableName` and `documentId`, and returns a promise that
 * resolves to the document with the given `documentId` from the table with the given `tableName`
 * @param {string} tableName - The name of the table you want to get the document from.
 * @param {string} documentId - The document id of the document you want to get.
 * @returns{Promise<Document>} A promise.
 */
export function get(tableName, documentId) {
    if (isStringEmpty(tableName)) {
        throw new Error('Please provide valid table name');
    }
    if (isStringEmpty(documentId)) {
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
    if (isStringEmpty(tableName)) {
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
 * @param {string} databaseName - The name of the database you want to create.
 * @returns {Promise}A promise.
 */
export function createDb(databaseName) {
    if (isStringEmpty(databaseName)) {
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
 * @param {string} databaseName - The name of the database you want to delete.
 * @returns {Promise}A promise.
 */
export function deleteDb(databaseName) {
    if (isStringEmpty(databaseName)) {
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
 * > The `put`  document to cocoDN
 * script, which in turn sends a message to the `put` function, which in turn returns the message
 * @param {string} tableName - The name of the table to put the document into.
 * @param {Object}document - The document to be inserted into the database.
 * @returns{Promise} A promise.
 */
export function put(tableName, document) {
    if (isStringEmpty(tableName)) {
        throw new Error('Please provide valid table name');
    }
    if (isObjectEmpty(document)) {
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
 * @param {string} tableName - The name of the table to create the index on.
 * @param {string} jsonField - The name of the field in the JSON object that you want to index.
 * @param {string} dataType - The data type of the index. This can be one of the following:
 * @param {boolean} isUnique - true/false
 * @param {boolean} isNotNull - If true, the index will be created with the NOT NULL constraint.
 * @returns {Promise} A promise.
 */
export function createIndex(tableName, jsonField, dataType, isUnique, isNotNull) {
    if (isStringEmpty(tableName)) {
        throw new Error('Please provide valid table name');
    }
    if (isStringEmpty(jsonField)) {
        throw new Error('Please provide valid json field');

    }
    if (isStringEmpty(dataType)) {
        throw new Error('Please provide valid dataType');

    }
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
 * It returns list of documents matching the queryObject
 * @param {string} tableName - The name of the table you want to query.
 * @param{Object} queryObject - This is the object that you want to query the table with.
 * @param {Object} options Optional parameter to add pagination.
 * @param {number} options.pageOffset specify which row to start retrieving documents from. Eg: to get 10 documents from
 * the 100'th document, you should specify `pageOffset = 100` and `pageLimit = 10`
 * @param {number} options.pageLimit specify number of documents to retrieve. Eg: to get 10 documents from
 * the 100'th document, you should specify `pageOffset = 100` and `pageLimit = 10`
 * @returns {Promise}
 */
export function getFromIndex(tableName, queryObject, options= {}) {
    if (isStringEmpty(tableName)) {
        throw new Error('Please provide valid table name');
    }
    if (isObjectEmpty(queryObject)) {
        throw new Error('Please provide valid queryObject');
    }
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.getFromIndex,
            request: {
                tableName: tableName,
                queryObject: queryObject,
                options
            }
        });
}

/**
 * It returns list of documents matching the queryObject after scanning the COCO DB
 * @param {string} tableName - The name of the table you want to query.
 * @param{Object} queryObject - This is the object that you want to query the table with.
 * @param {Object} options Optional parameter to add pagination.
 * @param {number} options.pageOffset specify which row to start retrieving documents from. Eg: to get 10 documents from
 * the 100'th document, you should specify `pageOffset = 100` and `pageLimit = 10`
 * @param {number} options.pageLimit specify number of documents to retrieve. Eg: to get 10 documents from
 * the 100'th document, you should specify `pageOffset = 100` and `pageLimit = 10`
 * @returns {Promise}
 */
export function getFromNonIndex(tableName, queryObject = {}, options= {}) {
    if (isStringEmpty(tableName)) {
        throw new Error('Please provide valid table name');
    }
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.getFromNonIndex,
            request: {
                tableName: tableName,
                queryObject: queryObject,
                options
            }
        });
}


/**
 * > This function deletes a document from a table
 * @param {string} tableName - The name of the table you want to delete the document from.
 * @param {string} documentId - The id of the document to delete.
 * @param {string} [condition] - Optional coco query condition of the form "$.cost<35" that must be satisfied
 * for delete to happen. See query API for more details on how to write coco query strings.
 * @returns {Promise} A promise.
 */
export function deleteDocument(tableName, documentId, condition) {
    if (isStringEmpty(tableName)) {
        throw new Error('Please provide valid table name');
    }
    if (isStringEmpty(documentId)) {
        throw new Error('Please provide valid documentId');
    }
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.deleteDocument,
            request: {
                tableName: tableName,
                documentId: documentId,
                condition
            }
        });
}

/**
 * > This function deletes all documents satisfying query condition from a table
 * @param {string} tableName - The name of the table in which the key is to be deleted.
 * @param {string} queryString - The cocDB query string.
 * @param {Array[string]} useIndexForFields - List of indexed fields in the document.
 * @returns {Promise} A promise.
 */
export function deleteDocuments(tableName, queryString, useIndexForFields = []) {
    if (isStringEmpty(tableName)) {
        throw new Error('Please provide valid table name');
    }
    if (isStringEmpty(queryString)) {
        throw new Error('Please provide valid queryString');
    }
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.deleteDocuments,
            request: {
                tableName,
                queryString,
                useIndexForFields
            }
        });
}


/**
 * > This function deletes a table from the database
 * @param {string} tableName - The name of the table to delete.
 * @returns{Promise} A promise.
 */
export function deleteTable(tableName) {
    if (isStringEmpty(tableName)) {
        throw new Error('Please provide valid table Name');
    }
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.deleteTable,
            request: {
                tableName: tableName
            }
        });
}


/**
 * do mathematical addition on given json fields by given values in jsonFieldsIncrements
 * conditional operation is also supported.
 * @param {string} tableName - The name of the table you want to update.
 * @param {string} documentId - The document id of the document you want to update.
 * @param {Object} jsonFieldsIncrements - A JSON object with the fields to increment and the amount to
 * increment them by.
 * @param {string} [condition] - Optional coco query condition of the form "$.cost<35" that must be satisfied
 * for update to happen. See query API for more details on how to write coco query strings.
 * @returns {Promise} A promise.
 */
export function mathAdd(tableName, documentId, jsonFieldsIncrements, condition) {
    if (isStringEmpty(tableName)) {
        throw new Error('Please provide valid table name');
    }
    if (isStringEmpty(documentId)) {
        throw new Error('Please provide valid documentId');
    }
    if (isObjectEmpty(jsonFieldsIncrements)) {
        throw new Error('Please provide valid jsonFieldsIncrements');
    }
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.mathAdd,
            request: {
                tableName: tableName,
                documentId: documentId,
                jsonFieldsIncrements: jsonFieldsIncrements,
                condition: condition
            }
        });
}

/**
 * > Update a document in a table
 * @param {string} tableName - The name of the table to update the document in.
 * @param {string} documentId - The id of the document to update.
 * @param {Object}document - The document to be updated.
 * @param {string} [condition] - Optional coco query condition of the form "$.cost<35" that must be satisfied
 * for update to happen. See query API for more details on how to write coco query strings.
 * @returns {Promise} A promise.
 */
export function update(tableName, documentId, document, condition) {
    if (isStringEmpty(tableName)) {
        throw new Error('Please provide valid table name');
    }
    if (isStringEmpty(documentId)) {
        throw new Error('Please provide valid documentId');
    }
    if (isObjectEmpty(document)) {
        throw new Error('Please provide valid document');
    }
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.update,
            request: {
                tableName: tableName,
                documentId: documentId,
                document: document,
                condition
            }
        });
}

/**
 * It queries the database for a given table name and query string.
 * @param {string} tableName - The name of the table you want to query.
 * @param {string} queryString - The query string to be executed.
 * @param {Array<string>}[useIndexForFields=null] - This is an array of fields that you want to use the index for.
 * @param {Object} options Optional parameter to add pagination.
 * @param {number} options.pageOffset specify which row to start retrieving documents from. Eg: to get 10 documents from
 * the 100'th document, you should specify `pageOffset = 100` and `pageLimit = 10`
 * @param {number} options.pageLimit specify number of documents to retrieve. Eg: to get 10 documents from
 * the 100'th document, you should specify `pageOffset = 100` and `pageLimit = 10`
 * @returns {Promise}A promise
 */
export function query(tableName, queryString, useIndexForFields = null, options= {}) {
    if (isStringEmpty(tableName)) {
        throw new Error('Please provide valid table name');
    }
    if (!isString(queryString) || isStringEmpty(queryString)) {
        throw new Error('Please provide valid query String');
    }
    if (!useIndexForFields) {
        return sendMessage(
            {
                fn: COCO_DB_FUNCTIONS.query,
                request: {
                    tableName: tableName,
                    queryString: queryString,
                    options
                }
            });
    }
    return sendMessage(
        {
            fn: COCO_DB_FUNCTIONS.query,
            request: {
                tableName: tableName,
                queryString: queryString,
                useIndexForFields: useIndexForFields,
                options
            }
        });
}

