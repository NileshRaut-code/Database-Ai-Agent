const {
    embed
} = require("../llm/ollama");


async function createEmbedding(text) {

    if (
        !text ||
        !text.trim()
    ) {

        throw new Error(
            "Cannot embed empty text."
        );

    }


    const embedding =
        await embed(text);


    if (
        !Array.isArray(embedding) ||
        embedding.length === 0
    ) {

        throw new Error(
            "Invalid embedding returned by Ollama."
        );

    }


    return embedding;
}


async function getEmbeddingDimension() {

    const embedding =
        await createEmbedding(
            "PostgreSQL database schema"
        );


    return embedding.length;
}


module.exports = {

    createEmbedding,

    getEmbeddingDimension

};