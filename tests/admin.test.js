const request = require("supertest");
const app = require("../app");
const User = require("../src/models/User");
const jwt = require("jsonwebtoken");

describe("Admin Protected Endpoints", () => {
  let adminToken;
  let regularUserToken;

  beforeEach(async () => {
    const admin = await User.create({
      username: "adminboss",
      email: "admin@fintech.com",
      password: "adminpassword123",
      role: "admin",
    });

    const regularUser = await User.create({
      username: "normalguy",
      email: "user@fintech.com",
      password: "userpassword123",
      role: "user",
    });

    const secret = process.env.JWT_SECRET || "super_secret_fintech_key_12345";

    adminToken = jwt.sign({ id: admin._id, role: admin.role }, secret, {
      expiresIn: "1h",
    });
    regularUserToken = jwt.sign(
      { id: regularUser._id, role: regularUser.role },
      secret,
      { expiresIn: "1h" },
    );
  });

  it("should allow access to /api/test/admin-only for an admin user", async () => {
    const res = await request(app)
      .get("/api/test/admin-only")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should deny access (403 Forbidden) for a non-admin user", async () => {
    const res = await request(app)
      .get("/api/test/admin-only")
      .set("Authorization", `Bearer ${regularUserToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
