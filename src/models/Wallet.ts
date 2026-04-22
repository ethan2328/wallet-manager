import mongoose, { Schema, models, model } from "mongoose";

const WalletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one wallet per user
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Wallet = models.Wallet || model("Wallet", WalletSchema);