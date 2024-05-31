const db = require("../db/connection.js");

exports.selectArticles = (validTopics, topic, sort_by, order) => {

    const validSortBy = ["author", "title", "article_id", "topic", "created_at", "votes", "comment_count"];

    if (sort_by && !validSortBy.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: "invalid query: sort_by"});
    }

    if (order && !["asc", "desc"].includes(order)) {
        return Promise.reject({ status: 400, msg: "invalid query: order"});
    }

    if (topic && !validTopics.includes(topic)) {
        return Promise.reject({ status: 400, msg: "invalid query" }); 
    }

    const queryValues = [];

    let queryStr =
        "SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.article_id) :: INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id";

    if (topic) {
        queryStr += " WHERE topic = $1";
        queryValues.push(topic);
    }

    queryStr += " GROUP BY articles.article_id";
    
    if (sort_by && order) {
        queryStr += ` ORDER BY ${sort_by} ${order}`;
    } else if (sort_by) {
        queryStr += ` ORDER BY ${sort_by}`;
    } else if (order) {
        queryStr += ` ORDER BY articles.created_at ${order}`;
    } else {
        queryStr += " ORDER BY articles.created_at DESC";
    }
    
    queryStr += " ;";

    return db.query(queryStr, queryValues)
    .then(({ rows }) => {
        return rows;
    });
};

exports.selectArticleById = (article_id) => {
    const queryStr =
        "SELECT articles.author, title, articles.article_id, articles.body, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.article_id) :: INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id;";

    const queryValue = [article_id];

    return db.query(queryStr, queryValue)
    .then(({ rows }) => {
        const article = rows[0];
        if (article === undefined) {
            return Promise.reject({
                status: 404,
                msg: `article ${article_id} does not exist`,
            });
        }
        return article;
    });
};

exports.selectCommentsByArticleId = (article_id) => {
    const queryStr =
        "SELECT comment_id, votes, created_at, author, body, article_id FROM comments WHERE article_id = $1 ORDER BY created_at DESC;";

    const queryValue = [article_id];

    return db.query(queryStr, queryValue)
    .then(({ rows }) => {
        const comments = rows;
        return comments;
    });
};

exports.updateArticleVotes = (update, article_id) => {
    const { inc_votes } = update;

    if (typeof inc_votes !== "number") {
        return Promise.reject({
            status: 400,
            msg: `invalid input`,
        });
    }

    const queryStr =
        "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;";

    const queryValues = [inc_votes, article_id];

    return db.query(queryStr, queryValues)
    .then(({ rows }) => {
        const article = rows[0];

        return article;
    });
};

exports.checkArticleExistence = (article_id) => {
    const queryStr = 
    "SELECT * FROM articles WHERE article_id = $1;";

    const queryValue = [article_id];

    return db.query(queryStr, queryValue)
    .then(({ rows }) => {
        if (rows.length === 0) {
            return Promise.reject({
                status: 404,
                msg: `article ${article_id} does not exist`,
            });
        }
    });
};
