import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getConferenceRecords } from "@/lib/meet";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const records = await getConferenceRecords(session.accessToken);
    return NextResponse.json(records);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
