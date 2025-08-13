/*
 * NEW FILE: Custom multipart form data parser
 * PURPOSE: Fixes the issue where multer.fields() wasn't properly parsing text fields into req.body
 * 
 * PROBLEM SOLVED: 
 * - Original multer.fields() configuration was causing req.body to be empty
 * - This led to "All fields are required" error even when all fields were sent
 * 
 * SOLUTION:
 * - Uses multer.any() instead of multer.fields() to parse all form data
 * - Reorganizes files into the structure expected by the controller
 * - Ensures both text fields and files are properly accessible
 */

import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure temp directory exists
const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// SAME AS ORIGINAL: Disk storage configuration for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filenames to prevent conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// SAME AS ORIGINAL: Multer configuration with file validation
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// CHANGED: Use upload.any() instead of upload.fields()
// REASON: upload.fields() was not properly parsing text fields into req.body
// upload.any() accepts all files and properly parses text fields
export const parseMultipartForm = upload.any();

// NEW: Custom middleware to reorganize files into expected structure
// REASON: upload.any() returns files as an array, but controller expects grouped object
export const organizeUploadedData = (req, res, next) => {
  console.log("=== MULTIPART PARSER DEBUG ===");
  console.log("req.body before:", req.body);
  console.log("req.files before:", req.files);
  
  // Transform files array into grouped object structure
  // BEFORE: req.files = [{ fieldname: 'avatar', ... }, { fieldname: 'coverimage', ... }]
  // AFTER:  req.files = { avatar: [{ ... }], coverimage: [{ ... }] }
  if (req.files) {
    req.files = req.files.reduce((acc, file) => {
      if (!acc[file.fieldname]) {
        acc[file.fieldname] = [];
      }
      acc[file.fieldname].push(file);
      return acc;
    }, {});
  }
  
  console.log("req.body after:", req.body);
  console.log("req.files after:", req.files);
  console.log("================================");
  
  next();
};
