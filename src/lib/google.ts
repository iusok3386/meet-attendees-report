import { google } from "googleapis";

export const getMeetClient = (accessToken: string) => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.meet({ version: "v2", auth });
};
