const db = require("../db/connection.js");

exports.selectUsers = () => {
    const queryStr = "SELECT * FROM users;"
    return db.query(queryStr)
    .then(( { rows } ) => {
        return rows;
    });
};

exports.selectUserByUsername = (username) => {
    console.log(username)
}