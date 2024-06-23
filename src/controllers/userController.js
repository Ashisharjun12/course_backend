import createHttpError from "http-errors";
import userModel from "../models/usermodel.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { _config } from "../config/config.js";
import emailHelper from "../utils/EmailHelper.js";
import createActivationToken from "../Helper/activationToken.js";
import cookieToken, {
  accessTokenOptions,
  refreshTokenOptions,
} from "../utils/cookieToken.js";
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

    console.log(req.user?._id);

    redis.del(userId);

    res.status(200).json({
      success: true,
      message: "logout successfully..",
    });
  } catch (error) {
    return next(createHttpError(400, "logout error..."));
  }
};

//update accessToken

const updateAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    const decode = jwt.decode(refreshToken, _config.REFRESH_TOKEN); //alway use jwt.decode not jwt.verify

    if (!decode) {
      return next(createHttpError(400, "colud not have refresh token.."));
    }

    //get from redis
    const session = await redis.get(decode.id);

    if (!session) {
      return next(createHttpError(400, "session expired.."));
    }

    const user = JSON.parse(session);

    //sign new access token

    const access_Token = jwt.sign({ id: user._id }, _config.ACCESS_TOKEN, {
      expiresIn: "5m",
    });

    const refresh_Token = jwt.sign({ id: user._id }, _config.REFRESH_TOKEN, {
      expiresIn: "3d",
    });

    req.user = user;

    //send cookies
    res.cookie("access_token", access_Token, accessTokenOptions);
    res.cookie("refresh_token", refresh_Token, refreshTokenOptions);

    res.status(200).json({
      success: true,
      access_Token,
    });
  } catch (error) {
    return next(
      createHttpError(400, "error while updating access Token...", error)
    );
  }
};

//get user data

const getUserDetail = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    const user = await userModel.findById(userId);

    if (!user) {
      return next(createHttpError(400, "error user not exist"));
    }

    res.status(200).json({
      success: true,
      message: "getting user deatail",
      user,
    });
  } catch (error) {
    return next(
      createHttpError(400, "error while getting user details..", error)
    );
  }
};

//update user details

const updateUserDetail = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    const userId = req.user?._id;
    console.log(userId);

    const user = await userModel.findById(userId);

    if (email && user) {
      const emailExist = await userModel.find({ email });
      if (emailExist) {
        return next(createHttpError(400, "email already exist"));
      }
      user.email = email;
    }

    if (name && user) {
      user.name = name;
    }

    await user?.save();

    await redis.set(userId, JSON.stringify(user));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(createHttpError(400, "error while updating details", error));
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if(!oldPassword || !newPassword){
      return next(createHttpError(400 , "please fill old and new password"))
    }
  

    const user = await userModel.findById(req.user?._id).select("+password");
  
    if (user.password == undefined) {
      return next(400, "invalid user");
    }
    const isMatchPassword = await user?.isValidatedPassword(oldPassword);
  
    if (!isMatchPassword) {
      return next(createHttpError(400, "invalid password.."));
    }
  
    user.password = newPassword;
  
    await user.save();

    await redis.set(req.user?._id , JSON.stringify(user))
  
    res.status(200).json({
      success:true,
      message:"updating password successfully..",
      user
    })
  } catch (error) {
    return next(createHttpError(400 , "error while updating password" , error))
  }
};

//update avatar
const updateAvatar = async(req,res,next)=>{

//   const files = req.files;


//   let avatarLocalPath;
//   if(files && files.avatar){
//     avatarLocalPath = files.avatar[0].path
//   }


//   if(!avatarLocalPath){
//     return next(createHttpError(400 , "avatar is required..."))

//   }

//   //upload on cloudinary
//   const avatarUpload = await uploadOnCloudinary(avatarLocalPath , "avatar")

//   //call db

//   const user = await userModel.findById(req.user?._id)

//  user.avatar={
//   id:avatarUpload.public_id,
//   secure_url:avatarUpload.secure_url
  
//  }

//   await user.save()

//   await redis.set(req.user?._id , JSON.stringify(user))


//debug



}

export {
  registerUser,
  activateUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  getUserDetail,
  updateUserDetail,
  updatePassword,
  updateAvatar
};
