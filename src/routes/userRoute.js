import { Router } from "express";
import { activateUser, getUserDetail, loginUser, logoutUser, registerUser, updateAccessToken, updateAvatar, updatePassword, updateUserDetail } from "../controllers/usercontroller.js";
import isLoggedIn from "../middlewares/Auth.js";
import customrole from "../middlewares/CustomRole.js";
import {upload}  from "../middlewares/Multer.js" 

const userRoute = Router()





//define routes

userRoute.post('/register' , registerUser)
userRoute.post('/activate' , activateUser)
userRoute.post('/login' , loginUser)
userRoute.get('/logout' ,  isLoggedIn,logoutUser)
userRoute.get('/user' , isLoggedIn , getUserDetail)
userRoute.put('/updateUserDetail' , isLoggedIn , updateUserDetail)
userRoute.put('/updatePassword' , isLoggedIn , updatePassword)
userRoute.put('/updateAvatar' , isLoggedIn ,upload.fields([{
    name:'avatar',
    maxCount:1
}]), updateAvatar)



//updating access token
userRoute.get('/refresh' , isLoggedIn,updateAccessToken)











export default userRoute;