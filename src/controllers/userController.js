import createHttpError from "http-errors";
import userModel from "../models/usermodel.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { _config } from "../config/config.js";
import emailHelper from "../utils/EmailHelper.js";
import createActivationToken from "../Helper/activationToken.js";



//register user
const registerUser = async (req, res, next) => {
  try {
    // Get data from frontend
    const { name, email, password } = req.body;

    if (!email || !name || !password) {
      return next(createHttpError(400, "All fields are required."));
    }

    // Call db
    const user ={
      name,
      email,
      password
    };

    // Get activation token
    const activationToken = createActivationToken(user);

    // Get code
    const activationCode = activationToken.activationCode;

    const data = { user: { name: user.name }, activationCode };

    try {
      await emailHelper({
        email: user.email,
        subject: "Activate Your Account",
        template: "activationMail.ejs", 
       data
      });

      res.status(201).json({
        success: true,
        message: `Please check your email ${user.email} to verify account.`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      return next(
        createHttpError(401, "Error while sending activation email", error)
      );
    }
  } catch (error) {
    return next(createHttpError(400, "Error while registering user", error));
  }
};




//activateuser
const activateUser = async ()=>{

}




export { registerUser , activateUser };
