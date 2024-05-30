const {
    insertCommentToArticle,
    deleteCommentById,
} = require("../models/comments.model.js");

exports.addCommmentToArticle = (req, res, next) => {
    const { article_id } = req.params;

    insertCommentToArticle(req.body, article_id)
        .then((comment) => {
            res.status(201).send({ comment });
        })
        .catch(next);
};

exports.removeCommentById = (req, res, next) => {
    const { comment_id } = req.params;
    deleteCommentById(comment_id)
    .then(() => {
        res.status(204).send();
    })
};
