import request from "supertest";
import app from "../../app.js";

export const successLogin = async () => {
  return await request(app).post("/api/v1/auth/login").send({
    email: process.env.USER_EMAIL,
    password: process.env.USER_PASSWORD,
  });
};

export const failedLogin = async (email: string, password: string) => {
  return await request(app).post("/api/v1/auth/login").send({
    email,
    password,
  });
};
