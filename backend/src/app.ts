import express from "express";
import productsRouter from "./routes/productRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import globalErrorHandler from "./controllers/globalErrorHandler.js";

const app = express();

app.use(express.json());

app.use("/api/v1/products", productsRouter);
app.use("/api/v1/categories", categoryRouter);

export default app;

app.use(globalErrorHandler);
