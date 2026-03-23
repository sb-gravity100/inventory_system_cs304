import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: false,
  },
  type: {
    type: String,
    enum: ["transaction", "inventory", "manager_request", "user_action"],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  products_involved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Log = mongoose.model("Log", logSchema);

export default Log;
