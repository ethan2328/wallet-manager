import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/getUser";
import { User } from "@/models/User";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";
import { validateAmount } from "@/lib/validators";
import {success, fail} from "@/lib/response";

export async function POST(req: Request) {
  await connectDB();

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const sender = await getCurrentUser();
    if (!sender) {
      await session.abortTransaction();
      session.endSession();
      return fail("Unauthorized", 401);
    }

    const { email, amount } = await req.json();

    const validationError = validateAmount(amount);
    if (!email) {
      await session.abortTransaction();
      session.endSession();
      return fail("Email is required", 400);
    }

    if (validationError) {
      await session.abortTransaction();
      session.endSession();
      return fail(validationError, 400);
    }

    const receiver = await User.findOne({ email }).session(session);

    if (!receiver) {
      await session.abortTransaction();
      session.endSession();
      return fail("Receiver not found", 404);
    }

    if (receiver._id.toString() === sender._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return fail("Cannot transfer to yourself", 400);
    }

    const senderWallet = await Wallet.findOneAndUpdate(
      {
        userId: sender._id,
        balance: { $gte: amount },
      },
      { $inc: { balance: -amount } },
      { new: true, session }
    );

    if (!senderWallet) {
      await session.abortTransaction();
      session.endSession();
      return fail("Insufficient balance", 400);
    }

    const receiverWallet = await Wallet.findOneAndUpdate(
      { userId: receiver._id },
      { $inc: { balance: amount } },
      { new: true, session }
    );

    if (!receiverWallet) {
      await session.abortTransaction();
      session.endSession();
      return fail("Receiver wallet not found", 404);
    }

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

    return success({ message: "Transfer successful" }, 200);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return fail("Transfer failed", 500);
  }
}