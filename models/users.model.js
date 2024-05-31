const db = require("../db/connection.js");

exports.selectUsers = () => {
    const queryStr = "SELECT * FROM users;"
    return db.query(queryStr)
    .then(( { rows } ) => {
        return rows;
    });
};

exports.selectUserByUsername = (username) => {
    const queryStr = "SELECT * FROM users WHERE username = $1;"
    const queryValue = [username];
    return db.query(queryStr, queryValue)
    .then(( { rows } ) => {
        const user = rows[0];
        if (user === undefined) {
            return Promise.reject({
                status: 404,
                msg: `${username} does not exist`,
            });
        }
        return user;
    });
}