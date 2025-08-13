import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filepath) => {
  try {
    if (!filepath) return null;

    const result = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });

    console.log("File uploaded successfully to Cloudinary", result.url);
    
    // Clean up the local file after successful upload
    fs.unlink(filepath, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });
    
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    
    // Clean up the local file on error
    fs.unlink(filepath, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });

    return null;
  }
};

export { uploadOnCloudinary };
