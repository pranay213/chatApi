import cloudinary from "cloudinary";
export const configCloudinary = cloudinary.config({
  cloud_name: "daawlpc2s",
  api_key: "116242611169748",
  api_secret: "4Dn28LxyPxQbj2eFPfUKbOdfEMo",
});

export const uploadFile = async (path) => {
  console.log("cloudinary is ");
  return cloudinary.v2.uploader.upload(path).then((result) => {
    console.log("result ", result);
    return result;
  });
};
