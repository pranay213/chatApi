import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
const FAST2SMSAPI = process.env.FAST2SMSAPI;

const sendOTP = async (number, otp) => {
  try {
    const data = { variables_values: otp, route: "otp", numbers: number };
    let res = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      { ...data },
      {
        headers: {
          authorization: FAST2SMSAPI,
          "Content-Type": "application/json",
        },
      }
    );
    // console.log("reponse", res);
    if (res.return) {
      return { status: 200, message: "OTP sent successfully" };
    }
  } catch (error) {
    console.log({ error });
    return { status: 500, message: "Something went wrong ", error: error };
  }
};

export { sendOTP };
