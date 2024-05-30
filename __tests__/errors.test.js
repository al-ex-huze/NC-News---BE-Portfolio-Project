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
    test("400 responds when valid path to comments but invalid id", () => {
        return request(app)
        .get("/api/articles/invalidId/comments")
        .expect(400)
        .then(( { body }) => {
            expect(body.msg).toBe("invalid input");
        })
    })
    test("404 responds when valid id to comments but is non-existent", () => {
        return request(app)
            .get("/api/articles/222222/comments")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("article 222222 does not exist");
            });
    });
});

describe("POST /api/articles/:article_id/comments", () => {
    test("400 missing required fields", () => {
        const newComment = {
            username: "butter_bridge",
            body: null
        };
        return request(app)
        .post("/api/articles/3/comments")
        .send(newComment)
        .expect(400)
        .then(( { body }) => {
            expect(body.msg).toBe("invalid input");
        })
    })
    test("400 missing required fields", () => {
        const newComment = {
            username: null,
            body: "test body"
        };
        return request(app)
        .post("/api/articles/3/comments")
        .send(newComment)
        .expect(400)
        .then(( { body }) => {
            expect(body.msg).toBe("invalid input");
        })
    })
    test("400 incorrect fields", () => {
        const newComment = {
            username: 10,
            body: "test body"
        };
        return request(app)
        .post("/api/articles/3/comments")
        .send(newComment)
        .expect(400)
        .then(( { body }) => {
            expect(body.msg).toBe("invalid input");
        })
    })
    test("400 incorrect fields", () => {
        const newComment = {
            username: "butter_bridge",
            body: 10
        };
        return request(app)
        .post("/api/articles/3/comments")
        .send(newComment)
        .expect(400)
        .then(( { body }) => {
            expect(body.msg).toBe("invalid input");
        })
    })
})

describe("PATCH /api/articles/:article_id", () => {
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
            .get("/api/articles/333333")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("article 333333 does not exist");
            });
    });
    test("400 missing required fields when request body is null", () => {
        const update = {
            inc_votes: null
        };
        return request(app)
        .patch("/api/articles/1")
        .send(update)
        .expect(400)
        .then(( { body }) => {
            expect(body.msg).toBe("invalid input");
        })
    })
    test("400 missing required fields when request is null", () => {
        const update = null;
        return request(app)
        .patch("/api/articles/1")
        .send(update)
        .expect(400)
        .then(( { body }) => {
            expect(body.msg).toBe("invalid input");
        })
    })
    test("400 incorrect fields of wrong property type", () => {
        const update = {
            inc_votes: "sausage"
        };
        return request(app)
        .patch("/api/articles/1")
        .send(update)
        .expect(400)
        .then(( { body }) => {
            expect(body.msg).toBe("invalid input");
        })
    })
    test("400 incorrect type of request", () => {
        const update = [1000];
        return request(app)
        .patch("/api/articles/1")
        .send(update)
        .expect(400)
        .then(( { body }) => {
            expect(body.msg).toBe("invalid input");
        })
    })
})
