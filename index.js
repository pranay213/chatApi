import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
import cors from "cors";
import fs from "fs";
const require = createRequire(import.meta.url);
const swaggerDocument = require("./swagger.json");
import { UserRoute } from "./Routes/UserRoute.js";
const customCss = fs.readFileSync(process.cwd() + "/swagger.css", "utf8");
var ip = require("ip");
console.log("ip", ip.address());

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
const PORT = process.env.PORT;
const MONGO_DB_URL = process.env.MONGO_DB_URL;

//connecting to mongodb
async function main() {
  try {
    let res = await mongoose.connect(MONGO_DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB IS CONNECTED");
  } catch (error) {
    console.log("error", error);
  }

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}
main();
app.use((err, req, res, next) => {
  // you can error out to stderr still, or not; your choice
  // console.error(err);

  // body-parser will set this to 400 if the json is in error
  if (err.status === 400)
    return res.send({ status: 400, message: "Dude, you messed up the JSON" });

  return next(err); // if it's not a 400, let the default error handling do it.
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { customCss })
);
//User Route
app.use("/api/user", UserRoute);

//listening on port
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:` + PORT);
});
