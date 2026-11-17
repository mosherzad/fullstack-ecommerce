import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJsdoc from "swagger-jsdoc";

/**
 * Add an endpoint by putting one @openapi block in the matching file under
 * src/docs/paths/. Reuse a component schema when the shape already exists.
 * Restart the dev server so swagger-jsdoc scans the files again.
 * Route files, controllers, middleware, and Zod schemas stay unchanged.
 */

const docsDirectory = path.dirname(fileURLToPath(import.meta.url));

const pathDocsGlob = path
  .join(docsDirectory, "paths", "*.ts")
  .replaceAll("\\", "/");

const componentsDoc = path
  .join(docsDirectory, "components.ts")
  .replaceAll("\\", "/");

const options: swaggerJsdoc.OAS3Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EC Express API",
      version: "1.0.0",
      description:
        "HTTP API for the e-commerce backend. Routes are mounted under /api/v1. Protected routes read the httpOnly accessToken cookie set by login and refresh. This document describes only the behavior that is implemented.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description:
          "Sign-up, login, refresh, logout, the current user, password reset, and email verification.",
      },
      {
        name: "Users",
        description: "The signed-in user's profile.",
      },
      {
        name: "Products",
        description: "Public product catalog.",
      },
      {
        name: "Categories",
        description: "Public categories.",
      },
      {
        name: "Cart",
        description: "The signed-in user's cart.",
      },
      {
        name: "Wishlist",
        description: "The signed-in user's wishlist.",
      },
      {
        name: "Orders",
        description: "Checkout and orders.",
      },
      {
        name: "Reviews",
        description: "Product reviews.",
      },
      {
        name: "Admin",
        description:
          "Admin catalog, users, orders, reviews, and dashboard.",
      },
      {
        name: "Coupons",
        description: "Admin coupons.",
      },
    ],
    components: {
      securitySchemes: {
        accessTokenCookie: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description:
            "HttpOnly cookie named accessToken. Login and refresh set it. protect reads this cookie and does not read the Authorization header.",
        },
      },
    },
  },
  apis: [pathDocsGlob, componentsDoc],
};

export const swaggerSpec = swaggerJsdoc(options);
