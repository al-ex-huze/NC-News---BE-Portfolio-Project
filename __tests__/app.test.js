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

describe("GET /api/articles/:article_id", () => {
    test("200 returns an article object with corresponding ID", () => {
        return request(app)
            .get("/api/articles/1")
            .expect(200)
            .expect("Content-Type", "application/json; charset=utf-8")
            .then(({ body }) => {
                const { article } = body;
                expect(typeof article.author).toBe("string");
                expect(article.author).toEqual("butter_bridge");
                expect(typeof article.title).toBe("string");
                expect(article.title).toEqual("Living in the shadow of a great man");
                expect(typeof article.article_id).toBe("number");
                expect(article.article_id).toEqual(1);
                expect(typeof article.body).toBe("string");
                expect(article.body).toEqual("I find this existence challenging");
                expect(typeof article.topic).toBe("string");
                expect(article.topic).toEqual("mitch");
                expect(typeof article.created_at).toBe("string");
                expect(article.created_at).toEqual("2020-07-09T20:11:00.000Z");
                expect(typeof article.votes).toBe("number");
                expect(article.votes).toEqual(100);
                expect(typeof article.article_img_url).toBe("string");
                expect(article.article_img_url).toEqual("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700");
            });
    });
});