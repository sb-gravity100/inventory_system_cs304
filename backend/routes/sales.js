import { Router } from "express";
import { verifyToken } from "../middlewares.js";
import Transaction from "../Models/Transaction.js";
import Product from "../Models/Product.js";
import Log from "../Models/Log.js";
const router = Router();

router.post("/transaction", verifyToken, async (req, res) => {
  const { products = [], discount = 0, notes = "" } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ message: "Products must be an array" });
  }
  console.info("[sales] POST /transaction seller:", req.user.id, "items:", products.length, "discount:", discount);
  const tr = new Transaction({
    seller: req.user.id,
    products,
    discount,
    notes,
  });
  await Log.create({
    event: "TRANSACTION_CREATED",
    message: `Transaction created with ${products.length} products`,
    actor: req.user.id,
    transaction_id: tr.id,
    products_involved: products.map((p) => p.product),
  });
  await tr.save();
  res.json(tr);
});

router.post("/transaction-update-products", verifyToken, async (req, res) => {
  const { transaction, products = [] } = req.body;
  if (!transaction || !transaction.id) {
    return res.status(400).json({ message: "Transaction is required" });
  }
  if (!Array.isArray(products)) {
    return res.status(400).json({ message: "Products must be an array" });
  }
  const isOwner = transaction.seller._id.toString() === req.user.id;
  const isManagerOrAdmin = req.user.role === "manager" || req.user.role === "admin";
  if (!isOwner && !isManagerOrAdmin) {
    return res.status(403).json({ message: "Forbidden: Not the seller" });
  }
  const tr = await Transaction.findById(transaction.id);
  if (!tr) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  tr.products = products;
  await tr.save();
  await Log.create({
    event: "TRANSACTION_UPDATED",
    message: `Transaction updated with ${products.length} products`,
    actor: req.user.id,
    products_involved: products.map((p) => p.product),
    transaction_id: tr._id,
  });
  res.json(tr);
});

router.post("/transaction-finalize", verifyToken, async (req, res) => {
  const { transaction } = req.body;
  if (!transaction || !transaction.id) {
    return res.status(400).json({ message: "Transaction is required" });
  }
  const isOwner = transaction.seller._id.toString() === req.user.id;
  const isManagerOrAdmin = req.user.role === "manager" || req.user.role === "admin";
  if (!isOwner && !isManagerOrAdmin) {
    return res.status(403).json({ message: "Forbidden: Not the seller" });
  }
  const tr = await Transaction.findById(transaction.id);
  if (!tr) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  tr.status = "completed";
  await tr.save();
  await Log.create({
    event: "TRANSACTION_COMPLETED",
    message: `Transaction completed`,
    actor: req.user.id,
    transaction_id: tr._id,
  });
  res.json(tr);
});

router.get("/transactions", verifyToken, async (req, res) => {
  // if staff only return transactions where req.user._id is the seller. if manager or admin return all transactions
  let transactions;
  if (req.user.role === "staff") {
    transactions = await Transaction.find({ seller: req.user._id })
      .populate("seller", "username")
      .populate("products.product", "name price");
  } else {
    transactions = await Transaction.find()
      .populate("seller", "username")
      .populate("products.product", "name price");
  }
  res.json(transactions);
});

router.get("/transaction/:id", verifyToken, async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate("seller", "username")
    .populate("products.product", "name price");

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  res.json(transaction);
});

router.get("/transaction-logs", verifyToken, async (req, res) => {
  let logs;
  const txEvents = ["TRANSACTION_CREATED", "TRANSACTION_UPDATED", "TRANSACTION_COMPLETED", "TRANSACTION_CANCELLED"];
  if (req.user.role === "staff") {
    logs = await Log.find({ actor: req.user._id, event: { $in: txEvents } })
      .populate("actor", "username")
      .populate("products_involved", "name");
  } else {
    logs = await Log.find({ event: { $in: txEvents } })
      .populate("actor", "username")
      .populate("products_involved", "name");
  }
  res.json(logs);
});

router.post("/transaction-cancel", verifyToken, async (req, res) => {
  const { transactionId } = req.body;
  if (!transactionId) {
    return res.status(400).json({ message: "transactionId is required" });
  }
  const tr = await Transaction.findById(transactionId);
  if (!tr) return res.status(404).json({ message: "Transaction not found" });
  const isOwner = tr.seller.toString() === req.user.id;
  const isManagerOrAdmin = req.user.role === "manager" || req.user.role === "admin";
  if (!isOwner && !isManagerOrAdmin)
    return res.status(403).json({ message: "Forbidden: Not the seller" });
  if (tr.status !== "pending")
    return res.status(400).json({ message: "Transaction already finalized" });
  tr.status = "cancelled";
  await tr.save();
  await Log.create({
    event: "TRANSACTION_CANCELLED",
    message: `Transaction cancelled`,
    actor: req.user.id,
    transaction_id: tr._id,
  });
  res.json(tr);
});

router.get("/stats", verifyToken, async (req, res) => {
  // get total items sold, total stocks and todays sales
  const totalItemsSold = await Transaction.aggregate([
    { $match: { status: "completed" } },
    { $unwind: "$products" },
    { $group: { _id: null, total: { $sum: "$products.quantity" } } },
  ]);
  const totalStocks = await Product.aggregate([
    { $group: { _id: null, total: { $sum: "$stock" } } },
  ]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todaysSales = await Transaction.find({
    status: "completed",
    createdAt: { $gte: today, $lt: tomorrow },
  }).populate("products.product", "price");
  const sales = todaysSales.reduce((sum, tr) => {
    const trTotal = tr.products.reduce((trSum, item) => {
      return trSum + item.quantity * (item.product.price || 0);
    }, 0);
    return sum + trTotal;
  }, 0);
  res.json({
    totalItemsSold: totalItemsSold[0]?.total || 0,
    totalStocks: totalStocks[0]?.total || 0,
    todaysSales: sales,
  });
});


export default router;