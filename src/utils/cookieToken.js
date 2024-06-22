import jwt from "jsonwebtoken";
import { _config } from "../config/config.js";
import { redis } from "../config/redis.js";



 // Expiries
 export const accessTokenExpiry = parseInt(_config.ACCESS_TOKEN_EXPIRY || "300", 10);
 export const refreshTokenExpiry = parseInt(
   _config.REFRESH_TOKEN_EXPIRY || "1200",
   10
 );

 // Options for cookies
 export const accessTokenOptions = {
   expires: new Date(Date.now() + accessTokenExpiry * 60 * 60* 1000),
   maxAge: accessTokenExpiry * 60 * 60 * 1000,
   httpOnly: true,
   sameSite: "lax",
   // set secure:true in production
 };

  export const refreshTokenOptions = {
   expires: new Date(Date.now() + refreshTokenExpiry * 24 * 60 * 60 * 1000),
   maxAge: refreshTokenExpiry * 24 * 60 * 60 * 1000,
   httpOnly: true,
   sameSite: "lax",
   // set secure:true in production
 };

const cookieToken = (user, res, statusCode) => {
  const accessToken = user.signAccessToken();
  console.log("Generated Access Token:", accessToken); // Log the access token
  const refreshToken = user.signRefreshToken();
  console.log("Generated Refresh Token:", refreshToken); // Log the refresh token

  // Upload session in redis
  redis.set(user._id.toString(), JSON.stringify(user));

 

  // Set cookies
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
    refreshToken,
  });
};

export default cookieToken;
