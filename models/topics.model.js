const db = require("../db/connection.js");

exports.selectTopics = () => {
    let queryStr = "SELECT slug, description FROM topics;";

    return db.query(queryStr).then(({ rows }) => {
        return rows;
    });
};

exports.insertTopic = (newTopic) => {
    const { slug, description } = newTopic;


    const queryStr = "INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *;"
    
    const queryValues = [slug, description];

    return db.query(queryStr, queryValues).then(({ rows }) => {
        const topic = rows[0];
        return topic;
    })
}