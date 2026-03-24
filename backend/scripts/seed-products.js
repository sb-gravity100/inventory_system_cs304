/**
 * seed-products.js — inserts sample product data into the database.
 * Skips products whose SKU already exists; will not duplicate on re-run.
 * Usage: npm run seed-products  (from /backend)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

import Product from "../Models/Product.js";

const products = [
  {"name":"Wireless Bluetooth Earbuds","sku":"PRD-0001","price":1299.99,"costPrice":699.99,"stock":120,"low_stock_threshold":10},
  {"name":"Mechanical Keyboard RGB","sku":"PRD-0002","price":3499.99,"costPrice":2100.00,"stock":80,"low_stock_threshold":15},
  {"name":"USB-C Fast Charging Cable","sku":"PRD-0003","price":199.99,"costPrice":99.99,"stock":200,"low_stock_threshold":20},
  {"name":"Portable Power Bank 20000mAh","sku":"PRD-0004","price":1499.99,"costPrice":899.99,"stock":75,"low_stock_threshold":12},
  {"name":"LED Desk Lamp Adjustable","sku":"PRD-0005","price":899.99,"costPrice":450.00,"stock":60,"low_stock_threshold":10},
  {"name":"Office Ergonomic Chair","sku":"PRD-0006","price":5999.99,"costPrice":3800.00,"stock":25,"low_stock_threshold":8},
  {"name":"Stainless Steel Water Bottle","sku":"PRD-0007","price":349.99,"costPrice":180.00,"stock":140,"low_stock_threshold":15},
  {"name":"Non-stick Frying Pan 28cm","sku":"PRD-0008","price":799.99,"costPrice":420.00,"stock":90,"low_stock_threshold":10},
  {"name":"Electric Rice Cooker 1.5L","sku":"PRD-0009","price":1999.99,"costPrice":1200.00,"stock":50,"low_stock_threshold":10},
  {"name":"Smartphone Tripod Stand","sku":"PRD-0010","price":299.99,"costPrice":150.00,"stock":110,"low_stock_threshold":12},
  {"name":"Gaming Mouse Wired","sku":"PRD-0011","price":599.99,"costPrice":320.00,"stock":95,"low_stock_threshold":10},
  {"name":"Laptop Backpack Waterproof","sku":"PRD-0012","price":1199.99,"costPrice":650.00,"stock":70,"low_stock_threshold":12},
  {"name":"External Hard Drive 1TB","sku":"PRD-0013","price":3499.99,"costPrice":2200.00,"stock":40,"low_stock_threshold":8},
  {"name":"Wireless Mouse Rechargeable","sku":"PRD-0014","price":499.99,"costPrice":250.00,"stock":130,"low_stock_threshold":15},
  {"name":"Ceramic Coffee Mug Set","sku":"PRD-0015","price":399.99,"costPrice":200.00,"stock":85,"low_stock_threshold":10},
  {"name":"Digital Alarm Clock LED","sku":"PRD-0016","price":549.99,"costPrice":300.00,"stock":60,"low_stock_threshold":10},
  {"name":"Air Fryer 4.5L","sku":"PRD-0017","price":4599.99,"costPrice":3000.00,"stock":35,"low_stock_threshold":8},
  {"name":"Portable Bluetooth Speaker","sku":"PRD-0018","price":1599.99,"costPrice":900.00,"stock":75,"low_stock_threshold":10},
  {"name":"Notebook Spiral A5 Pack","sku":"PRD-0019","price":149.99,"costPrice":70.00,"stock":180,"low_stock_threshold":20},
  {"name":"Ballpoint Pen Set 10pcs","sku":"PRD-0020","price":99.99,"costPrice":45.00,"stock":200,"low_stock_threshold":20},
  {"name":"Whiteboard Marker Assorted","sku":"PRD-0021","price":199.99,"costPrice":100.00,"stock":150,"low_stock_threshold":15},
  {"name":"Desk Organizer Multi-slot","sku":"PRD-0022","price":349.99,"costPrice":180.00,"stock":95,"low_stock_threshold":10},
  {"name":"HD Webcam 1080p","sku":"PRD-0023","price":1299.99,"costPrice":750.00,"stock":65,"low_stock_threshold":10},
  {"name":"Monitor Stand Adjustable","sku":"PRD-0024","price":899.99,"costPrice":500.00,"stock":55,"low_stock_threshold":8},
  {"name":"Wireless Charger Pad","sku":"PRD-0025","price":699.99,"costPrice":350.00,"stock":120,"low_stock_threshold":12},
  {"name":"Kitchen Knife Set 5pcs","sku":"PRD-0026","price":1499.99,"costPrice":850.00,"stock":45,"low_stock_threshold":8},
  {"name":"Electric Kettle 1.7L","sku":"PRD-0027","price":999.99,"costPrice":550.00,"stock":70,"low_stock_threshold":10},
  {"name":"Plastic Food Storage Set","sku":"PRD-0028","price":599.99,"costPrice":300.00,"stock":100,"low_stock_threshold":12},
  {"name":"USB Flash Drive 64GB","sku":"PRD-0029","price":449.99,"costPrice":220.00,"stock":150,"low_stock_threshold":15},
  {"name":"Bluetooth Headphones Over-Ear","sku":"PRD-0030","price":2499.99,"costPrice":1500.00,"stock":60,"low_stock_threshold":10},
  {"name":"Smart LED Light Bulb","sku":"PRD-0031","price":349.99,"costPrice":180.00,"stock":140,"low_stock_threshold":15},
  {"name":"Extension Cord 5 Socket","sku":"PRD-0032","price":499.99,"costPrice":260.00,"stock":130,"low_stock_threshold":15},
  {"name":"Paper Ream A4 500 sheets","sku":"PRD-0033","price":299.99,"costPrice":160.00,"stock":160,"low_stock_threshold":20},
  {"name":"Stapler Heavy Duty","sku":"PRD-0034","price":249.99,"costPrice":120.00,"stock":110,"low_stock_threshold":12},
  {"name":"Scissors Stainless Steel","sku":"PRD-0035","price":149.99,"costPrice":70.00,"stock":180,"low_stock_threshold":15},
  {"name":"Calculator Scientific","sku":"PRD-0036","price":799.99,"costPrice":450.00,"stock":90,"low_stock_threshold":10},
  {"name":"Phone Holder Desk Mount","sku":"PRD-0037","price":199.99,"costPrice":100.00,"stock":140,"low_stock_threshold":15},
  {"name":"Glass Measuring Cup 500ml","sku":"PRD-0038","price":249.99,"costPrice":130.00,"stock":100,"low_stock_threshold":10},
  {"name":"Vacuum Flask 1L","sku":"PRD-0039","price":899.99,"costPrice":500.00,"stock":65,"low_stock_threshold":10},
  {"name":"Table Fan 16 inch","sku":"PRD-0040","price":1499.99,"costPrice":900.00,"stock":50,"low_stock_threshold":8},
  {"name":"Wall Clock Modern Design","sku":"PRD-0041","price":599.99,"costPrice":320.00,"stock":75,"low_stock_threshold":10},
  {"name":"Portable Mini Vacuum Cleaner","sku":"PRD-0042","price":1899.99,"costPrice":1200.00,"stock":45,"low_stock_threshold":8},
  {"name":"Laundry Basket Foldable","sku":"PRD-0043","price":349.99,"costPrice":180.00,"stock":110,"low_stock_threshold":12},
  {"name":"Dish Rack Stainless Steel","sku":"PRD-0044","price":1299.99,"costPrice":750.00,"stock":55,"low_stock_threshold":10},
  {"name":"Shoe Rack 3 Layer","sku":"PRD-0045","price":799.99,"costPrice":450.00,"stock":65,"low_stock_threshold":10},
  {"name":"Bluetooth Car Adapter","sku":"PRD-0046","price":399.99,"costPrice":200.00,"stock":120,"low_stock_threshold":15},
  {"name":"Action Camera 4K","sku":"PRD-0047","price":5999.99,"costPrice":3800.00,"stock":30,"low_stock_threshold":8},
  {"name":"Yoga Mat Non-slip","sku":"PRD-0048","price":699.99,"costPrice":350.00,"stock":90,"low_stock_threshold":12},
  {"name":"Resistance Bands Set","sku":"PRD-0049","price":499.99,"costPrice":250.00,"stock":100,"low_stock_threshold":12},
  {"name":"Digital Kitchen Scale","sku":"PRD-0050","price":799.99,"costPrice":420.00,"stock":70,"low_stock_threshold":10},
];

async function seedProducts() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI, { dbName: "inventory_system" });
  console.log("Connected.");

  let inserted = 0;
  let skipped = 0;

  for (const data of products) {
    const exists = await Product.findOne({ sku: data.sku });
    if (exists) {
      console.log(`  skip  ${data.sku} — ${data.name}`);
      skipped++;
    } else {
      await Product.create(data);
      console.log(`  added ${data.sku} — ${data.name}`);
      inserted++;
    }
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
  await mongoose.disconnect();
}

seedProducts().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
