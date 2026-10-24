import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../app.js";
import { sendEmail } from "../utils/email.js";
import { failedLogin, successLogin } from "./helpers/auth.js";
import { email } from "zod";

vi.mock("../utils/email.js", () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

describe("Authentication API", () => {
  it("should return 401 when accessing protected route without token", async () => {
    const response = await request(app).get("/api/v1/auth/me");
    expect(response.status).toBe(401);
  });

  it("should reject log in a user with invalid password", async () => {
    const loginResponse = await failedLogin(
      process.env.USER_EMAIL!,
      "wrongpassword",
    );
    expect(loginResponse.status).toBe(400);
  });

  it("should return 400 and reject login with incorrect email", async () => {
    const loginResponse = await failedLogin(
      "wrongemail@gmail.com",
      process.env.USER_PASSWORD!,
    );

    expect(loginResponse.status).toBe(400);
  });

  it("should allow access to a protected route with a valid access token", async () => {
    const loginResponse = await successLogin();
    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;
    expect(accessToken).toBeDefined();

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
  });

  it("should return 401 invalid token when try to access protected routes with invalid token", async () => {
    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid-token");
    expect(response.status).toBe(401);
  });

  it("should log out a user and clear authentication cookies", async () => {
    const loginResponse = await successLogin();

    expect(loginResponse.status).toBe(200);
    const cookies = loginResponse.headers["set-cookie"];
    const accessToken = loginResponse.body.data.accessToken;

    expect(cookies).toBeDefined();

    const response = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", cookies!);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");

    const clearedCookies = response.headers["set-cookie"];

    const isArray = Array.isArray(clearedCookies)
      ? clearedCookies
      : [clearedCookies!];

    expect(clearedCookies).toBeDefined();
    expect(
      isArray!.some((cookie: string) => /refreshToken=;/.test(cookie)),
    ).toBe(true);

    const me = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(me.status).toBe(401);
  });

  it("should send reset password link to gmail if the gmail exists", async () => {
    const response = await request(app)
      .post("/api/v1/auth/forget-password")
      .send({
        email: process.env.USER_EMAIL,
      });

    expect(response.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledOnce();

    const emailCall = vi.mocked(sendEmail).mock.calls[0];

    if (!emailCall) {
      throw new Error("Email function was not called");
    }

    const emailText = emailCall[2];

    const match = emailText.match(
      /\/api\/v1\/auth\/reset-password\/([a-f0-9]{64})/,
    );

    expect(match).not.toBeNull();

    const resetToken = match![1];

    expect(resetToken).toHaveLength(64);

    const resetResponse = await request(app)
      .patch(`/api/v1/auth/reset-password/${resetToken}`)
      .send({
        newPassword: "NewPassword456!",
        newPasswordConfirm: "NewPassword456!",
      });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.status).toBe("success");
  });

  it("should return 401 when user account not verified", async () => {
    const loginResponse = await failedLogin("ahmed@gmail.com", "test1234");

    expect(loginResponse.status).toBe(403);
    expect(loginResponse.body.status).toBe("fail");
  });

  it("should return 200 when user update his password", async () => {
    const loginResponse = await successLogin();

    expect(loginResponse).toBeDefined();

    const accessToken = loginResponse.body.data.accessToken;
    const response = await request(app)
      .patch("/api/v1/auth/update-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        currentPassword: process.env.USER_PASSWORD,
        newPassword: "test0000",
      });

    expect(response.status).toBe(200);
  });
});
