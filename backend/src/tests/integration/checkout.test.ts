import { describe, it, expect } from "vitest";
import request from "supertest";
import { successLogin } from "../helpers/auth.js";
import app from "../../app.js";

describe("POST /api/v1/orders/checkout", () => {
  it("Should return 400 if the name is missing", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingAddress: {
          phone: "07500000000",
          city: "Duhok",
          address: "Main Street",
        },
        paymentMethod: "COD",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("Should return 400 if the phone is missing", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingAddress: {
          fullName: "Mohammed Sherzad",
          city: "Duhok",
          address: "Main Street",
        },
        paymentMethod: "COD",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("Should return 400 if the city is missing", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingAddress: {
          fullName: "Mohammed Sherzad",
          phone: "07500000000",
          address: "Main Street",
        },
        paymentMethod: "COD",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("Should return 400 if the address is missing", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingAddress: {
          fullName: "Mohammed Sherzad",
          phone: "07500000000",
          city: "Duhok",
        },
        paymentMethod: "COD",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("Should return 400 if shipping address is missing", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        paymentMethod: "COD",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("Should return 400 if payment method is missing", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingAddress: {
          fullName: "Mohammed Sherzad",
          phone: "07500000000",
          city: "Duhok",
          address: "Main Street",
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("Should return 400 if payment method is invalid", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingAddress: {
          fullName: "Mohammed Sherzad",
          phone: "07500000000",
          city: "Duhok",
          address: "Main Street",
        },
        paymentMethod: "INVALID",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("Should return 400 if the name is too short", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingAddress: {
          fullName: "A",
          phone: "07500000000",
          city: "Duhok",
          address: "Main Street",
        },
        paymentMethod: "COD",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("Should return 400 if the phone number is invalid", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingAddress: {
          fullName: "Mohammed Sherzad",
          phone: "123",
          city: "Duhok",
          address: "Main Street",
        },
        paymentMethod: "COD",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("Should return 400 if the address is too short", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders/checkout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        shippingAddress: {
          fullName: "Mohammed Sherzad",
          phone: "07500000000",
          city: "Duhok",
          address: "Ab",
        },
        paymentMethod: "COD",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });
});
