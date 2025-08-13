import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer"; // ADDED: Import multer for error handling

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware - order matters!
app.use(express.json({
  limit: "16kb",
}));

// CHANGED: Removed express.urlencoded as it conflicts with multer for multipart form data
// PREVIOUS CODE: app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// REASON: express.urlencoded() interferes with multer's parsing of multipart form data
// app.use(express.urlencoded({ 
//   extended: true, 
//   limit: "16kb" 
// }));

app.use(cookieParser());
app.use(express.static("public"));

// Routes
import userRouter from "./routes/user.router.js";
app.use("/api/v1/users", userRouter);

// ENHANCED: Error handling middleware with comprehensive multer error handling
app.use((err, req, res, next) => {
  console.error("Error:", err);
  
  // ADDED: Enhanced multer error handling for better debugging
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB"
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded"
      });
    }
    // ADDED: Handle unexpected file field errors
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Unexpected file field: ${err.field}`
      });
    }
  }
  
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

// CHANGED: 404 handler - fixed from app.use("*", ...) to app.use((req, res) => ...)
// PREVIOUS CODE: app.use("*", (req, res) => {...});
// REASON: The "*" pattern can cause path-to-regexp parsing errors in some Express versions
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

export default app;
