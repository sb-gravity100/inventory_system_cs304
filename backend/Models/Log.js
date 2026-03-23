import mongoose from "mongoose";

const LOG_EVENTS = [
  "USER_LOGIN",
  "USER_LOGOUT",
  "USER_CREATED",
  "USER_UPDATED",
  "USER_DELETED",
  "USER_PASSWORD_CHANGED",
  "PRODUCT_CREATED",
  "PRODUCT_UPDATED",
  "PRODUCT_DELETED",
  "STOCK_INCREASE",
  "STOCK_DECREASE",
  "STOCK_SET",
  "STOCK_SOLD",
  "TRANSACTION_CREATED",
  "TRANSACTION_UPDATED",
  "TRANSACTION_COMPLETED",
  "TRANSACTION_CANCELLED",
];

const logSchema = new mongoose.Schema({
  event: {
    type: String,
    enum: LOG_EVENTS,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  target_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: false,
  },
  products_involved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
  ],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export { LOG_EVENTS };

const Log = mongoose.model("Log", logSchema);

export default Log;
