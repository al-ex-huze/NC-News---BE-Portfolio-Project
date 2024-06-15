const { selectTopics } = require("../models/topics.model.js");
const {
    selectArticles,
    selectArticleById,
    selectCommentsByArticleId,
    updateArticleVotes,
    insertArticle,
} = require("../models/articles.model.js");

exports.getArticles = (req, res, next) => {
    const { topic, sort_by, order } = req.query;
    req.query.limit ? limit = req.query.limit : limit = 10;
    req.query.p ? p = req.query.p : p = 1;

    selectTopics()
        .then((topics) => {
            const validTopics = [];
            topics.forEach((topic) => {
                validTopics.push(topic.slug);
            });
            return selectArticles(validTopics, topic, sort_by, order, limit, p);
        })
        .then((articles) => {
            res.status(200).send({ articles });
        })
        .catch(next);
};

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params;
    selectArticleById(article_id)
        .then((article) => {
            res.status(200).send({ article });
        })
        .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params;

    const promises = [selectCommentsByArticleId(article_id)];

    if (article_id) {
        promises.push(selectArticleById(article_id));
    }

    Promise.all(promises)
        .then((resolves) => {
            const comments = resolves[0];
            res.status(200).send({ comments });
        })
        .catch(next);
};

exports.patchArticleVotes = (req, res, next) => {
    const { article_id } = req.params;

    updateArticleVotes(req.body, article_id)
        .then((article) => {
            res.status(200).send({ article });
        })
        .catch(next);
};

exports.createArticle = (req, res, next) => {
    insertArticle(req.body)
        .then((article_id) => {
            return selectArticleById(article_id.toString());
        })
        .then((article) => {
            res.status(201);
            res.send({ article });
        })
        .catch(next);
};
