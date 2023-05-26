import express from "express";
const UserRoute = express.Router();

UserRoute.get("/", (req, res) =>
  res.send({
    status: 200,
    message: "API is running ",
  })
);

export { UserRoute };
