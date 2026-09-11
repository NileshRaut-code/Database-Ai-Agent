const axios = require("axios");

const config =
    require("../config");


const client =
    axios.create({

        baseURL:
            config.ollama.url,

        timeout:
            120000

    });


/**
 * Generate text using Ollama.
 */
async function generate(prompt) {

    const response =
        await client.post(
            "/api/generate",
            {
                model:
                    config.ollama.model,

                prompt,

                stream: false,

                options: {
                    temperature: 0
                }
            }
        );


    return response.data.response;
}


/**
 * Generate embedding using Ollama.
 */
async function embed(text) {

    const response =
        await client.post(
            "/api/embed",
            {
                model:
                    config.ollama.embeddingModel,

                input: text
            }
        );


    if (
        !response.data ||
        !response.data.embeddings ||
        !response.data.embeddings[0]
    ) {

        throw new Error(
            "Ollama did not return an embedding."
        );

    }


    return response
        .data
        .embeddings[0];
}


/**
 * Test Ollama.
 */
async function testOllama() {

    const response =
        await client.get(
            "/api/tags"
        );


    return response.data.models;
}


module.exports = {

    generate,

    embed,

    testOllama

};