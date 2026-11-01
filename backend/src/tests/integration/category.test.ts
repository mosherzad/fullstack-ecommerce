import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { successLogin } from "../helpers/auth.js";
import prisma from "../../lib/prisma.js";

afterEach(async () => {
  await prisma.category.deleteMany({
    where: {
      name: "Clothes",
    },
  });
});

describe("Category API", () => {
  const adminLogin = async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });

    expect(response.status).toBe(200);
    return response;
  };

  it("should return 401 when creating a category without login", async () => {
    const response = await request(app)
      .post("/api/v1/categories")
      .send({ name: `Category ${Date.now()}` });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("fail");
  });

  it("should return 403 when a normal user tries to create a category", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: `Category ${Date.now()}` });

    expect(response.status).toBe(403);
    expect(response.body.status).toBe("fail");
  });

  it("should create a category successfully", async () => {
    const loginResponse = await adminLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: `Clothes` });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
  });

  it("should return 400 when creating a category with name less than 3 charachters", async () => {
    const loginResponse = await adminLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Ok",
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when creating a category with name more than 12 charachters", async () => {
    const loginResponse = await adminLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/categories")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Electronic Tv and PC ",
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should get all categories successfully", async () => {
    const response = await request(app).get("/api/v1/categories");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toBeDefined();
  });

  it("should return 404 when category does not exist", async () => {
    const loginResponse = await adminLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get("/api/v1/categories/nonexistent-category-id")
      .set("Authorization", `Bearer ${accessToken}`);

    expect([400, 404]).toContain(response.status);
    expect(response.body.status).toBe("fail");
  });

  it("should return 401 when updating a category without login", async () => {
    const response = await request(app)
      .patch("/api/v1/categories/nonexistent-category-id")
      .send({ name: "Updated category" });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("fail");
  });

  it("should return 403 when a normal user tries to update a category", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .patch("/api/v1/categories/nonexistent-category-id")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Updated category" });

    expect(response.status).toBe(403);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when updating a category with invalid data", async () => {
    const loginResponse = await adminLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .patch("/api/v1/categories/nonexistent-category-id")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "" });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 401 when deleting a category without login", async () => {
    const response = await request(app).delete(
      "/api/v1/categories/nonexistent-category-id",
    );

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("fail");
  });

  it("should return 403 when a normal user tries to delete a category", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .delete("/api/v1/categories/nonexistent-category-id")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.status).toBe("fail");
  });
});
