import { Router } from "express";
import { verifyToken } from "../middlewares.js";
import Product from "../Models/Product.js";
import Log from "../Models/Log.js";

const router = Router();

const isManagerOrAdmin = (req, res, next) => {
  if (req.user.role !== "manager" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// GET /products — paginated, filterable; active only by default
router.get("/", verifyToken, async (req, res) => {
  const { name, category, page = 1, limit = 10, includeArchived } = req.query;
  const query = { isActive: includeArchived === "true" ? { $in: [true, false] } : true };
  if (name?.trim().length > 0) query.name = new RegExp(name.trim(), "i");
  if (category) query.category = category;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category", "name color")
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const hasNext = page * limit < total;
  res.json({ products, total, hasNext });
});

// POST /products — manager/admin only
router.post("/", verifyToken, isManagerOrAdmin, async (req, res) => {
  const { name, price, stock, sku, costPrice, category, imageUrl } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "Product name is required" });
  }
  if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
    return res.status(400).json({ message: "Price must be a positive number" });
  }
  if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
    return res.status(400).json({ message: "Stock must be a non-negative number" });
  }
  try {
    const newProduct = new Product({
      name: name.trim(),
      price: Number(price),
      stock: Number(stock),
      sku: sku?.trim() || null,
      costPrice: costPrice ? Number(costPrice) : 0,
      category: category || null,
      imageUrl: imageUrl?.trim() || null,
    });
    await newProduct.save();
    await Log.create({
      event: "PRODUCT_CREATED",
      message: `Product "${newProduct.name}" created`,
      actor: req.user.id,
    });
    res.status(201).json(newProduct);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A product with that SKU already exists" });
    }
    throw err;
  }
});

// PUT /products/:id — manager/admin only
router.put("/:id", verifyToken, isManagerOrAdmin, async (req, res) => {
  const { name, price, stock, sku, costPrice, category, imageUrl, low_stock_threshold } = req.body;
  const update = {};
  if (name !== undefined) update.name = name.trim();
  if (price !== undefined) update.price = Number(price);
  if (stock !== undefined) update.stock = Number(stock);
  if (sku !== undefined) update.sku = sku?.trim() || null;
  if (costPrice !== undefined) update.costPrice = Number(costPrice);
  if (category !== undefined) update.category = category || null;
  if (imageUrl !== undefined) update.imageUrl = imageUrl?.trim() || null;
  if (low_stock_threshold !== undefined) update.low_stock_threshold = Number(low_stock_threshold);

  try {
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true }).populate("category", "name color");
    if (!product) return res.status(404).json({ message: "Product not found" });
    await Log.create({
      event: "PRODUCT_UPDATED",
      message: `Product "${product.name}" updated`,
      actor: req.user.id,
    });
    res.json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A product with that SKU already exists" });
    }
    throw err;
  }
});

// PATCH /products/:id/archive — soft delete (manager/admin only)
router.patch("/:id/archive", verifyToken, isManagerOrAdmin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!product) return res.status(404).json({ message: "Product not found" });
  await Log.create({
    event: "PRODUCT_ARCHIVED",
    message: `Product "${product.name}" archived`,
    actor: req.user.id,
  });
  res.json(product);
});

// PATCH /products/:id/restore — restore archived product (manager/admin only)
router.patch("/:id/restore", verifyToken, isManagerOrAdmin, async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true },
  );
  if (!product) return res.status(404).json({ message: "Product not found" });
  await Log.create({
    event: "PRODUCT_RESTORED",
    message: `Product "${product.name}" restored`,
    actor: req.user.id,
  });
  res.json(product);
});

router.post("/:id/increase-stock", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
    return res.status(400).json({ message: "Quantity must be a positive integer" });
  }
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  await Log.create({
    event: "STOCK_INCREASE",
    message: `Increased stock of ${product.name} by ${quantity}`,
    actor: req.user.id,
    products_involved: [product._id],
  });
  await product.increaseStock(quantity);
  res.json(product);
});

router.post("/:id/decrease-stock", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
    return res.status(400).json({ message: "Quantity must be a positive integer" });
  }
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  await Log.create({
    event: "STOCK_DECREASE",
    message: `Decreased stock of ${product.name} by ${quantity}`,
    actor: req.user.id,
    products_involved: [product._id],
  });
  await product.decreaseStock(quantity);
  res.json(product);
});

router.post("/:id/update-stocks", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (quantity === undefined || isNaN(Number(quantity)) || Number(quantity) < 0 || !Number.isInteger(Number(quantity))) {
    return res.status(400).json({ message: "Quantity must be a non-negative integer" });
  }
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  await Log.create({
    event: "STOCK_SET",
    message: `Updated stock of ${product.name} to ${quantity}`,
    actor: req.user.id,
    products_involved: [product._id],
  });
  await product.updateStocks(quantity);
  res.json(product);
});

export default router;
