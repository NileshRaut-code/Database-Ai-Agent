const {
    query
} = require("./postgres");


/**
 * Get database columns.
 */
async function getDatabaseSchema() {

    return await query(`
        SELECT
            table_schema,
            table_name,
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns
        WHERE
            table_schema = 'public'
        ORDER BY
            table_name,
            ordinal_position;
    `);

}


/**
 * Get primary keys.
 */
async function getPrimaryKeys() {

    return await query(`
        SELECT
            tc.table_name,
            kcu.column_name
        FROM information_schema.table_constraints tc

        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name =
                kcu.constraint_name
            AND tc.table_schema =
                kcu.table_schema

        WHERE
            tc.constraint_type = 'PRIMARY KEY'
            AND tc.table_schema = 'public'

        ORDER BY
            tc.table_name,
            kcu.ordinal_position;
    `);

}


/**
 * Get foreign keys.
 */
async function getForeignKeys() {

    return await query(`
        SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name

        FROM information_schema.table_constraints tc

        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name =
                kcu.constraint_name
            AND tc.table_schema =
                kcu.table_schema

        JOIN information_schema.constraint_column_usage ccu
            ON ccu.constraint_name =
                tc.constraint_name
            AND ccu.table_schema =
                tc.table_schema

        WHERE
            tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'

        ORDER BY
            tc.table_name,
            kcu.column_name;
    `);

}


/**
 * Get row count for tables.
 */
async function getTableStatistics() {

    const tables =
        await query(`
            SELECT
                table_name
            FROM information_schema.tables
            WHERE
                table_schema = 'public'
                AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);


    const results = [];


    for (const table of tables) {

        const tableName =
            table.table_name
                .replace(/"/g, '""');


        const rows =
            await query(
                `SELECT COUNT(*)::bigint AS count
                 FROM "${tableName}"`
            );


        results.push({
            table_name:
                table.table_name,

            row_count:
                Number(rows[0].count)
        });

    }


    return results;
}


/**
 * Get complete schema.
 */
async function getSchemaInfo() {

    const [
        columns,
        primaryKeys,
        foreignKeys,
        statistics
    ] = await Promise.all([

        getDatabaseSchema(),

        getPrimaryKeys(),

        getForeignKeys(),

        getTableStatistics()

    ]);


    return {
        columns,
        primaryKeys,
        foreignKeys,
        statistics
    };
}


/**
 * Convert schema to text for Qwen/RAG.
 */
async function getFormattedSchema() {

    const schema =
        await getSchemaInfo();


    const tables = {};


    for (const column of schema.columns) {

        if (!tables[column.table_name]) {

            tables[column.table_name] = [];

        }


        tables[column.table_name].push(
            column
        );

    }


    let output = "";


    output +=
        "DATABASE: PostgreSQL\n\n";


    output +=
        "TABLES AND COLUMNS\n";

    output +=
        "==================\n\n";


    for (
        const [tableName, columns]
        of Object.entries(tables)
    ) {

        const stats =
            schema.statistics.find(
                item =>
                    item.table_name ===
                    tableName
            );


        output +=
            `TABLE: ${tableName}\n`;


        if (stats) {

            output +=
                `ROW COUNT: ${stats.row_count}\n`;

        }


        output += "\n";


        for (const column of columns) {

            output +=
                `  COLUMN: ${column.column_name}\n`;

            output +=
                `    TYPE: ${column.data_type}\n`;

            output +=
                `    NULLABLE: ${column.is_nullable}\n`;


            if (column.column_default) {

                output +=
                    `    DEFAULT: ${column.column_default}\n`;

            }


            output += "\n";

        }


        output += "\n";

    }


    output +=
        "PRIMARY KEYS\n";

    output +=
        "============\n\n";


    if (
        schema.primaryKeys.length === 0
    ) {

        output +=
            "No primary keys found.\n\n";

    } else {

        for (
            const key of schema.primaryKeys
        ) {

            output +=
                `  ${key.table_name}.${key.column_name}\n`;

        }


        output += "\n";

    }


    output +=
        "FOREIGN KEY RELATIONSHIPS\n";

    output +=
        "=========================\n\n";


    if (
        schema.foreignKeys.length === 0
    ) {

        output +=
            "No foreign key relationships found.\n\n";

    } else {

        for (
            const key of schema.foreignKeys
        ) {

            output +=
                `  ${key.table_name}.${key.column_name}` +
                ` -> ` +
                `${key.foreign_table_name}.${key.foreign_column_name}\n`;

        }


        output += "\n";

    }


    output +=
        "BUSINESS DEFINITIONS\n";

    output +=
        "====================\n\n";


    output += `
customers:
Stores customer information such as name,
email, location, signup date, customer type,
and active status.

products:
Stores products available for sale including
category, price, inventory quantity, and supplier.

orders:
Stores customer orders including customer,
order date, order status, and total order amount.

order_items:
Stores individual products belonging to an order.
Each row connects an order with a product and
contains quantity and unit price.

Business rules:

- Customer spending can be calculated using
  SUM(orders.total_amount).

- Orders are connected to customers using
  orders.customer_id = customers.id.

- Order items are connected to orders using
  order_items.order_id = orders.id.

- Order items are connected to products using
  order_items.product_id = products.id.
`;


    return output.trim();
}


module.exports = {

    getDatabaseSchema,

    getPrimaryKeys,

    getForeignKeys,

    getTableStatistics,

    getSchemaInfo,

    getFormattedSchema

};