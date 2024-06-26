const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const { getEndpoints } = require("./controllers/api.controller.js");
const {
    getUsers,
    getUserByUsername,
    createUser,
    removeUserByUsername
} = require("./controllers/users.controller.js");
const {
    getTopics,
    createTopic,
} = require("./controllers/topics.controller.js");

const {
    getArticles,
    getArticleById,
    getCommentsByArticleId,
    patchArticleVotes,
    createArticle,
    removeArticleById,
} = require("./controllers/articles.controller.js");

const {
    addCommmentToArticle,
    removeCommentById,
    patchCommentVotes,
} = require("./controllers/comments.controller.js");

const {
    handleCustomErrors,
    handlePsqlErrors,
    handleServerErrors,
} = require("./errors/app.errors.js");

app.get("/api", getEndpoints);

app.get("/api/users", getUsers);
app.get("/api/users/:username", getUserByUsername);
app.post("/api/users", createUser);
app.delete("/api/users/:username", removeUserByUsername)

app.get("/api/topics", getTopics);
app.post("/api/topics", createTopic);

app.get("/api/articles", getArticles);
app.post("/api/articles", createArticle);
app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticleVotes);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", addCommmentToArticle);
app.delete("/api/articles/:article_id", removeArticleById)

app.patch("/api/comments/:comment_id", patchCommentVotes);
app.delete("/api/comments/:comment_id", removeCommentById);

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);
app.all("*", (req, res) => {
    res.status(404).send({ msg: "not found" });
});

module.exports = app;
