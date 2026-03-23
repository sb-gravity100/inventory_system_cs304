import { Router } from "express";
import { verifyToken } from "../middlewares.js";
import Transaction from "../Models/Transaction.js";
import Product from "../Models/Product.js";
import Log from "../Models/Log.js";
const router = Router();

router.post("/transaction", verifyToken, async (req, res) => {
  const { products = [] } = req.body;
  console.log(req.user);
  const tr = new Transaction({
    seller: req.user.id,
    products,
  });
  const log = new Log({
    message: `Transaction created with ${products.length} products`,
    type: "transaction",
    user: req.user.id,
    transaction_id: tr.id,
    products_involved: products.map((p) => p.product),
  });
  await log.save();
  await tr.save();
  res.json(tr);
});

router.post("/transaction-update-products", verifyToken, async (req, res) => {
  const { transaction, products = [] } = req.body;
  console.log(transaction.seller._id, req.user.id);
  if (transaction.seller._id !== req.user.id) {
    return res.status(403).json({ message: "Forbidden: Not the seller" });
  }
  const tr = await Transaction.findById(transaction.id);
  if (!tr) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  tr.products = products;
  await tr.save();
  const log = new Log({
    message: `Transaction updated with ${products.length} products`,
    type: "transaction",
    user: req.user._id,
    products_involved: products.map((p) => p.product),
    transaction_id: tr._id,
  });
  await log.save();
  res.json(tr);
});

router.post("/transaction-finalize", verifyToken, async (req, res) => {
  const { transaction } = req.body;
  if (transaction.seller._id !== req.user.id) {
    return res.status(403).json({ message: "Forbidden: Not the seller" });
  }
  const tr = await Transaction.findById(transaction.id);
  if (!tr) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  tr.status = "completed";
  await tr.save();
  const log = new Log({
    message: `Transaction completed`,
    type: "transaction",
    user: req.user._id,
    transaction_id: tr._id,
  });
  await log.save();
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
  if (req.user.role === "staff") {
    logs = await Log.find({ user: req.user._id, type: "transaction" })
      .populate("user", "username")
      .populate("products_involved", "name");
  } else {
    logs = await Log.find({ type: "transaction" })
      .populate("user", "username")
      .populate("products_involved", "name");
  }
  res.json(logs);
});

router.post("/transaction-cancel", verifyToken, async (req, res) => {
  const { transactionId } = req.body;
  const tr = await Transaction.findById(transactionId);
  if (!tr) return res.status(404).json({ message: "Transaction not found" });
  if (tr.seller.toString() !== req.user.id)
    return res.status(403).json({ message: "Forbidden: Not the seller" });
  if (tr.status !== "pending")
    return res.status(400).json({ message: "Transaction already finalized" });
  tr.status = "cancelled";
  await tr.save();
  const log = new Log({
    message: `Transaction cancelled`,
    type: "transaction",
    user: req.user.id,
    transaction_id: tr._id,
  });
  await log.save();
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