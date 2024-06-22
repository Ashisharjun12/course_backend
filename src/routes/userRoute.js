import { Router } from "express";
import { activateUser, getUserDetail, loginUser, logoutUser, registerUser, updateAccessToken } from "../controllers/usercontroller.js";
import isLoggedIn from "../middlewares/Auth.js";
import customrole from "../middlewares/CustomRole.js";

const userRoute = Router()





//define routes

userRoute.post('/register' , registerUser)
userRoute.post('/activate' , activateUser)
userRoute.post('/login' , loginUser)
userRoute.get('/logout' ,  isLoggedIn,logoutUser)
userRoute.get('/user' , isLoggedIn , getUserDetail)



//updating access token
userRoute.get('/refresh' , isLoggedIn,updateAccessToken)











export default userRoute;