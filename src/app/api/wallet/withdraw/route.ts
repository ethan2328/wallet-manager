import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/getUser";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";
import { validateAmount } from "@/lib/validators";
import {success, fail} from "@/lib/response";

export async function POST(req: Request) {
  await connectDB();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return fail("Unauthorized", 401);
    }

  const { amount } = await req.json();

  const validationError = validateAmount(amount);
  if (validationError) {
    return fail(validationError, 400);
  }


    const wallet = await Wallet.findOne({ userId: user._id });

    if (!wallet) {
    return fail("Wallet not found", 404);

    }
    if (wallet.balance < amount) {
      return new Response(
        JSON.stringify({ message: "Insufficient balance" }),
        { status: 400 }
      );
    }

    wallet.balance -= amount;
    await wallet.save();

    await Transaction.create({
      userId: user._id,
      type: "withdraw",
      amount,
    });

    return success({ balance: wallet.balance }, 200);
  } catch (error: any) {
    return fail(error.message || "Server error", 500);
  }
}