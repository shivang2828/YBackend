import mongoose, { connect } from "mongoose";


import { DBNAME } from "../constant.js";

const conncectDB = async  () => {
     
  try{
     const connectionInsatnce = await mongoose.connect(`${process.env.MONGODB_URI}/${DBNAME}`, );

     console.log(`✅ Connected to MongoDB || DB_HOST: ${connectionInsatnce.connection.host}`);

  }


    catch (e) {        console.error("❌ Error connecting to MongoDB:", e);
        process.exit(1); // exit process if connection fails
    }
}


export  default conncectDB