const db = require("../db/connection.js");

exports.selectUsers = () => {
    return db.query()
    .then(( { rows } ) => {
        return rows;
    });
};