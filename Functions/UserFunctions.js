import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
const OTPSECRETKEY = process.env.OTPSECRETKEY;
const AUTHSECRETKEY = process.env.AUTHSECRETKEY;

const otpGenerate = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const encryptOtp = (user_id) => {
  let encryptedOtp = jwt.sign(
    {
      data: { user_id, otp: otpGenerate() },
    },
    OTPSECRETKEY,
    { expiresIn: 60 }
  );
  return encryptedOtp;
};

const decryptOtp = () => {};

const verifyOtp = () => {};

const expiryCheck = () => {};

export { encryptOtp, decryptOtp, verifyOtp };
