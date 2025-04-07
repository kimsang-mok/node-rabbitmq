import express from "express";
import v1Route from "./route";
import { morganMiddleware } from "./src/middlewares/morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.set("port", process.env.PORT);

app.use(morganMiddleware());

app.use("/api/v1", v1Route);

export default app;
