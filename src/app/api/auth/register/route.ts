import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { Wallet } from "@/models/Wallet";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ message: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: "User already exists" }),
        { 
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    }); 

    await Wallet.create({
            userId: user._id,
            balance: 0,
        });

    return new Response(
        JSON.stringify({
            _id: user._id,
            name: user.name,
            email: user.email,
        }),
        {
            status: 201,
            headers: { "Content-Type": "application/json" },
        }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: "User already exists" }),
      { 
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}