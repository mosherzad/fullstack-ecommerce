import express from "express";
import productsRouter from "./routes/productRoute.js";
import categoryRouter from "./routes/categoryRoute.js";
import userRouter from "./routes/userRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import authRouter from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./controllers/globalErrorHandler.js";
import { globalLimiter } from "./middleware/rateLimiterMiddleware.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(globalLimiter);

app.use("/api/v1/products", productsRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", reviewRouter);
export default app;

app.use(globalErrorHandler);
