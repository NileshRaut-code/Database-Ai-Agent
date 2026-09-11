const {
    generateSQL
} = require("./sqlGenerator");


const {
    executeSQL
} = require("./sqlExecutor");


const {
    generateAnswer
} = require("./answerGenerator");


async function ask(
    question
) {

    if (
        !question ||
        !question.trim()
    ) {

        throw new Error(
            "Question cannot be empty."
        );

    }


    console.log(
        "\n----------------------------------------"
    );

    console.log(
        "STEP 1: Generating SQL"
    );

    console.log(
        "----------------------------------------"
    );


    const sqlResult =
        await generateSQL(
            question
        );


    const {
        sql,
        ragContext
    } =
        sqlResult;


    console.log(
        "\nGenerated SQL:"
    );

    console.log(
        sql
    );


    console.log(
        "\n----------------------------------------"
    );

    console.log(
        "STEP 2: Executing SQL"
    );

    console.log(
        "----------------------------------------"
    );


    const databaseResult =
        await executeSQL(
            sql
        );


    console.log(
        `Rows returned: ${databaseResult.rowCount}`
    );


    console.log(
        `Query time: ${databaseResult.duration} ms`
    );


    console.log(
        "\n----------------------------------------"
    );

    console.log(
        "STEP 3: Generating Answer"
    );

    console.log(
        "----------------------------------------"
    );


    const answer =
        await generateAnswer(
            question,

            sql,

            databaseResult.rows
        );


    return {

        question,

        sql,

        ragContext,

        rows:
            databaseResult.rows,

        rowCount:
            databaseResult.rowCount,

        duration:
            databaseResult.duration,

        answer

    };

}


module.exports = {
    ask
};