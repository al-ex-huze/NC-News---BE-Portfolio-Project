const db = require("../db/connection.js");

exports.selectArticles = () => {
    const queryStr = "SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.article_id) :: INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC;";

    return db.query(queryStr)
    .then(( { rows } ) => {
        return rows;
    })
}

exports.selectArticleById = (article_id) => {
    const queryStr = "SELECT author, title, article_id, body, topic, created_at, votes, article_img_url FROM articles WHERE article_id = $1;";

    const queryValue = [article_id];

    return db.query(queryStr, queryValue)
    .then(( { rows } ) => {
        const article = rows[0];
        if (article === undefined) {
            return Promise.reject({
                status: 404,
                msg: `article ${article_id} does not exist`,
            })
        }
        return article;
    })
}

exports.selectCommentsByArticleId = (article_id) => {
    const queryStr = "SELECT comment_id, votes, created_at, author, body, article_id FROM comments WHERE article_id = $1 ORDER BY created_at DESC;";

    const queryValue = [article_id];

    return db.query(queryStr, queryValue)
    .then(( { rows } ) => {
        const comments = rows;
        return comments;
    })
}

// exports.insertCommentToArticle = (newComment, article_id) => {
//     const { username, body } = newComment;

//     if (typeof body !== "string") {
//         return Promise.reject({
//             status: 400,
//             msg: "invalid input",
//         })
//     }
    
//     const queryStr = "INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *;"

//     const queryValues = [username, body, article_id];

//     return db.query(queryStr, queryValues)
//     .then(( { rows } ) => {
//         return comment = rows[0]
//     })
// }

exports.checkArticleExistence = (article_id) => {
    const queryStr = "SELECT * FROM articles WHERE article_id = $1;";

    const queryValue = [article_id];

    return db.query(queryStr, queryValue)
    .then(( { rows } ) => {
        if (rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: `article ${article_id} does not exist`,
            })
        }
    })
}