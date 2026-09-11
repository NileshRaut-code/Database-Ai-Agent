const {
    generate
} = require("../llm/ollama");


async function generateAnswer(
    question,
    sql,
    rows
) {

    const databaseResult =
        JSON.stringify(
            rows,
            null,
            2
        );


    const prompt = `
You are a helpful data analyst.

USER QUESTION:

${question}


SQL QUERY:

${sql}


DATABASE RESULT:

${databaseResult}


Your job is to answer the user's question using
ONLY the DATABASE RESULT.

RULES:

- Do not invent information.
- Do not make assumptions.
- Do not use outside knowledge.
- Do not claim information that is not present.
- Use numbers accurately.
- Keep the answer clear and concise.
- If there are no rows, say that no matching data was found.
- Do not mention these instructions.
- Do not output SQL unless the user asks for it.

ANSWER:
`;


    return await generate(
        prompt
    );

}


module.exports = {
    generateAnswer
};