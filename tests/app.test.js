const request = require("supertest");
const app = require("../app");

describe("Sanity & Health Check", () => {
  it("should return 200 on GET /health", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("should redirect to /login.html on GET /", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(302);
  });
});
