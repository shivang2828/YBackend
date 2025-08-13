import { Router } from "express";
import { registerUser  } from "../controllers/user.controller.js";

import {upload} from "../middleware/multer.middleware.js";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from '../utils/asyncHandler.js';




const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "image",
            maxCount: 1
        }
    ]),
    
    
    registerUser)

// userRouter.route("/login").post(loginUser)





export default userRouter;

