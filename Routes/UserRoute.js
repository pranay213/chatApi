import express from "express";
import { UserSave, UserSchema, UserModel } from "../Model/UserModel.js";
const UserRoute = express.Router();

UserRoute.get("/", (req, res) =>
  res.send({
    status: 200,
    message: "API is running ",
  })
).post("/", async (req, res) => {
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

export { UserRoute };
