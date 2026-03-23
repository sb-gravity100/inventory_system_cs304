import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
