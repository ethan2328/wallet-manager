import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/getUser";
import { Transaction } from "@/models/Transaction";

export async function GET() {
    await connectDB();
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const transactions = await Transaction.find({
      userId: user._id,
    }).sort({ createdAt: -1 });

    return new Response(JSON.stringify(transactions), {
      status: 200,
    });
  } catch (error: any) {
        console.error("ERROR:", error);

        return new Response(
            JSON.stringify({ message: error.message || "Server error" }),
            { status: 500 }
        );
    }
}