const {
    generate
} = require("../llm/ollama");


const {
    getFormattedSchema
} = require("../database/schema");


const {
    getRAGContext
} = require("../rag/ragSearch");


const {
    validateSQL
} = require("./sqlValidator");


function cleanSQL(
    response
) {

    let sql =
        response.trim();


    sql =
        sql
            .replace(
                /^```sql/i,
                ""
            )
            .replace(
                /^```/i,
                ""
            )
            .replace(
                /```$/i,
                ""
            )
            .trim();


    /*
     * Remove accidental explanation
     * before SELECT/WITH.
     */
    const selectIndex =
        sql.search(
            /\b(select|with)\b/i
        );


    if (
        selectIndex > 0
    ) {

        sql =
            sql.substring(
                selectIndex
            );

    }


    return sql.trim();

}


async function generateSQL(
    question
) {

    const schema =
        await getFormattedSchema();


    const ragContext =
        await getRAGContext(
            question
        );


    const prompt = `
You are a PostgreSQL Text-to-SQL expert.

Your job is to convert the user's natural-language
question into ONE safe PostgreSQL read-only query.

DATABASE SCHEMA:

${schema}


RELEVANT RAG CONTEXT:

${ragContext || "No additional RAG context."}


USER QUESTION:

${question}


IMPORTANT RULES:

1. Return ONLY SQL.

2. Do NOT return markdown.

3. Do NOT explain the SQL.

4. Only SELECT or WITH queries are allowed.

5. Never INSERT.

6. Never UPDATE.

7. Never DELETE.

8. Never DROP.

9. Never ALTER.

10. Never CREATE.

11. Never TRUNCATE.

12. Never GRANT.

13. Never REVOKE.

14. Never COPY.

15. Never call database functions that modify data.

16. Never use pg_sleep.

17. Use ONLY tables that exist in the DATABASE SCHEMA.

18. Use ONLY columns that exist in the DATABASE SCHEMA.

19. Never invent a table.

20. Never invent a column.

21. The DATABASE SCHEMA is authoritative.

22. RAG CONTEXT is additional business information.

23. Correctly use foreign-key relationships.

24. Use PostgreSQL syntax.

25. Prefer explicit column names.

26. Use aliases when joins make the query clearer.

27. For aggregation use COUNT, SUM, AVG, MIN or MAX
    when appropriate.

28. If the user asks for top N records, use LIMIT.

29. LIMIT must never be greater than 100.

30. If the user asks for a specific number of records,
    use that number as LIMIT.

31. Do not expose unnecessary columns.

32. Return exactly ONE SQL query.

SQL:
`;


    const response =
        await generate(
            prompt
        );


    const sql =
        cleanSQL(
            response
        );


    validateSQL(
        sql
    );


    return {
        sql,
        ragContext
    };

}


module.exports = {
    generateSQL
};