import { describe, it, expect } from "vitest";
import app from "../../app.js";
import request from "supertest";
import { successLogin } from "../helpers/auth.js";
describe("Cart API", () => {
  it("should return 400 when add to cart with negative quantity number", async () => {
    const loginResponse = await successLogin();

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        productId: "cmvruxw2n0001lsqi660ccyu5",
        quantity: -1,
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when add to cart with quantity 0", async () => {
    const loginResponse = await successLogin();

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        productId: "cmvruxw2n0001lsqi660ccyu5",
        quantity: 0,
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when add to cart with a missing productId", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        quantity: 1,
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when add to cart with a missing quantity", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        productId: "cmvruxw2n0001lsqi660ccyu5",
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when add to cart with a non-numeric quantity", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        productId: "cmvruxw2n0001lsqi660ccyu5",
        quantity: "abc",
      });

    expect(response.status).toBe(400);
  });

  it("should return 404 when add to cart with a non-existing product", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        productId: "cmvruxw2n0001lsqi660ccyu5xxxxxxx",
        quantity: 1,
      });

    expect(response.status).toBe(404);
  });

  it("should return 401 when add to cart without authentication", async () => {
    const response = await request(app).post("/api/v1/cart/items").send({
      productId: "cmvruxw2n0001lsqi660ccyu5",
      quantity: 1,
    });

    expect(response.status).toBe(401);
  });
});
