const { selectArticles, selectArticleById, selectCommentsByArticleId, checkArticleExistence, updateArticleVotes 
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

exports.patchArticleVotes = (req, res, next) => {
    const { article_id } = req.params;
    selectArticleById(article_id)
    .then((existingArticle) => {
        const existingVotes = existingArticle.votes;
        return updateArticleVotes(req.body, article_id, existingVotes)
    })
    .then((article) => {
        res.status(202).send( { article } );
    })
    .catch(next);
}