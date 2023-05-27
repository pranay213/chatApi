import mongoose from "mongoose";
import { encryptOtp } from "../Functions/UserFunctions.js";
const { Schema, model } = mongoose;
const UserSchema = new Schema(
  {
    number: String,
    otptoken: String,
  },
  {
    timestamps: true,
  }
);
const UserModel = mongoose.model("User", UserSchema);

const UserSave = async (number) => {
  try {
    let numberExist = await UserModel.find({ number });
    if (numberExist.length === 0) {
      return NewUserSave(number).then((res) => res);
    } else {
      console.log("updated logger executed");
      return UserUpdate(number).then((res) => res);
    }
  } catch (error) {
    return { status: 500, message: "Something Error", error: error };
  }
};
const NewUserSave = async (number) => {
  try {
    const newUser = new UserModel({
      number,
      otptoken: await encryptOtp(number),
    });
    let new_user = await newUser.save();
    if (new_user) {
      return { status: 200, message: "OTP sent successfully" };
    }
  } catch (error) {
    return { status: 500, message: "Something Error", error: error };
  }
};

const UserUpdate = async (number) => {
  try {
    let updateUser = await UserModel.findOneAndUpdate(
      { number },
      {
        $set: {
          otptoken: await encryptOtp(number),
        },
      }
    );
    console.log({ updateUser });
    if (updateUser) {
      return { status: 200, message: "OTP sent successfully" };
    }
  } catch (error) {
    return { status: 500, message: "Something Error", error: error };
  }
};

export { UserSchema, UserModel, UserSave };
