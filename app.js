const express = require("express");
const app = express();

app.use(express.json());

const { getEndpoints } = require("./controllers/api.controller.js");
const { getTopics } = require("./controllers/topics.controller.js");

const {
    getArticles,
    getArticleById,
    getCommentsByArticleId,
    patchArticleVotes,
} = require("./controllers/articles.controller.js");

const {
    addCommmentToArticle, removeCommentById
} = require("./controllers/comments.controller.js");

const {
    handleCustomErrors,
    handlePsqlErrors,
    handleServerErrors,
} = require("./errors/app.errors.js");

app.get("/api", getEndpoints);
app.get("/api/topics", getTopics);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", addCommmentToArticle);
app.patch("/api/articles/:article_id", patchArticleVotes);

app.delete("/api/comments/:comment_id", removeCommentById)

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);
app.all("*", (req, res) => {
    res.status(404).send({ msg: "Not found" });
});

module.exports = app;
