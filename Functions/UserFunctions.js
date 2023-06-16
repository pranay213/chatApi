import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { sendOTP } from "./Fast2SMS.js";
import axios from "axios";
import https from "https";
import fs from "fs";
import FormData from "form-data";
import Encryptor from "file-encryptor";
import path from "path";
import { UploadFile, downloadFile } from "../Firebase/index.js";
import webp from "webp-converter";
let __dirname = path.resolve();
webp.grant_permission();

dotenv.config();
const OTPSECRETKEY = process.env.OTPSECRETKEY;
const AUTHSECRETKEY = process.env.AUTHSECRETKEY;
const ENCRTYPTKEY = process.env.ENCRTYPTKEY;

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
    AUTHSECRETKEY
  );
  return AuthToken;
};

const verifyAuth = (lstoken) => {
  try {
    var decoded = jwt.verify(lstoken, AUTHSECRETKEY);
    console.log("decoded", { decoded });

    return { status: 200, message: "Valid Token", number: decoded.number };
  } catch (err) {
    return { status: 404, message: "Invalid token", err: err };
  }
};

async function uploadScreen(uploadPath, new_fileName) {
  try {
    console.log("upload", { uploadPath });
    let resultUpload = await UploadFile(uploadPath, new_fileName);
    return resultUpload;
  } catch (error) {
    console.log("Error: ", error);
  }
}

const getFile = async (path) => {
  if (fs.existsSync(`${__dirname}/tmp/Uploads/temp_images/${path}`)) {
    let imagBuf = await fs.readFileSync(
      `${__dirname}/tmp/Uploads/temp_images/${path}`
    );
    let new_imagBuffer = new Buffer.from(imagBuf).toString("base64");
    return new_imagBuffer;
  } else {
    console.log("error");
    let response = await downloadFile(path);
    if (response) {
      let imagBuf = await fs.readFileSync(
        `${__dirname}/tmp/Uploads/temp_images/${path}`
      );
      let new_imagBuffer = new Buffer.from(imagBuf).toString("base64");
      return new_imagBuffer;
    }
  }
};

const fileEncryption = async (uploadPath) => {
  let new_name = Date.now() + "-file.dat";
  let encryptedPath = __dirname + "\\tmp\\Uploads\\EncryptedFiles\\" + new_name;
  Encryptor.encryptFile(uploadPath, encryptedPath, ENCRTYPTKEY, function (err) {
    console.log(err, "errr");
  });
  let data = { encryptedPath, new_name };

  return data;
};

const fileDecryption = async (path, ext) => {
  // Decrypt file.
  let full_path = `${__dirname}/tmp/Uploads/EncryptedFiles/${path}`;
  let img_path = `${__dirname}/tmp/Uploads/temp_images/${path}.${ext}`;
  Encryptor.decryptFile(full_path, img_path, ENCRTYPTKEY, function (err) {
    // Decryption complete.
  });
};

const webPconversion = () => {
  const result = webp.webpmux_add(
    "in.webp",
    "icc_container.webp",
    "image_profile.icc",
    "icc",
    (logging = "-v")
  );
  result.then((response) => {
    console.log(response);
  });
};
export {
  encryptOtp,
  decryptOtp,
  verifyOtp,
  verifyAuth,
  fileEncryption,
  uploadScreen,
  getFile,
  fileDecryption,
};
