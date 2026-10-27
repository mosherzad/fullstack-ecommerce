import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import app from "../app.js";
import { successLogin } from "./helpers/auth.js";
import prisma from "../lib/prisma.js";

afterEach(async () => {
  await prisma.review.deleteMany({
    where: {
      comment: "Perfect product",
    },
  });
});

describe("Review API", () => {
  it("should return 403 when normal user try to access the reviews route", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get("/api/v1/reviews")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response).toBeDefined();
    expect(response.status).toBe(403);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when adding review with empty data", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/products/cmujumilz00015wqig8zzp6ro/reviews")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when adding review and rating is negative number", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/products/cmujumilz00015wqig8zzp6ro/reviews")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        rating: -5,
      });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when adding review and rating is zero", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/products/cmujumilz00015wqig8zzp6ro/reviews")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        rating: 0,
      });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when adding review and rating is exceeds 5", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/products/cmujumilz00015wqig8zzp6ro/reviews")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        rating: 6,
      });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 404 when adding review with product that does not exists", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post(
        "/api/v1/products/cmuo0cm3z0000tsqiab60l87zzzzzzzzzzzzzzzzz/reviews",
      )
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        comment: "Perfect product",
        rating: 5,
      });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
    expect(response.body.status).toBe("fail");
  });

  it("should return 401 when adding review with invalid id", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/products/invalid-id/reviews")
      .send({
        comment: "Perfect product",
        rating: 4,
      })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when adding review without rating", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/products/cmuo0cm3z0000tsqiab60l87z/reviews")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        comment: "Perfect product",
      });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 401 when adding review without login user", async () => {
    const response = await request(app)
      .post("/api/v1/products/cmuo0cm3z0000tsqiab60l87z/reviews")
      .send({
        comment: "Perfect product",
        rating: 4,
      });

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("fail");
  });

  it("should create a review successfully with valid date", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/products/cmuo0cm3z0000tsqiab60l87z/reviews")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        rating: 5,
        comment: "Perfect product",
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
  });
});
