import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:8080/api/auth/google/callback";

export const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  CALLBACK_URL
);

export function getGoogleAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "select_account",
  });
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export async function getGoogleUserInfo(code: string): Promise<GoogleUserInfo> {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  const data = await res.json() as any;
  return {
    id: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}
