import { Router } from "express";
import { verifyToken } from "../middlewares.js";
import Product from "../Models/Product.js";
import Log from "../Models/Log.js";

const router = Router();

router.get("/", verifyToken, async (req, res) => {
  const { name, page = 1, limit = 10 } = req.query;
  console.log(req.query);
  const query = name?.trim().length > 0 ? { name: new RegExp(name, "i") } : {};
  const total = await Product.countDocuments();
  const products = await Product.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const nextProducts = await Product.find(query)
    .skip(page * limit)
    .limit(parseInt(limit))
    .countDocuments();
  const hasNext = nextProducts > 0;
  res.json({ products, total, hasNext });
});

router.post("/", verifyToken, async (req, res) => {
  const { name, price, stock } = req.body;
  const newProduct = new Product({ name, price, stock });
  await newProduct.save();
  res.json(newProduct);
});

router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, price, stock } = req.body;
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { name, price, stock },
    { new: true },
  );
  res.json(updatedProduct);
});

router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.json({ message: "Product deleted" });
});

router.post("/:id/increase-stock", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  const log = new Log({
    message: `Increased stock of ${product.name} by ${quantity}`,
    type: "inventory",
    user: req.userId,
    products_involved: [product._id],
  });
  await log.save();
  await product.increaseStock(quantity);
  res.json(product);
});

router.post("/:id/decrease-stock", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  const log = new Log({
    message: `Decreased stock of ${product.name} by ${quantity}`,
    type: "inventory",
    user: req.userId,
    products_involved: [product._id],
  });
  await log.save();
  await product.decreaseStock(quantity);
  res.json(product);
});

router.post("/:id/update-stocks", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  const log = new Log({
    message: `Updated stock of ${product.name} to ${quantity}`,
    type: "inventory",
    user: req.userId,
    products_involved: [product._id],
  });
  await log.save();
  await product.updateStocks(quantity);
  res.json(product);
});

export default router;
