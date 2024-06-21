import jwt from "jsonwebtoken";
import { _config } from "../config/config.js";
import { redis } from '../config/redis.js';

const cookieToken = (user, res, statusCode) => {
  const accessToken = user.signAccessToken();
  console.log("Generated Access Token:", accessToken);  // Log the access token
  const refreshToken = user.signRefreshToken();
  console.log("Generated Refresh Token:", refreshToken);  // Log the refresh token

  // Upload session in redis
  redis.set(user._id.toString(), JSON.stringify(user));

  // Expiries
  const accessTokenExpiry = parseInt(_config.ACCESS_TOKEN_EXPIRY || "300", 10);
  const refreshTokenExpiry = parseInt(_config.REFRESH_TOKEN_EXPIRY || "1200", 10);

  // Options for cookies
  const accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpiry * 1000),
    maxAge: accessTokenExpiry * 1000,
    httpOnly: true,
    sameSite: "lax",
    // set secure:true in production
  };

  const refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpiry * 1000),
    maxAge: refreshTokenExpiry * 1000,
    httpOnly: true,
    sameSite: "lax",
    // set secure:true in production
  };

  // Set cookies
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
    refreshToken
  });
};

export default cookieToken;
