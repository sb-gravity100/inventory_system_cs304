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
        price_at_sale: {
          type: Number,
          default: null,
        },
      },
    ],
    payment_method: {
      type: String,
      enum: ["cash", "card", "other"],
      default: "cash",
    },
    discount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
