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

const verifyOtp = async (token, number, otp) => {
  try {
    var decoded = jwt.verify(token, OTPSECRETKEY);
    console.log("decoded", { decoded });
    if (decoded) {
      const { data } = decoded;
      console.log(number, otp, data);
      if (number == data.number && otp == data.otp) {
        let authtoken = await authTokenFn(number);
        if (authtoken) {
          return { status: 200, message: "Login Success", token: authtoken };
        } else {
          return { status: 400, message: "Something Wrong" };
        }
      } else {
        return { status: 400, message: "OTP Wrong" };
      }
    }
  } catch (err) {
    // err
    // console.log({ err });
    if (err) {
      return { status: 400, message: "OTP expired .Please click on resend" };
    }
  }
};

const expiryCheck = () => {};

const authTokenFn = async (number) => {
  let AuthToken = await jwt.sign(
    {
      number,
    },
    OTPSECRETKEY
  );
  return AuthToken;
};

export { encryptOtp, decryptOtp, verifyOtp };
