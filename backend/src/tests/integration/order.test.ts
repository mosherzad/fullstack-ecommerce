import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { successLogin } from "../helpers/auth.js";
import prisma from "../../lib/prisma.js";

describe("Order API", () => {
  it("should return 401 when adding order without token (guest user)", async () => {
    const response = await request(app)
      .post("/api/v1/orders")
      .send({
        userId: "cmvf8npds0001n0qi4pw7ammf",
        items: [{ productId: "cmuo0cm3z0000tsqiab60l87z", quantity: 5 }],
      });

    expect(response.status).toBe(401);
  });

  it("should return 401 for adding order when token is invalid ", async () => {
    const response = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${"Invalid token"}`)
      .send({
        userId: "cmvf8npds0001n0qi4pw7ammf",
        items: [{ productId: "cmuo0cm3z0000tsqiab60l87z", quantity: 5 }],
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when adding order without items", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userId: "cmvf8npds0001n0qi4pw7ammf",
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when order items array is empty", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userId: "cmvf8npds0001n0qi4pw7ammf",
        items: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when productId is invalid", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userId: "cmvf8npds0001n0qi4pw7ammf",
        items: [{ productId: "invalid-id", quantity: 2 }],
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when quantity is missing", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userId: "cmvf8npds0001n0qi4pw7ammf",
        items: [{ productId: "cmuo0cm3z0000tsqiab60l87z" }],
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when adding order and the quantity is zero", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userId: "cmvf8npds0001n0qi4pw7ammf",
        items: [{ productId: "cmuo0cm3z0000tsqiab60l87z", quantity: 0 }],
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when adding order and the quantity is negative", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        userId: "cmvf8npds0001n0qi4pw7ammf",
        items: [{ productId: "cmuo0cm3z0000tsqiab60l87z", quantity: -1 }],
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  // it("should return 201 and create order with valid data", async () => {
  //   const loginResponse = await successLogin();
  //   const accessToken = loginResponse.body.data.accessToken;

  //   const response = await request(app)
  //     .post("/api/v1/orders")
  //     .set("Authorization", `Bearer ${accessToken}`)
  //     .send({
  //       userId: "cmvf8npds0001n0qi4pw7ammf",
  //       items: [{ productId: "cmuo0cm3z0000tsqiab60l87z", quantity: 6 }],
  //     });

  //   expect(response.status).toBe(201);
  //   expect(response.body.data.order.userId).toBe(
  //     loginResponse.body.data.user.id,
  //   );
  // });

  it("should return 401 when try to update order without token", async () => {
    const response = await request(app).patch(
      "/api/v1/orders/cmuobcuik0000y0qiayzf5a23",
    );

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("fail");
  });

  it("should return 401 when try to update order with invalid token", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .patch("/api/v1/orders/cmuobcuik0000y0qiayzf5a23")
      .set("Authorization", `Bearer ${"invalid token"}`);

    expect(response).toBeDefined();
    expect(response.status).toBe(401);
    expect(response.body.status).toBe("fail");
  });

  // it("should return 200 and update the status of the order with valid data", async () => {
  //   const loginResponse = await successLogin();
  //   const accessToken = loginResponse.body.data.accessToken;

  //   const response = await request(app)
  //     .patch("/api/v1/orders/cmvp6baiu00018sqitr32aac8")
  //     .set("Authorization", `Bearer ${accessToken}`)
  //     .send({
  //       status: "CANCELLED",
  //     });

  //   expect(response).toBeDefined();
  //   expect(response.status).toBe(200);
  //   expect(response.body.status).toBe("success");
  // });

  it("should reject an order when stock is insufficient", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const productId = "cmvrvqs8h00007wqi93bss7mt";

    await prisma.product.update({
      where: { id: productId },
      data: { stock: 0 },
    });

    const response = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        items: [{ productId, quantity: 1 }],
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");

    const productAfter = await prisma.product.findUnique({
      where: { id: productId },
    });

    expect(productAfter?.stock).toBe(0);
  });

  it("should restore product stock when an order is cancelled", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const productId = "cmvruxw2n0001lsqi660ccyu5";
    const quantity = 1;

    const productBefore = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!productBefore) throw new Error("Test product not found");

    const createResponse = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        items: [{ productId, quantity }],
      });

    console.log(createResponse);

    expect(createResponse.status).toBe(201);

    const orderId = createResponse.body.data.order.id;

    const cancelResponse = await request(app)
      .patch(`/api/v1/orders/${orderId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "CANCELLED" });

    expect(cancelResponse.status).toBe(200);
    expect(cancelResponse.body.data.order.status).toBe("CANCELLED");

    const productAfter = await prisma.product.findUnique({
      where: { id: productId },
    });

    expect(productAfter?.stock).toBe(productBefore.stock);
  });
});
