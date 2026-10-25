import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Product API", () => {
  it("should return all product with status code 200", async () => {
    const response = await request(app).get("/api/v1/products");

    expect(response.status).toBe(200);
  });

  it("should return 400 when add product when name is less than 3 charachters", async () => {
    const response = await request(app).post("/api/v1/products").send({
      name: "ip",
      price: 10,
      stock: 100,
      categoryId: "cmujuli8o00005wqive11vfl1",
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when add product when price is negative number", async () => {
    const response = await request(app).post("/api/v1/products").send({
      name: "Mouse",
      price: -1,
      stock: 100,
      categoryId: "cmujuli8o00005wqive11vfl1",
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when price is zero", async () => {
    const response = await request(app).post("/api/v1/products").send({
      name: "Mouse",
      price: 0,
      stock: 25,
      categoryId: "cmujuli8o00005wqive11vfl1",
    });

    expect(response.status).toBe(400);
  });

  it("should return 400 when add product when missing name field", async () => {
    const response = await request(app).post("/api/v1/products").send({
      price: 10,
      stock: 100,
      categoryId: "cmujuli8o00005wqive11vfl1",
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when add product when missing price field", async () => {
    const response = await request(app).post("/api/v1/products").send({
      name: "Mouse",
      stock: 100,
      categoryId: "cmujuli8o00005wqive11vfl1",
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should reject a product with an invalid categoryId", async () => {
    const response = await request(app).post("/api/v1/products").send({
      name: "Mouse",
      price: 20,
      stock: 25,
      categoryId: "invalid-id",
    });

    expect(response.status).toBe(400);
  });

  it("should return 400 when add product when stock is negative number", async () => {
    const response = await request(app).post("/api/v1/products").send({
      name: "Mouse",
      price: 30,
      stock: -100,
      categoryId: "cmujuli8o00005wqive11vfl1",
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  //   it("should return 201 when add product with valid data", async () => {
  //     const response = await request(app).post("/api/v1/products").send({
  //       name: "Mouse Logitich",
  //       price: 20,
  //       stock: 25,
  //       categoryId: "cmujuli8o00005wqive11vfl1",
  //       description: "Red Dragon mouse RBG",
  //     });

  //     expect(response.status).toBe(201);
  //     expect(response.body.status).toBe("success");
  //     expect(response.body.data.product.name).toBe("Mouse");
  //     expect(response.body.data.product.price).toBe(20);
  //     expect(response.body.data.product.stock).toBe(25);
  //   });
});
