import { Router } from "express";
import { activateUser, loginUser, logoutUser, registerUser } from "../controllers/usercontroller.js";
import isLoggedIn from "../middlewares/Auth.js";

const userRoute = Router()





//define routes

userRoute.post('/register' , registerUser)
userRoute.post('/activate' , activateUser)
userRoute.post('/login' , loginUser)
userRoute.get('/logout' ,  isLoggedIn,logoutUser)











export default userRoute;