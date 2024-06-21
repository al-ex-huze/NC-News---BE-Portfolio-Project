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
                expect(body.msg).toBe("not found");
            });
    });
});

describe("GET /api/users", () => {
    test("200 returns all users", () => {
        return request(app)
            .get("/api/users")
            .expect(200)
            .then(({ body }) => {
                const { users } = body;
                expect(users.length).toBe(4);
                users.forEach((user) => {
                    expect(typeof user.username).toBe("string");
                    expect(typeof user.name).toBe("string");
                    expect(typeof user.avatar_url).toBe("string");
                });
            });
    });
});

describe("GET /api/users/:username", () => {
    test("200 returns user matching username", () => {
        return request(app)
            .get("/api/users/rogersop")
            .expect(200)
            .then(({ body }) => {
                const { user } = body;
                expect(user.username).toBe("rogersop");
                expect(typeof user.username).toBe("string");
                expect(typeof user.name).toBe("string");
                expect(typeof user.avatar_url).toBe("string");
            });
    });
    test("404 responds when user does not exist", () => {
        return request(app)
            .get("/api/users/al")
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("user al does not exist");
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
    test("200 returns sorted by descending date order as default", () => {
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
    test("200 returns sorted by ascending date order query", () => {
        return request(app)
            .get("/api/articles?order=asc")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles).toBeSortedBy("created_at");
            });
    });
    test("200 returns array of articles filtered by topic query", () => {
        return request(app)
            .get("/api/articles?topic=mitch")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                articles.forEach((article) => {
                    expect(article.topic).toBe("mitch");
                });
            });
    });
    test("200 returns empty array for valid topic with no articles", () => {
        return request(app)
            .get("/api/articles?topic=paper")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles).toEqual([]);
            });
    });
    test("200 returns sorted by query...author", () => {
        return request(app)
            .get("/api/articles?sort_by=author")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles).toBeSortedBy("author");
            });
    });
    test("200 returns sorted by query...comment_count", () => {
        return request(app)
            .get("/api/articles?sort_by=comment_count")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles).toBeSortedBy("comment_count");
            });
    });
    test("200 returns sorted by query...comment_count desc", () => {
        return request(app)
            .get("/api/articles?sort_by=comment_count&order=desc")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles).toBeSortedBy("comment_count", {
                    descending: true,
                });
            });
    });
    test("200 returns sorted by query... votes", () => {
        return request(app)
            .get("/api/articles?sort_by=votes")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles).toBeSortedBy("votes");
            });
    });
    test("200 returns sorted by query...votes desc", () => {
        return request(app)
            .get("/api/articles?sort_by=votes&order=desc")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles).toBeSortedBy("votes", {
                    descending: true,
                });
            });
    });
    test("400 returns invalid topic query", () => {
        return request(app)
            .get("/api/articles?topic=invalid_topic")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid query");
            });
    });
    test("400 valid path but invalid sort_by query", () => {
        return request(app)
            .get("/api/articles?sort_by=sausage")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid query: sort_by");
            });
    });
    test("400 valid path but invalid order query", () => {
        return request(app)
            .get("/api/articles?order=sideways")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("invalid query: order");
            });
    });
});

describe("POST /api/articles", () => {
    test("201 returns newly created article", () => {
        const newArticle = {
            author: "butter_bridge",
            title: "Test Title - New Article",
            body: "Test body - one, two, three",
            topic: "mitch",
            article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(201)
            .then(({ body }) => {
                const { article } = body;
                expect(typeof article.author).toBe("string");
                expect(typeof article.title).toBe("string");
                expect(typeof article.article_id).toBe("number");
                expect(typeof article.body).toBe("string");
                expect(typeof article.topic).toBe("string");
                expect(typeof article.created_at).toBe("string");
                expect(typeof article.votes).toBe("number");
                expect(typeof article.article_img_url).toBe("string");
                expect(typeof article.comment_count).toBe("number");
            });
    });
    test("201 successful post, additional properties ignored", () => {
        const newArticle = {
            surplus: "test ignore",
            author: "butter_bridge",
            title: "Test Title - New Article",
            body: "Test body - one, two, three",
            topic: "mitch",
            article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            extra: 12345,
        };
        const expected = {
            author: "butter_bridge",
            title: "Test Title - New Article",
            article_id: 14,
            body: "Test body - one, two, three",
            topic: "mitch",
            created_at: expect.any(String),
            votes: 0,
            article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: 0,
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(201)
            .then(({ body }) => {
                const { article } = body;
                expect(article).toMatchObject(expected);
            });
    });
    test("201 successful post with default img url if not included", () => {
        const newArticle = {
            author: "butter_bridge",
            title: "Test Title - New Article",
            body: "Test body - one, two, three",
            topic: "mitch",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(201)
            .then(({ body }) => {
                const { article } = body;
                expect(article.article_img_url).toBe(
                    "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
                );
            });
    });
    test("201 successful post with default img url is null", () => {
        const newArticle = {
            author: "butter_bridge",
            title: "Test Title - New Article",
            body: "Test body - one, two, three",
            topic: "mitch",
            article_img_url: null,
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(201)
            .then(({ body }) => {
                const { article } = body;
                expect(article.article_img_url).toBe(
                    "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
                );
            });
    });
    test("404 valid but non existent topic", () => {
        const newArticle = {
            author: "butter_bridge",
            title: "Test Title - New Article",
            body: "Test body - one, two, three",
            topic: "test",
            article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("test topic does not exist");
            });
    });
    test("404 valid but non existent author", () => {
        const newArticle = {
            author: "al",
            title: "Test Title - New Article",
            body: "Test body - one, two, three",
            topic: "test",
            article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(404)
            .then(({ body }) => {
                expect(body.msg).toBe("al user does not exist");
            });
    });
    test("400 missing required fields", () => {
        const newArticle = {
            author: "butter_bridge",
            title: null,
            body: "Test body - one, two, three",
            topic: "mitch",
            article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("23502 - missing required key");
            });
    });
    test("400 missing required fields", () => {
        const newArticle = {
            author: "butter_bridge",
            title: "Test Title - New Article",
            body: null,
            topic: "mitch",
            article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };
        return request(app)
            .post("/api/articles")
            .send(newArticle)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("23502 - missing required key");
            });
    });
});

describe("PATCH /api/articles/:article_id", () => {
    test("200 returns updated article", () => {
        const patchId = 1;
        const update = {
            inc_votes: 1000,
        };
        return request(app)
            .patch(`/api/articles/${patchId}`)
            .send(update)
            .expect(200)
            .then(({ body }) => {
                const { article } = body;
                expect(article.votes).toEqual(1100);
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
    test("200 returns updated article", () => {
        const patchId = 1;
        const update = {
            inc_votes: -1000,
        };
        return request(app)
            .patch(`/api/articles/${patchId}`)
            .send(update)
            .expect(200)
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
                expect(body.msg).toBe("23502 - missing required key");
            });
    });
    test("400 missing required fields when request is null", () => {
        const update = null;
        return request(app)
            .patch("/api/articles/1")
            .send(update)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("23502 - missing required key");
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
                expect(body.msg).toBe("22P02 - invalid input");
            });
    });
    test("400 incorrect type of request", () => {
        const update = [1000];
        return request(app)
            .patch("/api/articles/1")
            .send(update)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("23502 - missing required key");
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
    test("200 returns, now with comment count", () => {
        return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body }) => {
                const { article } = body;
                expect(typeof article.comment_count).toBe("number");
            });
    });
    test("400 responds when valid path but invalid id", () => {
        return request(app)
            .get("/api/articles/invalidId")
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("22P02 - invalid input");
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
                expect(body.msg).toBe("22P02 - invalid input");
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
            body: "test response body",
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
                expect(comment.body).toEqual("test response body");
                expect(comment.article_id).toEqual(3);
            });
    });
    test("201 successful post, additional properties ignored", () => {
        const newComment = {
            username: "butter_bridge",
            body: "test body",
            votes: 10000,
            newProperty: "ignore",
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
                expect(body.msg).toBe("23502 - missing required key");
            });
    });
    test("400 incorrect input fields", () => {
        const newComment = {
            username: 10,
            body: "test body",
        };
        return request(app)
            .post("/api/articles/3/comments")
            .send(newComment)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("23503 - missing required key");
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
            username: "butter_bridge",
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

describe("PATCH /api/comments/:comment_id", () => {
    test("200 returns updated comment", () => {
        const patchId = 1;
        const update = {
            inc_votes: 1,
        };
        return request(app)
            .patch(`/api/comments/${patchId}`)
            .send(update)
            .expect(200)
            .then(({ body }) => {
                const { comment } = body;
                expect(comment.votes).toEqual(1);
                expect(typeof comment.comment_id).toBe("number");
                expect(typeof comment.body).toBe("string");
                expect(typeof comment.votes).toBe("number");
                expect(typeof comment.author).toBe("string");
                expect(typeof comment.article_id).toBe("number");
                expect(typeof comment.created_at).toBe("string");
            });
    });
    test("200 returns updated comment", () => {
        const patchId = 1;
        const update = {
            inc_votes: -1,
        };
        return request(app)
            .patch(`/api/comments/${patchId}`)
            .send(update)
            .expect(200)
            .then(({ body }) => {
                const { comment } = body;
                expect(comment.votes).toEqual(-1);
            });
    });
    test("400 missing required fields when request body is null", () => {
        const update = {
            inc_votes: null,
        };
        return request(app)
            .patch("/api/comments/1")
            .send(update)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("23502 - missing required key");
            });
    });
    test("400 missing required fields when request is null", () => {
        const update = null;
        return request(app)
            .patch("/api/comments/1")
            .send(update)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("23502 - missing required key");
            });
    });
    test("400 incorrect fields of wrong property type", () => {
        const update = {
            inc_votes: "sausage",
        };
        return request(app)
            .patch("/api/comments/1")
            .send(update)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("22P02 - invalid input");
            });
    });
    test("400 incorrect type of request", () => {
        const update = [1000];
        return request(app)
            .patch("/api/comments/1")
            .send(update)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("23502 - missing required key");
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
                expect(body.msg).toBe("22P02 - invalid input");
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

describe("GET /api/articles", () => {
    test("200 returns articles of the default limit length", () => {
        return request(app)
            .get(`/api/articles?limit=${limit}&p=${p}`)
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles.length).toBe(10);
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
    test("200 returns articles of the limit length, offset by page number", () => {
        const limit = 5;
        const p = 2;
        return request(app)
            .get(`/api/articles?limit=${limit}&p=${p}`)
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles.length).toBe(limit);
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
    test("200 returns total count", () => {
        return request(app)
            .get("/api/articles")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                articles.forEach((article) => {
                    expect(typeof article.total_count).toBe("number");
                    expect(article.total_count).toEqual(13);
                });
            });
    });
    test("200 returns total count with query", () => {
        return request(app)
            .get("/api/articles?topic=cats")
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                articles.forEach((article) => {
                    expect(article.total_count).toEqual(1);
                });
            });
    });
    test("200 returns limited, offset articles plus other queries", () => {
        const limit = 5;
        const p = 2;
        return request(app)
            .get(`/api/articles?limit=${limit}&p=${p}&order=asc`)
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles.length).toBe(limit);
                expect(articles).toBeSortedBy("created_at");
            });
    });
    test("200 returns limited, offset articles plus other queries", () => {
        const limit = 5;
        const p = 2;
        return request(app)
            .get(`/api/articles?limit=${limit}&p=${p}&topic=mitch`)
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles.length).toBe(limit);
                expect(articles).toBeSortedBy("created_at", {
                    descending: true,
                });
                articles.forEach((article) => {
                    expect(article.topic).toBe("mitch");
                });
            });
    });
    test("200 returns limited, offset articles plus sort by", () => {
        const limit = 5;
        const p = 2;
        return request(app)
            .get(
                `/api/articles?limit=${limit}&p=${p}&sort_by=comment_count&order=desc`
            )
            .expect(200)
            .then(({ body }) => {
                const { articles } = body;
                expect(articles.length).toBe(limit);
                expect(articles).toBeSortedBy("comment_count", {
                    descending: true,
                });
            });
    });
    test("400 returns invalid page type", () => {
        limit = 10;
        const p = "string";
        return request(app)
            .get(`/api/articles?limit=${limit}&p=${p}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("22P02 - invalid input");
            });
    });
    test("400 returns invalid page number", () => {
        limit = 10;
        const p = -1;
        return request(app)
            .get(`/api/articles?limit=${limit}&p=${p}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("2201X - negative page number");
            });
    });
    test("400 returns invalid limit type", () => {
        limit = "string";
        const p = 1;
        return request(app)
            .get(`/api/articles?limit=${limit}&p=${p}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("22P02 - invalid input");
            });
    });
    test("400 returns invalid limit number", () => {
        limit = -10;
        const p = 1;
        return request(app)
            .get(`/api/articles?limit=${limit}&p=${p}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("2201W - negative limit number");
            });
    });
});

describe("GET /api/articles/:article_id/comments", () => {
    test("200 returns comments paginated default limit", () => {
        return request(app)
            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
                const { comments } = body;
                expect(comments.length).toBe(10);
                comments.forEach((comment) => {
                    expect(typeof comment.total_count).toBe("number");
                });
            });
    });
    test("200 returns comments limit and offset", () => {
        const limit = 5;
        const p = 2;
        return request(app)
            .get(`/api/articles/1/comments?limit=${limit}&p=${p}`)
            .expect(200)
            .then(({ body }) => {
                const { comments } = body;
                expect(comments.length).toBe(5);
            });
    });
    test("400 returns invalid page type", () => {
        limit = 10;
        const p = "string";
        return request(app)
            .get(`/api/articles/1/comments?limit=${limit}&p=${p}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("22P02 - invalid input");
            });
    });
    test("400 returns invalid page number", () => {
        limit = 10;
        const p = -1;
        return request(app)
            .get(`/api/articles/1/comments?limit=${limit}&p=${p}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("2201X - negative page number");
            });
    });
    test("400 returns invalid limit type", () => {
        limit = "string";
        const p = 1;
        return request(app)
            .get(`/api/articles/1/comments?limit=${limit}&p=${p}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("22P02 - invalid input");
            });
    });
    test("400 returns invalid limit number", () => {
        limit = -10;
        const p = 1;
        return request(app)
            .get(`/api/articles/1/comments?limit=${limit}&p=${p}`)
            .expect(400)
            .then(({ body }) => {
                expect(body.msg).toBe("2201W - negative limit number");
            });
    });
});
