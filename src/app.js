import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import errorHandler from "./middlewares/ErrorHandler.js";
import cookieParser from "cookie-parser"
import cors from "cors";
import userRoute from "./routes/userRoute.js";
import isLoggedIn from "./middlewares/Auth.js";

//create express app
const app = express();



//important middlewares
app.use(
  cors({
    origin: "*",
  })
);



//set up middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
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
app.use('/api/v1' , userRoute)









//error handler
app.use(errorHandler);

export default app;
