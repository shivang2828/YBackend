import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { User } from "../models/user.model.js";

import { uploadOnCloudinary } from "../utils/cloudinary.js";

import { ApiResponse } from "../utils/ApiResponse.js";

import jwt from "jsonwebtoken";

// const { name, email, password, username } = req.body;

// if ([name, email, password, username].some(field => field.trim() === "")) {
//  throw new ApiError(400, "All fields are required");
// }

//      const  existedUser = await User.findOne({
//   $or: [{ email }, { username }]
// })
// if(existedUser) {
//   throw new ApiError(409, "User with this email or username already exists");
//   }

// const avataLoacalPath = req.files?.avatar[0]?.path
// const coverImageLocalPath = req.files?.image[0]?.path

// if(!avataLoacalPath){
//   throw new ApiError(400, "Avatar is required");
// }

// const avatar = await uploadOnCloudinary(avataLoacalPath)
// const coverImage = await uploadOnCloudinary(coverImageLocalPath)

// if(!avatar){
//   throw new ApiError(500, "Failed to upload avatar");
// }

// const user =  await User.create({
//   name,
//   email,
//   avatar: avatar.url,
//   coverImage: coverImage?.url || "",
//   username : username.toLowerCase(),
//   password,

// })

// const createdUser = await User.findById(user._id).select("-password -refreshToken");

// if(!createdUser) {
//   throw new ApiError(500, "Failed to create user");
// }

// return res.status(200).json({
//  message: "User registered successfully",
// });
// });

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const acessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({
      validateBeforeSave: false, // Skip validation to avoid issues with missing fields
    });

    return { acessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate refresh token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // ADDED: Comprehensive debug logging to track the multer parsing issue
  console.log("=== REQUEST DEBUG ===");
  console.log("req.body:", req.body);
  console.log("req.files:", req.files);
  console.log("req.headers['content-type']:", req.headers["content-type"]);
  console.log("Body type:", typeof req.body);
  console.log("Body keys:", Object.keys(req.body || {}));
  console.log("====================");

  // CHANGED: Updated field name from 'name' to 'fullname' to match user model schema
  // PREVIOUS CODE: const { name, email, password, username } = req.body;
  // REASON: User model has 'fullname' field, not 'name'
  let { fullname, email, password, username } = req.body || {};

  // ADDED: Enhanced validation to handle empty req.body due to multer parsing issues
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log("req.body is empty - this is the multer parsing issue");
    throw new ApiError(
      400,
      "Form data not properly parsed. Please ensure you're sending multipart/form-data with text fields."
    );
  }

  // ENHANCED: Better validation with detailed debugging
  // PREVIOUS CODE: Simple validation without detailed logging
  if (!fullname || !email || !password || !username) {
    console.log("Missing fields:", { fullname, email, password, username });
    console.log("Available fields in req.body:", Object.keys(req.body));
    // CHANGED: Updated error message to reflect correct field names
    throw new ApiError(
      400,
      "All fields (fullname, email, password, username) are required"
    );
  }

  // Validate that fields are not empty
  if (
    [fullname, email, password, username].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required and cannot be empty");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  // CHANGED: Updated to use 'coverimage' (lowercase) to match route and model
  // PREVIOUS CODE: const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  // REASON: Route was expecting 'coverimage' but controller was looking for 'coverImage'
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverimage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  // CHANGED: Updated to match user model schema exactly
  // PREVIOUS CODE: Used 'name' and 'coverImage'
  // CURRENT: Using 'fullname' and 'coverimage' to match user.model.js schema
  const user = await User.create({
    fullname: fullname.trim(), // CHANGED: 'name' -> 'fullname'
    email: email.trim().toLowerCase(), // ENHANCED: Added trim() and toLowerCase()
    avatar: avatar.url,
    coverimage: coverImage?.url || "", // CHANGED: 'coverImage' -> 'coverimage'
    username: username.trim().toLowerCase(), // ENHANCED: Added trim()
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "Email or username are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { refreshToken, acessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", acessToken, options)
    .json(
      new ApiResponse(
        200,

        {
          loggedInUser,
          refreshToken,
          acessToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,

    {
      set: {
        refreshToken: undefined,
      },
    },

    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized, refresh token is required ");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new ApiError(401, "Unauthorized, invalid refresh token");
    }

    const user = await User.findById(decodedToken.id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await user.generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },

          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Unauthorized, invalid refresh token"
    );
  }
});

export { registerUser, loginUser, logoutUser , refreshAccessToken };
