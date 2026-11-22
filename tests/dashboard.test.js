const request = require("supertest");
const app = require("../app");
const User = require("../src/models/User");
const jwt = require("jsonwebtoken");

describe("Dashboard Endpoints", () => {
  let userToken;

  beforeEach(async () => {
    const user = await User.create({
      username: "dashuser",
      email: "dash@example.com",
      password: "password123",
      role: "user",
      balance: 40000,
    });

    userToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "super_secret_fintech_key_12345",
      { expiresIn: "1h" },
    );
  });

  it("should fetch dashboard data successfully when logged in", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("balance");
    expect(res.body).toHaveProperty("transactions");
  });

  it("should return 401 when accessing dashboard without a token", async () => {
    const res = await request(app).get("/api/dashboard");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
