const {
    createEmbedding
} = require("./embeddings");


const {
    similaritySearch
} = require("./vectorStore");


async function getRAGContext(
    question
) {

    if (
        !question ||
        !question.trim()
    ) {

        return "";

    }


    console.log(
        "Searching RAG context..."
    );


    const embedding =
        await createEmbedding(
            question
        );


    const results =
        await similaritySearch(
            embedding,
            5
        );


    if (
        !results.length
    ) {

        console.log(
            "No RAG documents found."
        );

        return "";

    }


    let context = "";


    for (
        const result
        of results
    ) {

        context += `
----------------------------------------
RAG RESULT
----------------------------------------

Similarity:
${Number(result.similarity).toFixed(4)}

Content:
${result.content}

Metadata:
${JSON.stringify(
    result.metadata,
    null,
    2
)}

`;

    }


    console.log(
        `RAG results found: ${results.length}`
    );


    return context.trim();

}


module.exports = {
    getRAGContext
};