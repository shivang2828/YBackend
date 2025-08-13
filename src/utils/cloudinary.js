import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import { response } from "express";
import fs from "fs";



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filepath) => {
  try {
    if (!filepath) return null;

    await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });

    console.log("File uploaded successfully to Cloudinary", response.url);
    return response;
  } catch (error) {

      fs.unlink(filepath)

      return null

  }
};



export { uploadOnCloudinary };
