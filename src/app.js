import express from "express";
import errorHandler from "./middlewares/ErrorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";

//create express app
const app = express();

//important middlewares
app.use(
  cors({
    origin: "*",
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

//check server
app.get("/", (req, res) => {
  res.json({ message: "server is running...👋🏻" });
});

//health check
app.get("/health", (req, res) => {
  res.json({ message: "Server is healthy..😃" });
});

//define routes

//error handler
app.use(errorHandler);

export default app;
