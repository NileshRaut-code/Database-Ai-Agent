const { Pool } = require("pg");
const config = require("../config");
console.log("POSTGRES CONFIG:", {
    host: config.postgres.host,
    port: config.postgres.port,
    database: config.postgres.database,
    user: config.postgres.user,
    password: config.postgres.password
});
const pool = new Pool({
    host: config.postgres.host,
    port: config.postgres.port,
    database: config.postgres.database,
    user: config.postgres.user,
    password: config.postgres.password,

    max: 10,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 10000
});


pool.on("error", (error) => {

    console.error(
        "Unexpected PostgreSQL error:",
        error
    );

});


async function query(text, params = []) {

    const result =
        await pool.query(
            text,
            params
        );

    return result.rows;
}


async function testConnection() {

    const result =
        await pool.query(
            "SELECT NOW() AS time"
        );

    return result.rows[0];
}


async function closePool() {

    await pool.end();

}


module.exports = {
    pool,
    query,
    testConnection,
    closePool
};