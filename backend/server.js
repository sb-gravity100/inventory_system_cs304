import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import salesRoutes from "./routes/sales.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRoutes);
app.use("/sales", salesRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
