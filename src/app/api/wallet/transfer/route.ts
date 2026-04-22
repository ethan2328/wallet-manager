import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/getUser";
import { User } from "@/models/User";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";

export async function POST(req: Request) {
    await connectDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    const sender = await getCurrentUser();
    if (!sender) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const { email, amount } = await req.json(); // ✅ USE amount (standardize)

    // ✅ Validation
    if (
      typeof amount !== "number" ||
      isNaN(amount) ||
      amount <= 0 ||
      amount > 1000000 ||
      !email
    ) {
      return new Response(JSON.stringify({ message: "Invalid input" }), { status: 400 });
    }

    // ✅ Find receiver
    const receiver = await User.findOne({ email }).session(session);

    if (!receiver) {
      return new Response(JSON.stringify({ message: "Receiver not found" }), { status: 404 });
    }

    if (receiver._id.toString() === sender._id.toString()) {
      return new Response(JSON.stringify({ message: "Cannot transfer to yourself" }), { status: 400 });
    }

    // ✅ Get wallets (IMPORTANT FIX)
    const senderWallet = await Wallet.findOne({ userId: sender._id }).session(session);
    const receiverWallet = await Wallet.findOne({ userId: receiver._id }).session(session);

    if (!senderWallet || !receiverWallet) {
      return new Response(JSON.stringify({ message: "Wallet not found" }), { status: 404 });
    }

    if (senderWallet.balance < amount) {
      return new Response(JSON.stringify({ message: "Insufficient balance" }), { status: 400 });
    }

    // ✅ Update balances
    senderWallet.balance -= amount;
    await senderWallet.save({ session });

    receiverWallet.balance += amount;
    await receiverWallet.save({ session });

    // ✅ Transactions
    await Transaction.create(
      [
        {
          userId: sender._id,
          type: "sender-transfer-out",
          amount,
        },
        {
          userId: receiver._id,
          type: "receiver-transfer-in",
          amount,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return new Response(JSON.stringify({ message: "Transfer successful" }), {
      status: 200,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return new Response(
      JSON.stringify({ message: error instanceof Error ? error.message : "Transfer failed" }),
      { status: 500 }
    );
  }
}