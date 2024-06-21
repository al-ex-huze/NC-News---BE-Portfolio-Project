exports.handleCustomErrors = (err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else next(err);
};

exports.handlePsqlErrors = (err, req, res, next) => {
    if (err.code === "23503") {
        res.status(400).send({ msg: "23503 - missing required key" });
    } else if (err.code === "23502") {
        res.status(400).send({ msg: "23502 - missing required key" });
    } else if (err.code === "22P02") {
        res.status(400).send({ msg: "22P02 - invalid input" });
    } else if (err.code === "2201X") {
        res.status(400).send({ msg: "2201X - negative page number" });
    } else if (err.code === "2201W") {
        res.status(400).send({ msg: "2201W - negative limit number" });
    } else if (err.code === "23505") {
        res.status(400).send({ msg: `23505 - duplicate ${err.detail}` });
    } else if (err.code) {
        console.log(err, "PSQL ERROR");
    } else next(err);
};

exports.handleServerErrors = (err, req, res, next) => {
    console.log(err)
    res.status(500).send({ msg: "Internal Server Error" });
};
