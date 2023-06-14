import https from "https";
import fs from "fs";
import path from "path";
let __dirname = path.resolve();
const getFile = (path) => {
  const url =
    `https://chat-api-pranay.000webhostapp.com/uploaded_files/` + path;
  https.get(url, (res) => {
    const directory = __dirname + "/uploads/EncryptedFiles/";
    const file_name = path;
    const writeStream = fs.createWriteStream(directory + file_name);

    res.pipe(writeStream);

    writeStream.on("finish", () => {
      writeStream.close();
      console.log("Download Completed!");
    });
  });
};

getFile("bef8a503e97b01ccc8ce19e5704e6a54.dat");
