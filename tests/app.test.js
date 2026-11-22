const request = require("supertest");
const app = require("../app");

describe("Sanity Check", () => {
  it("should return 200 on GET /", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });
});
