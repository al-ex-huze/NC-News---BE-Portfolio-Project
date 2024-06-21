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
                msg: `user ${username} does not exist`,
            });
        }
        return user;
    });
}

exports.insertUser = (newUser) => {
    const { username, name } = newUser;
    let { avatar_url } = newUser;

    if (avatar_url === null || avatar_url === "") avatar_url = "https://images.pexels.com/photos/2935956/pexels-photo-2935956.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"

    const queryStr = "INSERT INTO users (username, name, avatar_url) VALUES ($1, $2, $3) RETURNING *;";

    const queryValues = [username, name, avatar_url];

    return db.query(queryStr, queryValues).then(({ rows }) => {
        const topic = rows[0];
        return topic;
    })
}