import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import https from "https";
import {
  UserSave,
  UserSchema,
  UserModel,
  UserCheck,
  ImageUpdate,
  getUser,
} from "../Model/UserModel.js";
import {
  fileDecryption,
  fileEncryption,
  getFile,
  uploadScreen,
  verifyAuth,
} from "../Functions/UserFunctions.js";
const UserRoute = express.Router();
import multer from "multer";
import axios from "axios";
import { UploadFile } from "../Firebase/index.js";
let __dirname = path.resolve();
const upload = multer({ dest: "../Uploads/temp_images/" });

UserRoute.get("/", (req, res) =>
  res.send({
    status: 200,
    message: "API is running ",
  })
).post("/auth", async (req, res) => {
  const { number } = req.body;
  const num_pattern = /^[6-9]\d{9}$/gi;
  if (!number) {
    return res.send({
      status: 400,
      message: "Please Enter Number",
    });
  }
  if (num_pattern.test(number)) {
    try {
      let resp = await UserSave(number);
      return res.send({ ...resp });
    } catch (error) {
      console.log(error);
      return res.send({
        status: 500,
        message: "Something Went Wrong",
      });
    }
  } else {
    return res.send({
      status: 400,
      message: "Please Enter valid mobile number",
    });
  }
});

//otp verification
UserRoute.post("/auth/verify-otp", async (req, res) => {
  try {
    const { number, otp } = req.body;
    const num_pattern = /^[6-9]\d{9}$/gi;
    const otp_pattern = /^\d{6}$/;

    if (!number) {
      return res.send({
        status: 400,
        message: "Please Enter Number",
      });
    }
    if (!otp) {
      return res.send({
        status: 400,
        message: "Please Enter OTP",
      });
    }
    if (!num_pattern.test(number)) {
      return res.send({
        status: 400,
        message: "Please Enter valid mobile number",
      });
    }
    if (!otp_pattern.test(otp)) {
      return res.send({
        status: 400,
        message: "Please Enter valid otp",
      });
    }
    let Response = await UserCheck(number, otp);
    return res.send(Response);
  } catch (error) {
    console.log("error", { error });
    return res.send({
      status: 500,
      message: "Something went Wrong",
      error: error,
    });
  }
});

UserRoute.post("/auth/update", async (req, res) => {
  const { name, number } = req.body;
});
UserRoute.post(
  "/auth/update-image",

  async (req, res, next) => {
    let Resp = await checkAuth(req, res);
    if (Resp.status === 404) {
      return res.send(Resp);
    }
    console.log({ Resp });
    req.number = Resp;
    next();
  },
  async (req, res) => {
    // const { image, number } = req.body;

    try {
      const { number } = req;
      const { files } = req;
      // console.log({ files });
      if (files.image.mimetype.includes("image")) {
        console.log("this is executing");
        let __dirname = path.resolve();
        console.log("file---", __dirname);

        let sampleFile = req.files.image;
        console.log(Date.now());

        let fileName = `${Date.now()}-${sampleFile.name}`;
        // let fileName = sampleFile.name;
        let uploadPath = `${__dirname}/uploads/temp_images/${fileName}`;
        let fileExtension = path.extname(uploadPath);

        sampleFile.mv(uploadPath, async function (err) {
          if (err) {
            return res.status(500).send(err);
          }
          let encryptRes = await fileEncryption(uploadPath);
          console.log("encryptRes", encryptRes);
          const { encryptedPath, new_name } = encryptRes;
          console.log("-------", encryptedPath, new_name);
          let new_fileName = `${fileName}.bat`;
          setTimeout(async () => {
            let Resp = await UploadFile(encryptedPath, new_name);
            console.log({ Resp });
            if (Resp) {
              let imageRes = await ImageUpdate(number, new_name, fileExtension);
            }
            let delete_file = await fs.rmSync(uploadPath, {
              force: true,
            });
            let encrypt_file = await fs.rmSync(encryptedPath, {
              force: true,
            });
            console.log("delete_file", delete_file);
          }, 10000);
          return res.send({
            status: 200,
            message: "uploaded sucess",
          });
        });
      } else {
        return res.send({
          status: 400,
          message: "Please Upload Image only",
        });
      }
    } catch (err) {
      return res.send({
        status: 500,
        message: "Something went Wrong ",
        error: err,
      });
    }
  }
);

UserRoute.get(
  "/auth/get-user",
  async (req, res, next) => {
    let Resp = await checkAuth(req, res);
    console.log({ Resp });
    if (Resp.status === 404) {
      return res.send(Resp);
    }
    req.number = Resp;
    console.log("this is-----");
    next();
  },
  async (req, res) => {
    try {
      const { number } = req;
      let Response = await getUser(number);
      console.log("Response", Response);
      // return res.send(Response);
      if (Response.status === 200) {
        if (Response?.data?.image) {
          let get_file_path = await getFile(Response.data.image);
          return res.send({
            status: 200,
            data: {
              name: Response.data.name,
              image: "",
            },
          });
        } else {
          return res.send({
            status: 200,
            data: {
              name: Response.data.name,
              image: "",
            },
          });
        }
      }
    } catch (error) {
      return res.send({
        status: 500,
        message: "Something went Wrong",
        error: error,
      });
    }
  }
);

UserRoute.use(
  "/auth/get-image",
  express.static(`${__dirname}/Uploads/temp_images/`)
);
UserRoute.get(
  "/auth/get-image",
  async (req, res, next) => {
    let Resp = await checkAuth(req, res);
    console.log({ Resp });
    if (Resp.status === 404) {
      return res.send(Resp);
    }
    req.number = Resp;
    console.log("this is-----");
    next();
  },
  async (req, res) => {
    const { number } = req;
    let Response = await getUser(number);
    console.log("Response", Response);
    if (Response?.data) {
      const { image, ext } = Response.data;
      if (image) {
        console.log(`${__dirname}/Uploads/EnctryptedFiles/${image}`);
        if (fs.existsSync(`${__dirname}/Uploads/EncryptedFiles/${image}`)) {
          let Result = await fileDecryption(image, ext);
          setTimeout(async () => {
            let imagBuf = await fs.readFileSync(
              `${__dirname}/Uploads/temp_images/${image}.${ext}`
            );
            let new_imagBuffer = new Buffer.from(imagBuf).toString("base64");
            // console.log("new_imagBuffer", new_imagBuffer);

            res.send({ status: 200, data: new_imagBuffer });
            return;
          }, 1000);
        } else {
          console.log("file not found!");
          let imagBuf = fs.readFileSync(
            `${__dirname}/Uploads/temp_images/default.webp`
          );

          let new_imagBuffer = new Buffer.from(imagBuf).toString("base64");
          // console.log("new_imagBuffer", new_imagBuffer);
          res.send({ status: 200, data: new_imagBuffer });
          return;
        }
      }
    } else {
      let imagBuf = fs.readFileSync(
        `${__dirname}/Uploads/temp_images/default.webp`
      );

      let new_imagBuffer = new Buffer.from(imagBuf).toString("base64");
      console.log("new_imagBuffer", new_imagBuffer);
      return res.send({ status: 200, data: new_imagBuffer });
    }
  }
);

const checkAuth = async (req, res) => {
  try {
    const { lstoken } = req.headers;
    // console.log({ lstoken });
    if (lstoken) {
      let resp = await verifyAuth(lstoken);
      console.log({ resp });
      if (resp.status === 200) {
        return resp.number;
      } else {
        return res.send(resp);
      }
    } else {
      return {
        status: 404,
        message: "Invalid Login",
      };
    }
  } catch (error) {
    return res.send({
      status: 500,
      message: "Something went Wrong",
      error: error,
    });
  }
};

//upload to other server

export { UserRoute };
