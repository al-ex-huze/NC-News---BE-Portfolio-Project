const endpoints = require("../endpoints.json")

exports.getEndpoints = (req, res) => {
    const endpointsClone = JSON.parse(JSON.stringify(endpoints));
    res.status(200).send( endpointsClone );
}