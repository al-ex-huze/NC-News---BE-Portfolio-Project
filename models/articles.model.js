const db = require("../db/connection.js");

exports.selectArticleById = (article_id) => {
    let queryStr = "SELECT author, title, article_id, body, topic, created_at, votes, article_img_url FROM articles WHERE article_id = $1";

    const queryValue = [article_id];

    queryStr += " ;";

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