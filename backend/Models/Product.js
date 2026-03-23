// mongoose product model
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
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

const Product = mongoose.model("Product", productSchema);

export default Product;