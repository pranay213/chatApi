import express from "express";
import path from "path";
import fs from "fs";
import os from "os";
import FormData from "form-data";
import https from "https";
import {
  UserSave,
  UserSchema,
  UserModel,
  UserCheck,
  ImageUpdate,
  getUser,
} from "../Model/UserModel.js";
import { verifyAuth } from "../Functions/UserFunctions.js";
const UserRoute = express.Router();
import multer from "multer";
import axios from "axios";
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
      if (files.image.mimetype.includes("image")) {
        console.log("this is executing");
        let __dirname = path.resolve();
        console.log("file---", __dirname);

        let sampleFile = req.files.image;
        console.log(Date.now());

        let fileName = `${Date.now()}-${sampleFile.name}`;
        // let fileName = sampleFile.name;
        let uploadPath = `${__dirname}/uploads/temp_images/${fileName}`;

        sampleFile.mv(uploadPath, async function (err) {
          if (err) {
            return res.status(500).send(err);
          }
          let Resp = await uploadScreen(uploadPath);
          console.log({ Resp });
          res.send({
            status: 200,
            message: "uploaded sucess",
            path: uploadPath,
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
        message: "Something went Wrong",
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
      return res.send(Response);
    } catch (error) {
      return res.send({
        status: 500,
        message: "Something went Wrong",
        error: error,
      });
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

async function uploadScreen(uploadPath) {
  try {
    //create axios instance
    const ApiCall = axios.create({
      baseURL: "https://chat-api-pranay.000webhostapp.com/upload.php",
      timeout: 60000, //optional
      httpsAgent: new https.Agent({ keepAlive: true }),
      headers: { "Content-Type": "multipart/form-data" },
    });
    let image = await fs.createReadStream(uploadPath);
    var formData = new FormData();
    formData.append("image", image);
    let sending_image_result = await ApiCall.post("/", formData);
    //Image is send
    console.log("Result: ", sending_image_result.data);
    return sending_image_result.data;
  } catch (error) {
    console.log("Error: ", error);
  }
}
export { UserRoute };
