import User from "./Models/User.js";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "inventory_system",
    });
    console.log("MongoDB connected");
    let admin = User.findOne({ username: "admin" });
    if (!admin) {
      const newAdmin = await User.create({
        username: "admin",
        password: "admin123",
        role: "admin",
      });
      console.log("Admin user created.");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
