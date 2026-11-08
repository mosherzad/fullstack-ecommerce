import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { successLogin } from "../helpers/auth.js";
import app from "../../app.js";

const validCoupon = {
  code: "SUMMER20",
  discountType: "PERCENTAGE",
  discountValue: 20,
  minOrderAmount: 50,
  maxDiscount: 30,
  usageLimit: 100,
  startsAt: "2026-11-01T00:00:00.000Z",
  expiresAt: "2026-12-31T23:59:59.000Z",
};

describe("Coupon Functionality Test", () => {
  const getAdminToken = async () => {
    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });
    return loginResponse.body.data.accessToken;
  };

  it("should return 401 when unauthenticated user accesses coupon endpoints", async () => {
    const response = await request(app).get("/api/v1/coupons");

    expect(response.status).toBe(401);
  });

  it("should return 403 when a normal user tries to access coupon endpoints", async () => {
    const loginResponse = await successLogin();

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get("/api/v1/coupons")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
  });

  it("should create a percentage coupon successfully", async () => {
    const token = await getAdminToken();

    const response = await request(app)
      .post("/api/v1/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...validCoupon,
        code: "PERCENTAGE20",
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data.coupon).toBeDefined();
    expect(response.body.data.coupon.code).toBe("PERCENTAGE20");
    expect(response.body.data.coupon.discountType).toBe("PERCENTAGE");
    expect(Number(response.body.data.coupon.discountValue)).toBe(20);
  });

  it("should create a fixed discount coupon successfully", async () => {
    const token = await getAdminToken();

    const response = await request(app)
      .post("/api/v1/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "FIXED25",
        discountType: "FIXED",
        discountValue: 25,
      });

    expect(response.status).toBe(201);
    expect(response.body.data.coupon.code).toBe("FIXED25");
    expect(response.body.data.coupon.discountType).toBe("FIXED");
    expect(Number(response.body.data.coupon.discountValue)).toBe(25);
  });

  it("should return 409 when coupon code already exists", async () => {
    const token = await getAdminToken();

    await request(app)
      .post("/api/v1/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...validCoupon,
        code: "DUPLICATE20",
      });

    const response = await request(app)
      .post("/api/v1/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...validCoupon,
        code: "DUPLICATE20",
      });

    expect(response.status).toBe(409);
  });

  it("should return 400 when required fields are missing", async () => {
    const token = await getAdminToken();

    const response = await request(app)
      .post("/api/v1/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "INCOMPLETE",
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when discount value is negative", async () => {
    const token = await getAdminToken();

    const response = await request(app)
      .post("/api/v1/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "NEGATIVE20",
        discountType: "FIXED",
        discountValue: -20,
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when percentage discount exceeds 100", async () => {
    const token = await getAdminToken();

    const response = await request(app)
      .post("/api/v1/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "INVALID150",
        discountType: "PERCENTAGE",
        discountValue: 150,
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when usage limit is negative", async () => {
    const token = await getAdminToken();

    const response = await request(app)
      .post("/api/v1/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "INVALIDLIMIT",
        discountType: "FIXED",
        discountValue: 20,
        usageLimit: -5,
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when expiration date is before start date", async () => {
    const token = await getAdminToken();

    const response = await request(app)
      .post("/api/v1/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "INVALIDDATES",
        discountType: "PERCENTAGE",
        discountValue: 20,
        startsAt: "2026-12-31T00:00:00.000Z",
        expiresAt: "2026-11-01T00:00:00.000Z",
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when discount type is invalid", async () => {
    const token = await getAdminToken();

    const response = await request(app)
      .post("/api/v1/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "INVALIDTYPE",
        discountType: "INVALID",
        discountValue: 20,
      });

    expect(response.status).toBe(400);
  });

  it("should return 403 when a normal user tries to create a coupon", async () => {
    const loginResponse = await successLogin();
    const token = loginResponse.body.data.accessToken;

    const response = await request(app)
      .post("/api/v1/coupons")
      .set("Authorization", `Bearer ${token}`)
      .send(validCoupon);

    expect(response.status).toBe(403);
  });

  describe("Coupon Retrieval Tests", () => {
    let adminToken: string;
    let couponId: string;

    beforeAll(async () => {
      adminToken = await getAdminToken();

      const response = await request(app)
        .post("/api/v1/coupons")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(validCoupon);

      couponId = response.body.data.coupon.id;

      console.log(response);
    });

    it("should return 401 when unauthenticated user tries to get all coupons", async () => {
      const response = await request(app).get("/api/v1/coupons");

      expect(response.status).toBe(401);
    });

    it("should return 403 when normal user tries to get all coupons", async () => {
      const loginResponse = await successLogin();
      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .get("/api/v1/coupons")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(403);
    });

    it("should return all coupons for admin", async () => {
      const response = await request(app)
        .get("/api/v1/coupons")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.coupons).toBeInstanceOf(Array);
      expect(response.body.data.coupons.length).toBeGreaterThan(0);
    });

    it("should return a coupon by ID for admin", async () => {
      const response = await request(app)
        .get(`/api/v1/coupons/${couponId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.coupon.id).toBe(couponId);
    });

    it("should return 404 when coupon does not exist", async () => {
      const response = await request(app)
        .get("/api/v1/coupons/nonexistent-coupon-id")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });

    it("should return 401 when unauthenticated user tries to get a coupon by ID", async () => {
      const response = await request(app).get(`/api/v1/coupons/${couponId}`);

      expect(response.status).toBe(401);
    });

    it("should return 403 when normal user tries to get a coupon by ID", async () => {
      const loginResponse = await successLogin();
      const accessToken = loginResponse.body.data.accessToken;

      const response = await request(app)
        .get(`/api/v1/coupons/${couponId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(403);
    });
  });
});
