require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env")
});

module.exports = {
    port: Number(process.env.PORT || 3000),

    postgres: {
        host: process.env.POSTGRES_HOST,
        port: Number(process.env.POSTGRES_PORT || 5432),
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD
    },

    ollama: {
        url: process.env.OLLAMA_URL || "http://localhost:11434",
        model: process.env.OLLAMA_MODEL || "qwen:4b",
        embeddingModel:
            process.env.OLLAMA_EMBED_MODEL || "qwen3-embedding:4b"
    }
};