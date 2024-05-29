const app = require("../app.js");
const request = require("supertest");

const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /nonValidRoute", () => {
    test("404 responds when route not found", () => {
        return request(app)
        .get("/nonValidRoute")
        .expect(404)
        .then(( { body } ) => {
            expect(body.msg).toBe("Not found");
        })
    })
    test("400 responds when valid path but invalid id", () => {
        return request(app)
        .get("/api/articles/invalidId")
        .expect(400)
        .then(( { body }) => {
            expect(body.msg).toBe("invalid input");
        })
    })
    test("404 responds when valid id but is non-existent", () => {
        return request(app)
            .get("/api/articles/111111")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("article 111111 does not exist");
            });
    });
});