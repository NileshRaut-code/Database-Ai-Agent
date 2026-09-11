const {
    query
} = require("../database/postgres");


async function executeSQL(
    sql
) {

    const start =
        Date.now();


    const rows =
        await query(sql);


    const duration =
        Date.now() - start;


    return {

        rows,

        rowCount:
            rows.length,

        duration

    };

}


module.exports = {
    executeSQL
};