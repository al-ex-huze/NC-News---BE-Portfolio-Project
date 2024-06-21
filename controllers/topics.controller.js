const { selectTopics, insertTopic } = require("../models/topics.model.js");

exports.getTopics = (req, res, next) => {
    selectTopics()
        .then((topics) => {
            res.status(200).send({ topics });
        })
        .catch(next);
};

exports.createTopic = (req, res, next) => {
    insertTopic(req.body)
        .then((topic) => {
            console.log(topic, "return in controller")
            res.status(201);
            res.send({ topic })
        })
        .catch(next);
};
