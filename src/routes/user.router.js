import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
// CHANGED: Import new multipart parser instead of original multer middleware
// PREVIOUS CODE: import { upload } from "../middleware/multer.middleware.js";
// REASON: Original multer.fields() wasn't properly parsing text fields into req.body
import { parseMultipartForm, organizeUploadedData } from "../middleware/multipartParser.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyJWT } from "../middleware/auth.middleware.js";

const userRouter = Router();

// ENHANCED: Test endpoint with proper multipart form data handling
userRouter.route("/test").post(
  // CHANGED: Use new parsing middleware instead of upload.fields()
  // PREVIOUS CODE: upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverimage", maxCount: 1 }])
  parseMultipartForm,        // Parse all multipart data
  organizeUploadedData,      // Reorganize files into expected structure
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      message: "User router is working",
      body: req.body,
      files: req.files,
      contentType: req.headers['content-type']
    });
  })
);

// CHANGED: Updated registration route to use new middleware
userRouter.route("/register").post(
  // PREVIOUS CODE: upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverimage", maxCount: 1 }])
  // REASON: multer.fields() was causing req.body to be empty, leading to "All fields required" error
  parseMultipartForm,        // Parse multipart form data (both files and text fields)
  organizeUploadedData,      // Reorganize files into the structure expected by controller
  registerUser               // Process the registration
);

// userRouter.route("/login").post(loginUser)



userRouter.route("/login").post(loginUser)



//secure route to test JWT verification


userRouter.route("/logout").post(verifyJWT, logoutUser);






export default userRouter;

