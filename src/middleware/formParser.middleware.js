import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure temp directory exists
const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Add timestamp to prevent filename conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer instance with proper configuration
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Custom middleware that ensures req.body is properly populated
export const uploadUserFiles = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverimage", maxCount: 1 }
]);

// Middleware to debug form data
export const debugFormData = (req, res, next) => {
  console.log("=== FORM DATA DEBUG ===");
  console.log("req.body:", req.body);
  console.log("req.files:", req.files);
  console.log("Content-Type:", req.headers['content-type']);
  console.log("Raw body type:", typeof req.body);
  console.log("Body keys:", Object.keys(req.body || {}));
  console.log("=======================");
  next();
};
