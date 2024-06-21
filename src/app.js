import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import errorHandler from "./middlewares/ErrorHandler.js";
import cookieParser from "cookie-parser";
import cors from "cors";

//create express app
const app = express();

// Define __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//important middlewares
app.use(
  cors({
    origin: "*",
  })
);

//setup ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//set up middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));

//check server
app.get("/", (req, res) => {
  res.render("index");
});

//health check
app.get("/health", (req, res) => {
  res.json({ message: "Server is healthy..😃" });
});

//define routes

//error handler
app.use(errorHandler);

export default app;
