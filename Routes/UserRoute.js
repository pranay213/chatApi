import express from "express";
import {
  UserSave,
  UserSchema,
  UserModel,
  UserCheck,
} from "../Model/UserModel.js";
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

export { UserRoute };
