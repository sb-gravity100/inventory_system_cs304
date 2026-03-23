import { Router } from "express";
import { verifyToken } from "../middlewares.js";
import Category from "../Models/Category.js";

const router = Router();

const isManagerOrAdmin = (req, res, next) => {
  if (req.user.role !== "manager" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// GET /categories — all authenticated users can read
router.get("/", verifyToken, async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

// POST /categories — manager/admin only
router.post("/", verifyToken, isManagerOrAdmin, async (req, res) => {
  const { name, color } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: "Category name is required" });
  }
  try {
    const category = await Category.create({ name: name.trim(), color: color || null });
    res.status(201).json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A category with that name already exists" });
    }
    throw err;
  }
});

// PUT /categories/:id — manager/admin only
router.put("/:id", verifyToken, isManagerOrAdmin, async (req, res) => {
  const { name, color } = req.body;
  const update = {};
  if (name !== undefined) update.name = name.trim();
  if (color !== undefined) update.color = color;

  try {
    const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A category with that name already exists" });
    }
    throw err;
  }
});

// DELETE /categories/:id — manager/admin only
router.delete("/:id", verifyToken, isManagerOrAdmin, async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  res.json({ message: "Category deleted" });
});

export default router;
