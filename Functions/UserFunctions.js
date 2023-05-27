import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { sendOTP } from "./Fast2SMS.js";
dotenv.config();
const OTPSECRETKEY = process.env.OTPSECRETKEY;
const AUTHSECRETKEY = process.env.AUTHSECRETKEY;

const otpGenerate = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const encryptOtp = async (number) => {
  let otp = otpGenerate();
  let encryptedOtp = await jwt.sign(
    {
      data: { number, otp },
    },
    OTPSECRETKEY,
    { expiresIn: 60 }
  );
  console.log({ encryptedOtp });
  if (encryptedOtp) {
    let smsResp = await sendOTP(number, otp);
  }
  return encryptedOtp;
};

const decryptOtp = () => {};

const verifyOtp = () => {};

const expiryCheck = () => {};

export { encryptOtp, decryptOtp, verifyOtp };
