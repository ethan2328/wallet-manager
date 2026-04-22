import { getCurrentUser } from "@/lib/getUser";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return new Response(
      JSON.stringify({ message: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(JSON.stringify(user), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}