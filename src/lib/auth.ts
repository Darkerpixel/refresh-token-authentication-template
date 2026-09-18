import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { verifyAccessToken, signAccessToken } from "@/lib/jwt";

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  const accessToken = await signAccessToken(userId);
  const accessTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 15);

  const cookiesStore = await cookies();

  cookiesStore.set("session_token", token, {
    httpOnly: true,
    path: "/",
    expires: expiresAt,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  cookiesStore.set("access_token", accessToken, {
    httpOnly: true,
    path: "/",
    expires: accessTokenExpiresAt,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export async function createAccessToken(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
  });

  if (!session) {
    console.log("session token not found in db");
    return null;
  }
  if (session.expiresAt < new Date()) {
    console.log("session token expired");
    return null;
  }

  const newAccessToken = await signAccessToken(session.userId);

  const cookiesStore = await cookies();
  cookiesStore.set("access_token", newAccessToken, {
    httpOnly: true,
    path: "/",
    expires: new Date(Date.now() + 1000 * 60 * 15),
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return newAccessToken;
}

export async function getCurrentUser() {
  const cookiesStore = await cookies();
  let accessToken = cookiesStore.get("access_token")?.value;

  if (!accessToken) {
    const sessionToken = cookiesStore.get("session_token")?.value;

    if (!sessionToken) {
      console.log("no access and session token provided");
      return null;
    }
    const refreshed = await createAccessToken(sessionToken);

    if (!refreshed) {
      console.log("could not create accessToken");
      return null;
    }
    accessToken = refreshed;
  }

  const payload = await verifyAccessToken(accessToken);

  if (!payload) {
    console.log("");
    return;
  }

  return payload.userId;
}
