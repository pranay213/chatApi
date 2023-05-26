import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { UserRoute } from "./Routes/UserRoute.js";

const app = express();
app.use(express.json());
dotenv.config();
const PORT = process.env.PORT;
const MONGO_DB_URL = process.env.MONGO_DB_URL;

//connecting to mongodb
async function main() {
  try {
    let res = await mongoose.connect(MONGO_DB_URL);
    console.log("DB IS CONNECTED");
  } catch (error) {
    console.log("error", error);
  }

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
main();

//User Route
app.use("/api/user", UserRoute);

//listening on port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:` + PORT);
});
