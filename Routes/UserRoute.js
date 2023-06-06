import express from "express";
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
    req.number = Resp;
    next();
  },
  async (req, res) => {
    // const { image, number } = req.body;
    console.log("this is executing");
    const { number } = req;
    console.log({ number });
    try {
      const { files } = req;
      if (files.image.mimetype.includes("image")) {
        let base64data = new Buffer.from(files.image.data, "base64").toString(
          "base64"
        );
        let img64 = "data:image/webp;base64," + base64data;
        let resp = await ImageUpdate(number, img64);
        return res.send(resp);
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
        next(req, res);
      } else {
        return res.send(resp);
      }
    } else {
      return res.send({
        status: 404,
        message: "Invalid Login",
      });
    }
  } catch (error) {
    return res.send({
      status: 500,
      message: "Something went Wrong",
      error: error,
    });
  }
};
export { UserRoute };
