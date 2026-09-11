require("dotenv").config();


const readline =
    require("readline");


const {
    ingestSchema
} = require("./rag/ingest");


const {
    ask
} = require("./agent/agent");


const {
    testConnection
} = require("./database/postgres");


const {
    testOllama
} = require("./llm/ollama");


async function main() {

    console.log(`
========================================
        LOCAL AI SQL AGENT
========================================

LLM:
  Qwen 4B

Embedding:
  Qwen3 Embedding 4B

Database:
  PostgreSQL + pgvector

========================================
`);


    /*
     * STEP 1
     * Test PostgreSQL
     */

    try {

        console.log(
            "Testing PostgreSQL connection..."
        );


        const db =
            await testConnection();


        console.log(
            "PostgreSQL connected:",
            db.time
        );

    } catch (error) {

        console.error(
            "\nPostgreSQL connection failed:"
        );


        console.error(
            error.message
        );


        process.exit(1);

    }


    /*
     * STEP 2
     * Test Ollama
     */

    try {

        console.log(
            "\nTesting Ollama connection..."
        );


        const models =
            await testOllama();


        console.log(
            "Ollama connected."
        );


        console.log(
            "Available models:"
        );


        for (
            const model
            of models
        ) {

            console.log(
                `  - ${model.name}`
            );

        }

    } catch (error) {

        console.error(
            "\nOllama connection failed:"
        );


        console.error(
            error.response?.data ||
            error.message
        );


        process.exit(1);

    }


    /*
     * STEP 3
     * RAG ingestion
     */

    try {

        await ingestSchema();

    } catch (error) {

        console.error(
            "\nRAG ingestion failed:"
        );


        console.error(
            error.response?.data ||
            error.message
        );


        process.exit(1);

    }


    /*
     * STEP 4
     * Interactive mode
     */

    console.log(`
========================================
        ASK YOUR DATABASE
========================================

Examples:

  Show me 10 customers

  How many customers do we have?

  How many orders do we have?

  Which products are most expensive?

  Show the top 3 customers by spending

  How many completed orders do we have?

  Show all products in Electronics

Type "exit" to quit.

========================================
`);


    const rl =
        readline.createInterface({

            input:
                process.stdin,

            output:
                process.stdout

        });


    function askQuestion() {

        rl.question(
            "\nYou > ",

            async (question) => {

                question =
                    question.trim();


                if (
                    question.toLowerCase() ===
                    "exit"
                ) {

                    rl.close();

                    process.exit(0);

                }


                if (!question) {

                    askQuestion();

                    return;

                }


                try {

                    const result =
                        await ask(
                            question
                        );


                    console.log(`
========================================
ANSWER
========================================
`);

                    console.log(
                        result.answer
                    );


                } catch (error) {

                    console.error(`
========================================
AGENT ERROR
========================================
`);

                    console.error(
                        error.message
                    );

                }


                askQuestion();

            }
        );

    }


    askQuestion();

}


main();