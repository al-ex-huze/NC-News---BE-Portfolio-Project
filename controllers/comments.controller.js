const { insertCommentToArticle } = require("../models/comments.model.js")

exports.addCommmentToArticle = (req, res, next) => {
    const { article_id } = req.params;

    insertCommentToArticle(req.body, article_id)
    .then((comment) => {
        res.status(201).send( { comment } );
    })
    .catch(next);
}