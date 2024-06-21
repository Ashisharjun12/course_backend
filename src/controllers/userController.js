import createHttpError from "http-errors";
import userModel from "../models/usermodel.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { _config } from "../config/config.js";
import emailHelper from "../utils/EmailHelper.js";
import createActivationToken from "../Helper/activationToken.js";
import cookieToken from "../utils/cookieToken.js";
import { redis } from "../config/redis.js";

//register user
const registerUser = async (req, res, next) => {
  try {
    // Get data from frontend
    const { name, email, password } = req.body;

    if (!email || !name || !password) {
      return next(createHttpError(400, "All fields are required."));
    }

    // Call db
    const user = {
      name,
      email,
      password,
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
        data,
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
const activateUser = async (req, res, next) => {
  try {
    const { activation_code, activation_token } = req.body;

    const newUser = jwt.verify(activation_token, _config.ACTIVATION_SECRET);

    if (String(newUser.activationCode) !== String(activation_code)) {
      return next(createHttpError(400, "invalid activation code"));
    }

    const { name, email, password } = newUser.user;

    const existUser = await userModel.findOne({ email });

    if (existUser) {
      return next(createHttpError(401, "user already exist with this email"));
    }

    const user = await userModel.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: "activating user...",
      user,
    });
  } catch (error) {
    return next(createHttpError(400, error, "error while activating user"));
  }
};

//login

const loginUser = async (req, res, next) => {
  try {
    //get frontend data
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createHttpError(400, "all fields required.."));
    }

    //find by email and check
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return next(createHttpError(400, " user not exist with this email.."));
    }

    //checck password
    const isPasswordMatch = await user.isValidatedPassword(password);

    if (!isPasswordMatch) {
      return next(createHttpError(400, "invalid email or password.."));
    }

    //send cookie
    cookieToken(user, res, 200);
  } catch (error) {
    return next(createHttpError(400, "error while getting login", error));
  }
};

//logout

const logoutUser = async (req, res, next) => {
  try {
    res.cookie("access_token", "", { maxAge: 1 });
    res.cookie("refresh_token", "", { maxAge: 1 });

    //delete from redis db
    const userId = req.user?._id || "";

    console.log(req.user?._id)

    redis.del(userId);

    res.status(200).json({
      success: true,
      message: "logout successfully..",
    });
  } catch (error) {
    return next(createHttpError(400, "logout error..."));
  }
};

export { registerUser, activateUser, loginUser, logoutUser };
