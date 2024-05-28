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
        .then(( { body } ) => {
            expect(JSON.stringify(body)).toBe(JSON.stringify(currentEndpointsTest));
        })
    })
})

describe("GET /api/topics", () => {
    test("200 returns an array of topic objects", () => {
        return request(app)
            .get("/api/topics")
            .expect(200)
            .then(( { body } ) => {
                const { topics } = body;
                expect(topics.length).toBe(3);
                topics.forEach((topic) => {
                    expect(typeof topic.description).toBe("string");
                    expect(typeof topic.slug).toBe("string");
                })
            })
    })
})
