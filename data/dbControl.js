const pg = require('pg');

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

let databaseController = {}


//for 1 sqls
databaseController.query = async (text, params) => {
    try{
        const start = Date.now()
        const res = await pool.query(text, params)
        const duration = Date.now() - start
        console.log('executed query', { text, duration }, JSON.stringify(res))
        return res
    } catch(e){
        console.log(`executed query: \n ${text} \n with errors: \n ${e} \n`)
        return []
    }
}

//for multiple sqls in a row, see manual transactions: https://node-postgres.com/features/transactions
databaseController.getClient = async () => {
    const client = await pool.connect()
    const query = client.query
    const release = client.release
    // set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
      console.error('A client has been checked out for more than 5 seconds!')
      console.error(`The last executed query on this client was: ${client.lastQuery}`)
    }, 5000)
    // monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
      client.lastQuery = args
      return query.apply(client, args)
    }
    client.release = () => {
      // clear our timeout
      clearTimeout(timeout)
      // set the methods back to their old un-monkey-patched version
      client.query = query
      client.release = release
      return release.apply(client)
    }
    return client
}

//a customized version for just querry text, no interaction beteen querries, no params
databaseController.transac = async (queryArr) => {
    const client = await databaseController.getClient()
    try{
        await client.query('BEGIN')
        queryArr.forEach(async i => {
            await client.query(i)
        });
        await client.query('COMMIT')
    }catch(e){
        await client.query('ROLLBACK')
        console.error(e)
        return []
    } finally {
        client.release()
    }

}

module.exports = databaseController

