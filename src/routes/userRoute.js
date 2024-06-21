import { Router } from "express";
import { registerUser } from "../controllers/usercontroller.js";

const userRoute = Router()





//define routes

userRoute.post('/register' , registerUser)











export default userRoute;