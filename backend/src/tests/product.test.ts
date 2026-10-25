import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Product API", () => {
  it("should return all product with status code 200", async () => {
    const response = await request(app).get("/api/v1/products");

    expect(response.status).toBe(200);
  });
});
