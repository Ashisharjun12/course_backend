 import jwt from "jsonwebtoken"
import { _config } from "../config/config.js";
 
 const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  
    const token = jwt.sign(
      {
        user,
        activationCode,
      },
      _config.ACTIVATION_SECRET,
      { expiresIn: "5m" }
    );
  
    return { token, activationCode }; 
  };


  export default createActivationToken;