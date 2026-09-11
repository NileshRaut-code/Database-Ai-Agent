const {
    getFormattedSchema
} = require("../database/schema");


const {
    createEmbedding,
    getEmbeddingDimension
} = require("./embeddings");


const {
    initializeVectorStore,
    clearDocuments,
    insertDocument
} = require("./vectorStore");


async function ingestSchema() {

    console.log(
        "\n================================"
    );

    console.log(
        "STARTING RAG INGESTION"
    );

    console.log(
        "================================\n"
    );


    console.log(
        "Reading PostgreSQL schema..."
    );


    const schema =
        await getFormattedSchema();


    console.log(
        `Schema size: ${schema.length} characters`
    );


    console.log(
        "\nDetecting embedding dimension..."
    );


    const dimension =
        await getEmbeddingDimension();


    console.log(
        `Embedding dimension: ${dimension}`
    );


    await initializeVectorStore(
        dimension
    );


    await clearDocuments();


    console.log(
        "\nCreating schema embedding..."
    );


    const embedding =
        await createEmbedding(
            schema
        );


    await insertDocument(
        schema,
        {
            type:
                "database_schema",

            source:
                "postgresql"
        },
        embedding
    );


    console.log(
        "\nCreating vector index..."
    );


    try {

        await require("../database/postgres")
            .query(`
                CREATE INDEX IF NOT EXISTS
                rag_documents_embedding_idx
                ON rag_documents
                USING hnsw
                (embedding vector_cosine_ops);
            `);

    } catch (error) {

        console.log(
            "Vector index creation skipped:",
            error.message
        );

    }


    console.log(
        "\nSchema successfully embedded!"
    );


    console.log(
        "RAG ingestion complete.\n"
    );


    return {
        dimension,
        schema
    };

}


module.exports = {
    ingestSchema
};