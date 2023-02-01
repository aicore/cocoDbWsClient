/*
 * GNU AGPL-3.0 License
 *
 * Copyright (c) 2021 - present core.ai . All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see https://opensource.org/licenses/AGPL-3.0.
 *
 */

// @INCLUDE_IN_API_DOCS

export {
    get,
    init,
    close,
    put,
    mathAdd,
    deleteDocument,
    deleteDb,
    getFromIndex,
    createIndex,
    deleteTable,
    createDb,
    createTable,
    getFromNonIndex,
    hello,
    update,
    query

} from './utils/api.js';

/**
 * ## Installing the library
 * ```bash
 * npm install @aicore/cocodb-ws-client
 * ```
 * ## importing in your js file
 * ```js
 * import * as coco from "@aicore/cocodb-ws-client"; // to import all functions
 * ```
 *
 * ## Initializing the client
 *
 * Create a connection to the cocoDbServiceEndPoint and listens for messages. The connection will
 * be maintained and it will try to automatically re-establish broken connections if there are network issues.
 * You need to await on this function before staring to use any db APIs. Any APIs called while the connection is
 * not fully setup will throw an error.
 *
 * ### Parameters
 *
 * *   `cocoDbServiceEndPoint` **[string][1]** The URL of the coco-db service.
 * *   `authKey` **[string][1]** The authKey is a base64 encoded string of the username and password.
 *
 * Returns **[Promise][2]\<null>** Resolves when the cocodb client is ready to send/receive requests for the first time.
 * Rejects only if the user calls `close` API before any connection is established.
 * ```js
 * await db.init("ws://endpoint.coco", "your_auth_key");
 * ```
 *
 * ## Detailed API Docs
 * See this wiki for detailed API docs
 * * https://github.com/aicore/cocoDbWsClient/wiki/api-API
 * * More coco lib level detailed docs can be found at https://github.com/aicore/libmysql/wiki/db-API
 *
 * ## close the client
 *
 * Closes the connection to the server. You need to await on this function before you can call init again.
 *
 * Returns **[Promise][2]\<null>** Resolves when the cocodb client is closed and you are free to call init again. Never rejects.
 * ```js
 * await db.close();
 * ```
 * @module @aicore/cocodb-ws-client
 */