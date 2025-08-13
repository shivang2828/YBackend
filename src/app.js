import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";

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

app.use(express.urlencoded({ 
  extended: true, 
  limit: "16kb" 
}));

app.use(cookieParser());
app.use(express.static("public"));

// Routes
import userRouter from "./routes/user.router.js";
app.use("/api/v1/users", userRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  
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

// 404 handler - use a more compatible pattern
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

export default app;
