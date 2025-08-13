
import dotenv from "dotenv";
import conncectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

conncectDB().then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT || 8000}`);
    });
}).catch((err) => {
  console.error("❌ Error connecting to MongoDB:", err);
  process.exit(1); // exit process if connection fails
})

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DBNAME}`, );
//     console.log("✅ Connected to MongoDB");
//     app.on("error", (err) => {
//       console.error("❌ Error in Express app:", err);
//       throw err; // rethrow to stop the app
//     }
//     );
//     app.listen(process.env.PORT, () => {
//       console.log(`🚀 Server is running on port ${process.env.PORT}`);
//     });
//   } catch (e) {
//     console.error("❌ Error connecting to MongoDB:", e);
//     process.exit(1); // exit process if connection fails
//   }
// })();
