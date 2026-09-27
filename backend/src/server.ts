import app from "./app.js";
import prisma from "./lib/prisma.js";

async function startServer() {
  try {
    await prisma.$connect();

    console.log("Database connected successfully");

    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

startServer();
