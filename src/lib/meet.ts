import { getMeetClient } from './google';

export async function getConferenceRecords(accessToken: string) {
  const meet = getMeetClient(accessToken);
  const response = await meet.conferenceRecords.list({
    // pageSize: 10,
  });
  return response.data.conferenceRecords || [];
}

export async function getConferenceParticipants(accessToken: string, conferenceRecord: string) {
    const meet = getMeetClient(accessToken);
    const response = await meet.conferenceRecords.participants.list({
        parent: conferenceRecord
    });
    return response.data.participants || [];
}

export async function getParticipantSessions(accessToken: string, participant: string) {
    const meet = getMeetClient(accessToken);
    const response = await meet.conferenceRecords.participants.participantSessions.list({
        parent: participant
    });
    return response.data.participantSessions || [];
}
