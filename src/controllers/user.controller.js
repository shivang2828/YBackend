

import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js";

import { User } from '../models/user.model.js';

import {uploadOnCloudinary} from "../utils/cloudinary.js";


import { ApiResponse } from '../utils/ApiResponse.js';


// const registerUser = asyncHandler(async (req, res) => {
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






const registerUser = asyncHandler(async (req, res) => {
  // Access form data from req.body (text fields) and files from req.files
  const { fullname, email, password, username } = req.body;

  // Validate that all required fields exist
  if (!fullname || !email || !password || !username) {
    throw new ApiError(400, "All fields (fullname, email, password, username) are required");
  }

  // Validate that fields are not empty
  if ([fullname, email, password, username].some(field => field.trim() === "")) {
    throw new ApiError(400, "All fields are required and cannot be empty");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }]
  });
  
  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  const user = await User.create({
    fullname: fullname.trim(),
    email: email.trim().toLowerCase(),
    avatar: avatar.url,
    coverimage: coverImage?.url || "",
    username: username.trim().toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  );
});



export { registerUser};