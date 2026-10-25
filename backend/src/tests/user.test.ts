import { describe, it, expect } from "vitest";
import app from "../app.js";
import request from "supertest";
import { successLogin } from "./helpers/auth.js";

describe("User API", () => {
  it("should return 401 when try to get users without token", async () => {
    const response = await request(app).get("/api/v1/users");

    expect(response.status).toBe(401);
    expect(response.body.status).toBe("fail");
  });

  it("should return 403 if normal user try to access all users", async () => {
    const loginResponse = await successLogin();

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.status).toBe("fail");
  });

  // it("should return 200 with all user when token is exists and the user is ADMIN", async () => {
  //   const loginResponse = await successLogin();

  //   const accessToken = loginResponse.body.data.accessToken;

  //   const response = await request(app)
  //     .get("/api/v1/users")
  //     .set("Authorization", `Bearer ${accessToken}`);

  //   expect(response.status).toBe(200);
  //   expect(response.body.status).toBe("success");

  //   expect(response).toBeDefined();
  //   expect(response.status).toBe(200);
  //   expect(response.body.status).toBe("success");
  //   expect(response.body.data.users).toBeDefined();
  //   expect(Array.isArray(response.body.data.users)).toBe(true);
  // });

  it("should return 403 when a normal user tries to delete a user", async () => {
    const loginResponse = await successLogin();

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .delete("/api/v1/users/cmumoowxh00003oqi4c8pn4sm")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
  });

  it("should return 404 not found user when id does not belong to any user", async () => {
    const response = await request(app).get(
      "/api/v1/users/cmumoowxh00003oqi4c8pn4smXXXX",
    );

    expect(response.status).toBe(404);
  });

  it("should return 200 and user when id is valid and belong to user", async () => {
    const response = await request(app).get(
      "/api/v1/users/cmumoowxh00003oqi4c8pn4sm",
    );

    expect(response.status).toBe(200);
  });

  it("should return 401 when user try to update his profile without token", async () => {
    const response = await request(app).patch("/api/v1/users/me");
    expect(response).toBeDefined();

    expect(response.status).toBe(401);
  });

  it("should allow user to update his profile with valid data", async () => {
    const loginResponse = await successLogin();

    expect(loginResponse).toBeDefined();

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .patch("/api/v1/users/me")
      .send({
        name: "MoSherzad",
      })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.user.name).toBe("MoSherzad");
  });

  it("should return 400 when user update his profile with invalid name", async () => {
    const loginResponse = await successLogin();

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ name: "Mo" });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe("fail");
  });

  it("should return 400 when the update body is empty", async () => {
    const loginResponse = await successLogin();
    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .patch("/api/v1/users/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(400);
  });
});
