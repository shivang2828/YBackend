import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from '../utils/asyncHandler.js';

const userRouter = Router();

// Test endpoint to verify basic functionality
userRouter.route("/test").post(asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "User router is working",
    body: req.body,
    files: req.files
  });
}));

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  registerUser
);

// userRouter.route("/login").post(loginUser)

export default userRouter;

