const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../server");
const User = require("../models/User");

jest.mock("../models/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("registers a user", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      _id: "user-id",
      name: "Test User",
      email: "test@example.com"
    });
    bcrypt.hash.mockResolvedValue("hashed");
    jwt.sign.mockReturnValue("token");

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "Test1234!"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBe("token");
    expect(res.body.user.email).toBe("test@example.com");
  });

  test("rejects invalid login", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nope@example.com", password: "Test1234!" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  test("logs in a user", async () => {
    User.findOne.mockResolvedValue({
      _id: "user-id",
      email: "test@example.com",
      name: "Test User",
      password: "hashed"
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token");

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "Test1234!" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe("token");
    expect(res.body.user.email).toBe("test@example.com");
  });

  test("normalizes email for register and login", async () => {
    User.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        _id: "user-id",
        email: "test@example.com",
        name: "Test User",
        password: "hashed"
      });

    User.create.mockResolvedValue({
      _id: "user-id",
      name: "Test User",
      email: "test@example.com"
    });

    bcrypt.hash.mockResolvedValue("hashed");
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token");

    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "TEST@Example.COM",
        password: "Test1234!"
      });

    expect(registerRes.statusCode).toBe(201);
    expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email: "test@example.com" }));

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "TEST@Example.COM", password: "Test1234!" });

    expect(loginRes.statusCode).toBe(200);
    expect(User.findOne).toHaveBeenLastCalledWith({ email: "test@example.com" });
  });

  test("logs in with google demo social auth", async () => {
    User.findOne.mockResolvedValue({
      _id: "demo-user-id",
      email: "demo.google@speaksense.ai",
      name: "Google Demo User"
    });
    jwt.sign.mockReturnValue("token");

    const res = await request(app)
      .post("/api/auth/social")
      .send({ provider: "google", mode: "demo" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe("token");
    expect(res.body.user.email).toBe("demo.google@speaksense.ai");
  });

  test("rejects unsupported social provider", async () => {
    const res = await request(app)
      .post("/api/auth/social")
      .send({ provider: "linkedin", mode: "demo" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/unsupported social provider/i);
  });

  test("logs in with no-input demo auth", async () => {
    User.findOne.mockResolvedValue({
      _id: "demo-user-id",
      email: "demo.user@speaksense.ai",
      name: "Demo User"
    });
    jwt.sign.mockReturnValue("token");

    const res = await request(app)
      .post("/api/auth/demo")
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBe("token");
    expect(res.body.user.email).toBe("demo.user@speaksense.ai");
  });

  test("returns health with database status", async () => {
    const res = await request(app).get("/api/health");

    expect([200, 503]).toContain(res.statusCode);
    expect(res.body).toEqual(expect.objectContaining({
      service: "speak-sense-server",
      status: expect.any(String),
      database: expect.any(String)
    }));
  });
});
