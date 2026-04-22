import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { connectDB } from "./mongodb";
import { User } from "@/models/User";

export const getCurrentUser = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const decoded: any = verifyToken(token);

    await connectDB();

    const user = await User.findById(decoded.userId).select("-password");

    return user;
  } catch (error) {
    return null;
  }
};