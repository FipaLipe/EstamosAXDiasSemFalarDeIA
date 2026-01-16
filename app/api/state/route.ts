import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const state = await db.collection("state").findOne({});

  return Response.json({
    state,
  });
}
