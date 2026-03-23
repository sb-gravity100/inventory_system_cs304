import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
    },
    costPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
    },
    low_stock_threshold: {
      type: Number,
      default: 10,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    methods: {
      increaseStock(quantity) {
        this.stock += quantity;
        return this.save();
      },
      decreaseStock(quantity) {
        this.stock -= quantity;
        return this.save();
      },
      updateStocks(newStock) {
        this.stock = newStock;
        return this.save();
      },
    },
  },
);

// Sparse unique index: allows multiple null SKUs, but unique across non-null values
productSchema.index({ sku: 1 }, { unique: true, sparse: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
