const request = require("supertest");
const app = require("../app");
const User = require("../src/models/User");

describe("Auth Endpoints", () => {
  beforeEach(async () => {
    await User.create({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      role: "user",
    });
  });

  it("should log in successfully with correct credentials and return a token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("token");
  });

  it("should fail to log in with an incorrect password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.token).toBeUndefined();
  });
});
