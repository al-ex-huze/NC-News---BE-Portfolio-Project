const {
    insertUser,
    selectUsers,
    selectUserByUsername,
} = require("../models/users.model.js");

exports.getUsers = (req, res, next) => {
    selectUsers().then((users) => {
        res.status(200).send({ users });
    });
};

exports.getUserByUsername = (req, res, next) => {
    const { username } = req.params;
    selectUserByUsername(username)
        .then((user) => {
            res.status(200).send({ user });
        })
        .catch(next);
};

exports.createUser = (req, res, next) => {
    insertUser(req.body)
    .then((user) => {
        res.status(201);
        res.send({ user });
    })
    .catch(next);
};
