const { selectArticles, selectArticleById, selectCommentsByArticleId, checkArticleExistence, insertCommentToArticle 
} = require("../models/articles.model.js")

exports.getArticles = (req, res, next) => {
    selectArticles()
    .then((articles) => {
        res.status(200).send( { articles } );
    })
}

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params;
    selectArticleById(article_id)
    .then((article) => {
        res.status(200).send( { article } );
    })
    .catch(next);
};

exports.getCommentsByArticleId = (req, res, next) => {
    const { article_id } = req.params;

    const promises = [selectCommentsByArticleId(article_id)];

    if (article_id) {
        promises.push(checkArticleExistence(article_id));
    }

    Promise.all(promises)
    .then((resolves) => {
        const comments = resolves[0];
        res.status(200).send( { comments } );
    })
    .catch(next);
}

exports.addCommmentToArticle = (req, res, next) => {
    const { article_id } = req.params;

    insertCommentToArticle(req.body, article_id)
    .then((comment) => {
        res.status(201).send( { comment } );
    })
    .catch(next);
}