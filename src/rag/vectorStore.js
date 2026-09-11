const {
    query
} = require("../database/postgres");


/**
 * Initialize pgvector and RAG table.
 */
async function initializeVectorStore(
    dimension
) {

    if (
        !dimension ||
        !Number.isInteger(dimension) ||
        dimension <= 0
    ) {

        throw new Error(
            "Invalid embedding dimension."
        );

    }


    await query(`
        CREATE EXTENSION IF NOT EXISTS vector;
    `);


    const existing =
        await query(`
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE
                    table_schema = 'public'
                    AND table_name = 'rag_documents'
            ) AS exists;
        `);


    if (!existing[0].exists) {

        await query(`
            CREATE TABLE rag_documents (

                id SERIAL PRIMARY KEY,

                content TEXT NOT NULL,

                metadata JSONB
                    DEFAULT '{}'::jsonb,

                embedding VECTOR(${dimension})
                    NOT NULL,

                created_at TIMESTAMP
                    DEFAULT CURRENT_TIMESTAMP
            );
        `);

    } else {

        const column =
            await query(`
                SELECT
                    format_type(
                        atttypid,
                        atttypmod
                    ) AS type
                FROM pg_attribute
                WHERE
                    attrelid =
                        'rag_documents'::regclass
                    AND attname =
                        'embedding';
            `);


        const currentType =
            column[0]?.type || "";


        const expectedType =
            `vector(${dimension})`;


        if (
            currentType !== expectedType
        ) {

            throw new Error(
                `Embedding dimension mismatch. ` +
                `Database: ${currentType}. ` +
                `Current model: ${expectedType}. ` +
                `Delete rag_documents and run ingestion again.`
            );

        }

    }


    console.log(
        `RAG vector store ready. Dimension: ${dimension}`
    );

}


/**
 * Delete existing RAG data.
 */
async function clearDocuments() {

    await query(`
        DELETE FROM rag_documents;
    `);


    console.log(
        "Existing RAG documents cleared."
    );

}


/**
 * Insert document.
 */
async function insertDocument(
    content,
    metadata,
    embedding
) {

    if (
        !Array.isArray(embedding)
    ) {

        throw new Error(
            "Invalid embedding."
        );

    }


    await query(
        `
        INSERT INTO rag_documents
        (
            content,
            metadata,
            embedding
        )
        VALUES
        (
            $1,
            $2,
            $3::vector
        );
        `,
        [
            content,

            JSON.stringify(
                metadata || {}
            ),

            JSON.stringify(
                embedding
            )
        ]
    );

}


/**
 * Similarity search.
 */
async function similaritySearch(
    embedding,
    limit = 5
) {

    if (
        !Array.isArray(embedding)
    ) {

        throw new Error(
            "Invalid query embedding."
        );

    }


    const safeLimit =
        Math.min(
            Math.max(
                Number(limit) || 5,
                1
            ),
            20
        );


    return await query(
        `
        SELECT

            id,

            content,

            metadata,

            1 - (
                embedding <=> $1::vector
            ) AS similarity

        FROM rag_documents

        ORDER BY
            embedding <=> $1::vector

        LIMIT $2;
        `,
        [
            JSON.stringify(
                embedding
            ),

            safeLimit
        ]
    );

}


module.exports = {

    initializeVectorStore,

    clearDocuments,

    insertDocument,

    similaritySearch

};