/*
 * FIXED: Cloudinary upload utility
 * ISSUES RESOLVED:
 * 1. Function wasn't returning the upload result properly
 * 2. Unused imports were causing confusion
 * 3. Missing error handling for file cleanup
 */

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// REMOVED: Unused imports that were causing issues
// PREVIOUS CODE: import { error } from "console"; import { response } from "express";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filepath) => {
  try {
    if (!filepath) return null;

    // FIXED: Properly capture and return the upload result
    // PREVIOUS CODE: await cloudinary.uploader.upload(filepath, { resource_type: "auto" });
    // ISSUE: Result wasn't being captured, so function returned undefined
    const result = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });

    // FIXED: Use actual result.url instead of undefined response.url
    // PREVIOUS CODE: console.log("File uploaded successfully to Cloudinary", response.url);
    console.log("File uploaded successfully to Cloudinary", result.url);
    
    // ENHANCED: Proper file cleanup with error handling
    // PREVIOUS CODE: fs.unlink(filepath) - no error handling
    fs.unlink(filepath, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });
    
    // FIXED: Return the actual result object
    // PREVIOUS CODE: return response; (which was undefined)
    return result;
  } catch (error) {
    // ENHANCED: Better error logging and cleanup
    console.error("Error uploading to Cloudinary:", error);
    
    // Clean up the local file on error
    fs.unlink(filepath, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });

    return null;
  }
};

export { uploadOnCloudinary };
