import { getServerSession } from "next-auth";
import { meet_v2 } from "googleapis";
import { authOptions } from "@/lib/auth";
import { getConferenceParticipants, getParticipantSessions } from "@/lib/meet";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || !session.accessToken) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const conferenceRecordName = `conferenceRecords/${id}`;
    const participants = await getConferenceParticipants(
      session.accessToken,
      conferenceRecordName,
    );

    const reportData = await Promise.all(
      participants.map(async (participant: meet_v2.Schema$Participant) => {
        if (!participant.name) return null;
        const sessions = await getParticipantSessions(
          session.accessToken!,
          participant.name,
        );
        return {
          participant,
          sessions,
        };
      }),
    );

    // Filter out nulls
    const validReportData = reportData.filter((item) => item !== null);

    return NextResponse.json(validReportData);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
