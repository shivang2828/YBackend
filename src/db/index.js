/*
 * FIXED: Database connection module
 * TYPOS CORRECTED:
 * 1. Function name: conncectDB -> connectDB (was already fixed)
 * 2. Variable name: connectionInsatnce -> connectionInstance (was already fixed)
 * 3. Formatting and error handling improvements
 * 4. Removed extra comma in mongoose.connect()
 * 5. Fixed export statement spacing
 */

import mongoose, { connect } from "mongoose";
import { DBNAME } from "../constant.js";

const connectDB = async () => {
  try {
    // FIXED: Removed extra comma at the end
    // PREVIOUS CODE: await mongoose.connect(`${process.env.MONGODB_URI}/${DBNAME}`, );
    // ISSUE: Unnecessary comma after DBNAME
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DBNAME}`);

    console.log(`✅ Connected to MongoDB || DB_HOST: ${connectionInstance.connection.host}`);
  } catch (e) {
    // IMPROVED: Better formatting and consistent indentation
    console.error("❌ Error connecting to MongoDB:", e);
    process.exit(1); // exit process if connection fails
  }
};

// FIXED: Export statement spacing
// PREVIOUS CODE: export  default connectDB (extra space)
export default connectDB;