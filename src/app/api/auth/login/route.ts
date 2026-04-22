import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return new Response(
        JSON.stringify({ message: "Invalid credentials" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return new Response(
        JSON.stringify({ message: "Invalid credentials" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user._id,
      email: user.email,
    });

    // Set cookie
    const response = new Response(
      JSON.stringify({ message: "Login successful" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

    response.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=604800`
    );

    return response;
  } catch (error: any) {
    console.error(error);

    return new Response(
      JSON.stringify({ message: "Server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}