const request = require("supertest");
const app = require("../app");
const User = require("../src/models/User");
const jwt = require("jsonwebtoken");

describe("Transaction Endpoints", () => {
  let userToken;

  beforeEach(async () => {
    const user = await User.create({
      username: "moneyuser",
      email: "money@example.com",
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

  it("should successfully credit balance and return balanceAfter", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        type: "credit",
        amount: 5000,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.currentBalance).toBe(45000);
    expect(res.body.transaction.balanceAfter).toBe(45000);
  });

  // Test Case 2: Successful Debit
  it("should successfully debit balance and deduct funds", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        type: "debit",
        amount: 10000,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.currentBalance).toBe(30000);
    expect(res.body.transaction.balanceAfter).toBe(30000);
  });

  it("should return 400 when debit amount exceeds account balance", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        type: "debit",
        amount: 999999,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 if type or amount is missing", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        amount: 500,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
