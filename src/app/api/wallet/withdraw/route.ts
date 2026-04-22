import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/getUser";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";

export async function POST(req: Request) {
  await connectDB();

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { amount } = await req.json();

        if (
            typeof amount !== "number" ||
            isNaN(amount) ||
            amount <= 0 ||
            amount > 1000000
        ) {
        return new Response(
            JSON.stringify({ message: "Invalid amount" }),
            { status: 400 }
            );
        }

    const wallet = await Wallet.findOne({ userId: user._id });

    if (!wallet) {
    return new Response(
        JSON.stringify({ message: "Wallet not found" }),
        { status: 404 }
    );
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

    return new Response(
      JSON.stringify({ balance: wallet.balance }),
      { status: 200 }
    );
  } catch (error: any) {
        console.error("ERROR:", error);

        return new Response(
            JSON.stringify({ message: error.message || "Server error" }),
            { status: 500 }
        );
    }
}