// const mongoose = require("mongoose");
// const logger = require("./logger");

// const connectDB = async () => {
//   const mongoURI = process.env.MONGODB_URI;
//   try {
//     const conn = await mongoose.connect(mongoURI);
//     logger.info(
//       `MongoDB connected | host=${conn.connection.host} | db=${conn.connection.name}`
//     );
//     return conn;
//   } catch (error) {
//     logger.error("MongoDB connection failed", { error: error.message });
//     throw error;
//   }
// };

// module.exports = connectDB;

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
