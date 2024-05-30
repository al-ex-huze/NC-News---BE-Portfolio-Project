const app = require("../app.js");
const request = require("supertest");

const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");

const currentEndpointsTest = require("../endpoints.json");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api", () => {
    test("200 responds with object containing available endpoints", () => {
        return request(app)
            .get("/api")
            .expect(200)
            .expect("Content-Type", "application/json; charset=utf-8")
            .then(({ body }) => {
                expect(JSON.stringify(body)).toBe(
                    JSON.stringify(currentEndpointsTest)
                );
            });
    });
    test("404 responds when route not found", () => {
        return request(app)
            .get("/nonValidRoute")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("Not found");
            });
    });
});

describe("GET /api/topics", () => {
    test("200 returns an array of topic objects", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then(({ body }) => {
                const { topics } = body;
                expect(topics.length).toBe(3);
                topics.forEach((topic) => {
                    expect(typeof topic.description).toBe("string");
                    expect(typeof topic.slug).toBe("string");
                });
            });
    });
});

describe("GET /api/articles", () => {
    test("200 returns an array of all article objects", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .expect("Content-Type", "application/json; charset=utf-8")
            .then(({ body }) => {
                const { articles } = body;
                expect(articles.length).toBe(13);
                articles.forEach((article) => {
                    expect(typeof article.author).toBe("string");
                    expect(typeof article.title).toBe("string");
                    expect(typeof article.article_id).toBe("number");
                    expect(typeof article.topic).toBe("string");
                    expect(typeof article.created_at).toBe("string");
                    expect(typeof article.votes).toBe("number");
                    expect(typeof article.article_img_url).toBe("string");
                    expect(typeof article.comment_count).toBe("number");
                });
            });
    });
    test("200 returns sorted by descending date order", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles).toBeSortedBy("created_at", {
                    descending: true,
                });
            });
    });
});

describe("GET /api/articles/:article_id", () => {
    test("200 returns an article object with corresponding ID", () => {
        return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body }) => {
                const { article } = body;
                expect(article.article_id).toEqual(1);
                expect(typeof article.author).toBe("string");
                expect(typeof article.title).toBe("string");
                expect(typeof article.article_id).toBe("number");
                expect(typeof article.body).toBe("string");
                expect(typeof article.topic).toBe("string");
                expect(typeof article.created_at).toBe("string");
                expect(typeof article.votes).toBe("number");
                expect(typeof article.article_img_url).toBe("string");
            });
    });
    test("400 responds when valid path but invalid id", () => {
        return request(app)
            .get("/api/articles/invalidId")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid input");
            });
    });
    test("404 responds when valid id but is non-existent", () => {
        return request(app)
            .get("/api/articles/111111")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("article 111111 does not exist");
            });
    });
});

describe("GET /api/articles/:article_id/comments", () => {
    test("200 returns array of comments for corresponding article ID", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
                const { comments } = body;
                expect(comments.length).toBe(11);
                comments.forEach((comment) => {
                    expect(typeof comment.comment_id).toBe("number");
                    expect(typeof comment.votes).toBe("number");
                    expect(typeof comment.created_at).toBe("string");
                    expect(typeof comment.author).toBe("string");
                    expect(typeof comment.body).toBe("string");
                    expect(typeof comment.article_id).toBe("number");
                    expect(comment.article_id).toBe(1);
                });
            });
    });
    test("200 returns sorted by descending date order", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
                const { comments } = body;
                expect(comments).toBeSortedBy("created_at", {
                    descending: true,
                });
            });
    });
    test("200 returns empty array when valid article but no comments", () => {
        return request(app)
            .get("/api/articles/8/comments")
            .expect(200)
            .then(({ body }) => {
                const { comments } = body;
                expect(comments).toEqual([]);
            });
    });
    test("400 responds when valid path to comments but invalid id", () => {
        return request(app)
            .get("/api/articles/invalidId/comments")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid input");
            });
    });
    test("404 responds when valid id to comments but is non-existent", () => {
        return request(app)
            .get("/api/articles/222222/comments")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("article 222222 does not exist");
            });
    });
});

describe("POST /api/articles/:article_id/commments", () => {
    test("201 returns comment posted to given article", () => {
        const newComment = {
            username: "butter_bridge",
            body: "test body",
        };
        return request(app)
            .post("/api/articles/3/comments")
            .send(newComment)
            .expect(201)
            .then(({ body }) => {
                const { comment } = body;
                expect(typeof comment.comment_id).toBe("number");
                expect(typeof comment.votes).toBe("number");
                expect(typeof comment.created_at).toBe("string");
                expect(typeof comment.author).toBe("string");
                expect(typeof comment.body).toBe("string");
                expect(typeof comment.article_id).toBe("number");
                expect(comment.author).toEqual("butter_bridge");
                expect(comment.body).toEqual("test body");
                expect(comment.article_id).toEqual(3);
            });
    });
    test("201 successful post, additional properties ignored", () => {
        const newComment = {
            username: "butter_bridge",
            body: "test body",
            votes: 10000,
            newProperty: "ignore"
        };
        return request(app)
            .post("/api/articles/3/comments")
            .send(newComment)
            .expect(201)
            .then(({ body }) => {
                const { comment } = body;
                expect(typeof comment.comment_id).toBe("number");
                expect(typeof comment.votes).toBe("number");
                expect(typeof comment.created_at).toBe("string");
                expect(typeof comment.author).toBe("string");
                expect(typeof comment.body).toBe("string");
                expect(typeof comment.article_id).toBe("number");
                expect(comment.author).toEqual("butter_bridge");
                expect(comment.body).toEqual("test body");
                expect(comment.article_id).toEqual(3);
            });
    });
    test("400 missing required fields", () => {
        const newComment = {
            username: "butter_bridge",
            body: null,
        };
        return request(app)
            .post("/api/articles/3/comments")
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid input");
            });
    });
    test("400 missing required fields", () => {
        const newComment = {
            username: null,
            body: "test body",
        };
        return request(app)
            .post("/api/articles/3/comments")
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid input");
            });
    });
    test("400 incorrect fields", () => {
        const newComment = {
            username: 10,
            body: "test body",
        };
        return request(app)
            .post("/api/articles/3/comments")
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid input");
            });
    });
    test("400 incorrect fields", () => {
        const newComment = {
            username: "butter_bridge",
            body: 10,
        };
        return request(app)
            .post("/api/articles/3/comments")
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid input");
            });
    });
    test("400 missing fields", () => {
        const newComment = {
            username: "butter_bridge"
        };
        return request(app)
            .post("/api/articles/3/comments")
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid input");
            });
    });
});

describe("PATCH /api/articles/:article_id", () => {
    test("202 returns updated article", () => {
        const patchId = 1;
        const update = {
            inc_votes: 1000,
        };
        return request(app)
            .patch(`/api/articles/${patchId}`)
            .send(update)
            .expect(202)
            .then(({ body }) => {
                const { article } = body;
                expect(article.votes).toEqual(1100);
            });
    });
    test("202 returns updated article", () => {
        const patchId = 1;
        const update = {
            inc_votes: -1000,
        };
        return request(app)
            .patch(`/api/articles/${patchId}`)
            .send(update)
            .expect(202)
            .then(({ body }) => {
                const { article } = body;
                expect(article.votes).toEqual(-900);
            });
    });
    test("400 missing required fields when request body is null", () => {
        const update = {
            inc_votes: null,
        };
        return request(app)
            .patch("/api/articles/1")
            .send(update)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid input");
            });
    });
    test("400 missing required fields when request is null", () => {
        const update = null;
        return request(app)
            .patch("/api/articles/1")
            .send(update)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid input");
            });
    });
    test("400 incorrect fields of wrong property type", () => {
        const update = {
            inc_votes: "sausage",
        };
        return request(app)
            .patch("/api/articles/1")
            .send(update)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid input");
            });
    });
    test("400 incorrect type of request", () => {
        const update = [1000];
        return request(app)
            .patch("/api/articles/1")
            .send(update)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid input");
            });
    });
});

describe("DELETE /api/comments/:comment_id", () => {
    test("204 responds with no content", () => {
        return request(app)
            .delete("/api/comments/5")
            .expect(204)
            .then(({ body }) => {
                expect(body).toEqual({});
            });
    });
    test("400 responds when invalid comment id", () => {
        return request(app)
            .delete("/api/comments/invalidId")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid input");
            });
    });
    test("404 responds when comment not found", () => {
        return request(app)
            .delete("/api/comments/333333")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("comment 333333 does not exist");
            });
    });
});
