const db = require("../db/connection.js");

exports.insertCommentToArticle = (newComment, article_id) => {
    const { username, body } = newComment;

    if (typeof body !== "string") {
        return Promise.reject({
            status: 400,
            msg: "invalid input",
        });
    }

    const queryStr =
        "INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *;";

    const queryValues = [username, body, article_id];

    return db.query(queryStr, queryValues).then(({ rows }) => {
        return (comment = rows[0]);
    });
};

exports.deleteCommentById = (comment_id) => {
    
}