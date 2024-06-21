const db = require("../db/connection.js");

exports.selectArticles = (validTopics, topic, sort_by, order, limit, p) => {
    const validSortBy = [
        "author",
        "title",
        "article_id",
        "topic",
        "created_at",
        "votes",
        "comment_count",
    ];

    const offset = limit * (p - 1);

    if (sort_by && !validSortBy.includes(sort_by)) {
        return Promise.reject({ status: 400, msg: "invalid query: sort_by" });
    }

    if (order && !["asc", "desc"].includes(order)) {
        return Promise.reject({ status: 400, msg: "invalid query: order" });
    }

    if (topic && !validTopics.includes(topic)) {
        return Promise.reject({ status: 400, msg: "invalid query" });
    }

    const queryValues = [];

    let queryStr =
        "SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.article_id) :: INT AS comment_count, COUNT(*) OVER() :: INT AS total_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id";

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

    if (topic) {
        queryStr += " LIMIT $2 OFFSET $3;";
    } else {
        queryStr += " LIMIT $1 OFFSET $2;";
    }

    queryValues.push(limit, offset);

    return db.query(queryStr, queryValues).then(({ rows }) => {
        return rows;
    });
};

exports.selectArticleById = (article_id) => {
    const queryStr =
        "SELECT articles.author, title, articles.article_id, articles.body, topic, articles.created_at, articles.votes, article_img_url, COUNT(comments.article_id) :: INT AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id;";

    const queryValue = [article_id];

    return db.query(queryStr, queryValue).then(({ rows }) => {
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

exports.selectCommentsByArticleId = (article_id, limit, p) => {
    const offset = limit * (p - 1);

    const queryStr =
        "SELECT comment_id, votes, created_at, author, body, article_id, COUNT(*) OVER() :: INT AS total_count FROM comments WHERE article_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3;";

    const queryValues = [article_id, limit, offset];

    return db.query(queryStr, queryValues).then(({ rows }) => {
        const comments = rows;
        return comments;
    });
};

exports.updateArticleVotes = (update, article_id) => {
    const { inc_votes } = update;

    const queryStr =
        "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;";

    const queryValues = [inc_votes, article_id];

    return db.query(queryStr, queryValues).then(({ rows }) => {
        const article = rows[0];

        return article;
    });
};

exports.insertArticle = (newArticle) => {
    const { author, title, body, topic, article_img_url } = newArticle;

    const checkAuthorQueryStr =
        "SELECT username FROM users WHERE EXISTS (SELECT username FROM users WHERE username = $1);";

    const checkTopicQueryStr =
        "SELECT slug FROM topics WHERE EXISTS (SELECT slug FROM topics WHERE slug = $1);";

    let queryStr = "";

    const queryValues = [];

    if (article_img_url === null || article_img_url === undefined) {
        queryValues.push(author, title, body, topic);
        queryStr =
            "INSERT INTO articles (author, title, body, topic) VALUES ($1, $2, $3, $4) RETURNING article_id;";
    } else {
        queryValues.push(author, title, body, topic, article_img_url);
        queryStr =
            "INSERT INTO articles (author, title, body, topic, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING article_id;";
    }

    return db.query(checkAuthorQueryStr, [author]).then((isAuthorValid) => {
        if (isAuthorValid.rowCount === 0) {
            return Promise.reject({
                status: 404,
                msg: `${author} user does not exist`,
            });
        }
        return db
            .query(checkTopicQueryStr, [topic])
            .then((isTopicValid) => {
                if (isTopicValid.rowCount === 0) {
                    return Promise.reject({
                        status: 404,
                        msg: `${topic} topic does not exist`,
                    });
                }

                return db.query(queryStr, queryValues);
            })
            .then(({ rows }) => {
                const article = rows[0];
                const { article_id } = article;
                return article_id;
            });
    });
};

exports.deleteArticleById = (article_id) => {
    const queryStr = "DELETE FROM articles WHERE article_id = $1 RETURNING *;";

    const queryValue = [article_id];
    return db.query(queryStr, queryValue).then(({ rowCount }) => {
        if (rowCount === 0) {
            return Promise.reject({
                status: 404,
                msg: `article ${article_id} does not exist`,
            });
        }
    });
};
