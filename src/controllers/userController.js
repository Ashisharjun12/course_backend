import userModel from "../models/usermodel.js";

const registerUser = async(req, res, next)=>{


res.status(200).json({
    success:true,
    msg:"route is checking..."
})


}


export {registerUser}