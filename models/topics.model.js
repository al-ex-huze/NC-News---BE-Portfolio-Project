const db = require("../db/connection.js");

exports.selectTopics = () => {
    let queryStr = "SELECT slug, description FROM topics;";

    return db.query(queryStr).then(({ rows }) => {
        return rows;
    });
};
