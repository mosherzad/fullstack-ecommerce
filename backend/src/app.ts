import express from "express";
import productsRouter from "./routes/productRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import userRouter from "./routes/userRoute.js";
import globalErrorHandler from "./controllers/globalErrorHandler.js";

const app = express();

app.use(express.json());

app.use("/api/v1/products", productsRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/users", userRouter);

export default app;

app.use(globalErrorHandler);
