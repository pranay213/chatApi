import { Storage } from "@google-cloud/storage";
import admin from "firebase-admin";
import { createRequire } from "module";
import path from "path";
let __dirname = path.resolve();
const require = createRequire(import.meta.url);
const serviceAccountKey = require("./../privatekey.json");
let bucketName = "chat-app-68219.appspot.com";
//initialize the app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  storageBucket: "chat-app-68219.appspot.com", //you can find in storage.
});

//get your bucket
var bucket = admin.storage().bucket();
const storage = new Storage({ keyFilename: "./privatekey.json" });

//function to upload file
async function UploadFile(filepath, filename) {
  console.log("file_path", filepath, "filename", filename);
  let res = await bucket.upload(filepath, {
    gzip: true,
    destination: "profile-images/" + filename,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  console.log(`${filename} uploaded to bucket.`);
  console.log("res", res);
  return true;
}

async function downloadFile(srcFilename) {
  console.log("srcFilename", srcFilename);
  let destPath = `${__dirname}/tmp/Uploads/temp_images/${srcFilename}`;
  const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: destPath,
  };

  // Downloads the file
  // const result = await bucket.file(srcFilename).download(options);
  let downloadRes = await storage
    .bucket(bucketName)
    .file("profile-images/" + srcFilename)
    .download(options);
  console.log("downloadRes", downloadRes);
  return true;

  console.log(
    `gs://${bucketName}/${"/images/" + srcFilename} downloaded to ${destPath}.`
  );
}

// setTimeout(async () => {
//   await downloadFile("1686721537297-file.dat");
// }, 5000);

export { UploadFile, downloadFile };
