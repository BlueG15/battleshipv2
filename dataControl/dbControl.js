"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseController = void 0;
const pg = __importStar(require("pg"));
//only this file gets access to pg directly
//if anything fails, protect/console.log in this file
const response_1 = require("../utils/classes/response");
const util_1 = __importDefault(require("util"));
class databaseController {
    constructor() {
        //note: property name gets lowercased when fetched
        this.pool = undefined;
        //1 sigular query
        this.query = async (text, params) => {
            if (!this.pool)
                return undefined;
            try {
                const start = Date.now();
                const res = await this.pool.query(text, params);
                const duration = Date.now() - start;
                console.log('executed query', { text, duration }, JSON.stringify(res));
                return res.rows;
            }
            catch (e) {
                console.log(`executed query: \n ${text} \n with errors: \n ${util_1.default.format(e)} \n`);
                return [];
            }
        };
        //full query returns the full response, just in case you want to check uhh data types? idk
        //example full response is 
        //"{\"command\":\"SELECT\",\"rowCount\":0,\"oid\":null,\"rows\":[],\"fields\":[{\"name\":\"roomid\",\"tableID\":40975,\"columnID\":1,\"dataTypeID\":1043,\"dataTypeSize\":-1,\"dataTypeModifier\":11,\"format\":\"text\"}],\"_parsers\":[null],\"_types\":{\"_types\":{\"arrayParser\":{},\"builtins\":{\"BOOL\":16,\"BYTEA\":17,\"CHAR\":18,\"INT8\":20,\"INT2\":21,\"INT4\":23,\"REGPROC\":24,\"TEXT\":25,\"OID\":26,\"TID\":27,\"XID\":28,\"CID\":29,\"JSON\":114,\"XML\":142,\"PG_NODE_TREE\":194,\"SMGR\":210,\"PATH\":602,\"POLYGON\":604,\"CIDR\":650,\"FLOAT4\":700,\"FLOAT8\":701,\"ABSTIME\":702,\"RELTIME\":703,\"TINTERVAL\":704,\"CIRCLE\":718,\"MACADDR8\":774,\"MONEY\":790,\"MACADDR\":829,\"INET\":869,\"ACLITEM\":1033,\"BPCHAR\":1042,\"VARCHAR\":1043,\"DATE\":1082,\"TIME\":1083,\"TIMESTAMP\":1114,\"TIMESTAMPTZ\":1184,\"INTERVAL\":1186,\"TIMETZ\":1266,\"BIT\":1560,\"VARBIT\":1562,\"NUMERIC\":1700,\"REFCURSOR\":1790,\"REGPROCEDURE\":2202,\"REGOPER\":2203,\"REGOPERATOR\":2204,\"REGCLASS\":2205,\"REGTYPE\":2206,\"UUID\":2950,\"TXID_SNAPSHOT\":2970,\"PG_LSN\":3220,\"PG_NDISTINCT\":3361,\"PG_DEPENDENCIES\":3402,\"TSVECTOR\":3614,\"TSQUERY\":3615,\"GTSVECTOR\":3642,\"REGCONFIG\":3734,\"REGDICTIONARY\":3769,\"JSONB\":3802,\"REGNAMESPACE\":4089,\"REGROLE\":4096}},\"text\":{},\"binary\":{}},\"RowCtor\":null,\"rowAsArray\":false,\"_prebuiltEmptyResultObject\":{\"roomid\":null}}"
        this.fullQquery = async (text, params) => {
            if (!this.pool)
                return undefined;
            try {
                const start = Date.now();
                const res = await this.pool.query(text, params);
                const duration = Date.now() - start;
                console.log('executed query', { text, duration }, JSON.stringify(res));
                return res;
            }
            catch (e) {
                console.log(`executed query: \n ${text} \n with errors: \n ${util_1.default.format(e)} \n`);
                return [];
            }
        };
        //for multiple sqls in a row, see manual transactions: https://node-postgres.com/features/transactions
        //transactions ussually dotn return shit, so dont use this for SELECT
        this.getClient = async () => {
            if (!this.pool)
                return undefined;
            const start = Date.now();
            const client = (await this.pool.connect());
            client.lastQuery = "DEFAULT_QUERY";
            const query = client.query;
            const release = client.release;
            // set a timeout of 5 seconds, after which we will log this client's last query
            const timeout = setTimeout(() => {
                console.error('A client has been checked out for more than 5 seconds!');
                console.error(`The last executed query on this client was: ${JSON.stringify(client.lastQuery)}`);
            }, 5000);
            // monkey patch the query method to keep track of the last query executed
            // ts dont accept this monkey patch tho
            // ignore these ts warning
            client.query = ((...args) => {
                client.lastQuery = args;
                return query.apply(client, args);
            });
            client.release = () => {
                // clear our timeout
                clearTimeout(timeout);
                // set the methods back to their old un-monkey-patched version
                client.query = query;
                client.release = release;
                const duration = Date.now() - start;
                console.log(`executed transaction with last query: \n ${client.lastQuery} \n in ${duration}ms`);
                return release.apply(client);
            };
            return client;
        };
        //a customized version for just querry text, no interaction beteen querries, no params
        this.transac = async (queryArr) => {
            const client = await this.getClient();
            if (!client)
                return undefined;
            let text = "default_query";
            try {
                await client.query('BEGIN');
                queryArr.forEach(async (i) => {
                    try {
                        await client.query(i);
                    }
                    catch (e) {
                        text = i;
                        console.log(i);
                        throw e;
                    }
                });
                await client.query('COMMIT');
            }
            catch (e) {
                await client.query('ROLLBACK');
                console.error(`executed query: \n ${text} \n with errors: \n ${util_1.default.format(e)} \n`);
                return false;
            }
            finally {
                client.release();
                return true;
            }
        };
        this.sanitizeString = (str) => {
            if (!str || !str.length)
                return "unknownPlayer";
            const reg = new RegExp(/(\W)+|SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|AND|OR|CREATE|ALTER|DROP|TABLE|DATABASE|BEGIN|COMMIT|ROLLBACK/gim);
            str = str.replace(reg, "");
            return (!str || !str.length) ? "unknownPlayer" : str;
        };
        this.getAllTableName = async () => {
            var a = await this.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
        `);
            if (!a)
                return [];
            return a;
        };
        this.initializeLogTable = async () => {
            await this.transac([
                `DROP TABLE IF EXISTS logs`,
                `CREATE TABLE IF NOT EXISTS logs (
                index INTEGER PRIMARY KEY,
                type VARCHAR(20),
                roomID VARCHAR(10),
                userID VARCHAR(20),
                userName VARCHAR(20),
                logTime VARCHAR(30),
                message TEXT
            );`,
                `INSERT INTO logs (index, type, roomID, userID, userName, logTime, message) VALUES (0, 'default', 'NULL', 'NULL', 'NULL', 'NULL', 'default initial log');`,
                `INSERT INTO logs (index, type, roomID, userID, userName, logTime, message) VALUES (1, 'default', 'NULL', 'NULL', 'NULL', 'NULL', 'default initial log 2');`,
                `INSERT INTO logs (index, type, roomID, userID, userName, logTime, message) VALUES (2, 'default', 'NULL', 'NULL', 'NULL', 'NULL', 'default initial log 3');`,
            ]);
            return;
        };
        this.writeLog = async (type = `NULL`, roomID = `NULL`, userID = `NULL`, userName = `NULL`, messege = `NULL`) => {
            try {
                var logTime = new Date().toISOString();
                var a = await this.query(`SELECT index FROM logs`);
                if (!a)
                    throw new Error("cannot querry");
                let q = `INSERT INTO logs (index, type, roomID, userID, userName, logTime, message) VALUES (${a.length}, '${type}', '${roomID}', '${userID}', '${userName}', '${logTime}', '${messege}');`;
                await this.query(q);
                return new response_1.response(false, 'writeLog', userName, 'successfully write log', { "playerID": userID, "logPos": a.length, "fullQuery": q });
            }
            catch (err) {
                return new response_1.response(true, "writeLog", userName, 'fail to write log for some reason', { "errStr": util_1.default.format(err) });
            }
        };
        this.getAllLogs = async () => {
            var a = await this.query(`SELECT * FROM logs`);
            return a;
        };
        this.test = async () => {
            var a = await this.query(`SELECT index FROM logs`);
            return a;
        };
        this.deleteEarlyLogs = async (n) => {
            if (isNaN(n) || n == Infinity || n <= 0) {
                return;
            }
            await this.transac([
                `DELETE FROM logs
            WHERE index BETWEEN 0 AND ${n};`,
                `UPDATE logs
            SET index = index - ${n}
            WHERE index > ${n};`
            ]);
        };
        this.cleanAllTablesButLogs = async () => {
            var all = await this.getAllTableName();
            var q = [];
            all.forEach(i => {
                if (i['table_name'] != 'logs') {
                    q.push(`DROP TABLE ${i['table_name']};`);
                }
            });
            await this.transac(q);
            return;
        };
        this.cleanAllTables = async () => {
            var all = await this.getAllTableName();
            var q = [];
            all.forEach(i => {
                q.push(`DROP TABLE ${i['table_name']};`);
            });
            await this.transac(q);
            return;
        };
    }
    connect() {
        this.pool = new pg.Pool({
            connectionString: process.env.POSTGRES_URL,
        });
    }
    //all methods below are unsanitized, use at careful consideration
    async insertRow(tableName, fields, values) {
        let str = `
            INSERT INTO ${tableName} (${fields.join(", ")}) 
            VALUES (${values.join(", ")});`;
        await this.query(str);
    }
    async updateTable(tableName, fields, values, primaryKeyName, primaryKeyValue) {
        let tempStr = [];
        fields.forEach((i, index) => {
            tempStr.push(`${i} = ${values[index]}`);
        });
        let str = `
            UPDATE ${tableName} 
            SET ${tempStr.join(", ")}
            WHERE ${primaryKeyName} = '${primaryKeyValue}';`;
        await this.query(str);
    }
    async deleteRow(tableName, primaryKeyName, primaryKeyValue) {
        let str = `
            DELETE FROM ${tableName}
            WHERE ${primaryKeyName} = '${primaryKeyValue}'
            RETURNING *;`;
        return this.query(str);
    }
    async setValuesNULL(tableName, fields, primaryKeyName, primaryKeyValue) {
        let tempStr = [];
        fields.forEach((i) => {
            tempStr.push(`${i} = NULL`);
        });
        let str = `
            UPDATE ${tableName} 
            SET ${tempStr.join(", ")}
            WHERE ${primaryKeyName} = '${primaryKeyValue}';`; //this forces primary key to be string lol
        await this.query(str);
    }
    async addField(tableName, fields, types) {
        let tempStr = [];
        fields.forEach((i, index) => {
            tempStr.push(`ADD COLUMN ${i} ${types[index]}`);
        });
        let str = `
            ALTER TABLE ${tableName}
            ${tempStr.join(", ")};
        `;
        await this.query(str);
    }
}
exports.databaseController = databaseController;
