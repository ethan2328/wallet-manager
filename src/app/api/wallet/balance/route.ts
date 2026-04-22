import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/getUser";
import { Wallet } from "@/models/Wallet";

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

    const wallet = await Wallet.findOne({ userId: user._id });

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