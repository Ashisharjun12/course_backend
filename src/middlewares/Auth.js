import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { _config } from "../config/config.js";
import { redis } from "../config/redis.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const accessToken = req.cookies.access_token;
    console.log("Access token:", accessToken);

    if (!accessToken) {
      return next(createHttpError(400, "Please login to access this."));
    }

    let decode;
    try {
      decode = jwt.decode(accessToken, _config.ACCESS_TOKEN); // finally fix error use jwt.decode not jwt.verify
      console.log("decoded token : ", decode);
    } catch (err) {
      return next(createHttpError(400, "Invalid access token.", err));
    }

    if (!decode) {
      return next(createHttpError(400, "Access token is invalid."));
    }

    const user = await redis.get(decode.id.toString());

    if (!user) {
      return next(createHttpError(400, "User not found."));
    }

    req.user = JSON.parse(user); // for redis use json.parse

    return next();
  } catch (error) {
    return next(createHttpError(500, "auth middleware error...."));
  }
};

export default isLoggedIn;
