/**
 * reset-db.js — wipes all collections and re-seeds the default admin user.
 * Usage: node backend/scripts/reset-db.js
 * Requires: MONGO_URI in backend/.env
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

// Load .env from backend/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import User from "../Models/User.js";
import Product from "../Models/Product.js";
import Transaction from "../Models/Transaction.js";
import Log from "../Models/Log.js";

async function resetDB() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI, { dbName: "inventory_system" });
  console.log("Connected.");

  console.log("Dropping collections...");
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Transaction.deleteMany({}),
    Log.deleteMany({}),
  ]);
  console.log("All collections cleared.");

  console.log("Seeding default admin user...");
  await User.create({ username: "admin", password: "admin123", role: "admin" });
  console.log("Admin user created (username: admin, password: admin123).");

  await mongoose.disconnect();
  console.log("Done. Database reset complete.");
}

resetDB().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
