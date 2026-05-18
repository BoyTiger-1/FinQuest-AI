import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { xpToLevel } from "@/lib/gamification";
import { decodeFirebaseToken } from "@/lib/firebase-verify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    const firebaseUser = decodeFirebaseToken(idToken);
    if (!firebaseUser) {
      return NextResponse.json({ error: "Invalid or expired session. Please sign in again." }, { status: 401 });
    }

    let user = await db.user.findUnique({ where: { email: firebaseUser.email } });
    if (!user) {
      // Firebase user exists but Prisma record doesn't — create it silently
      const emailName = firebaseUser.email.split("@")[0];
      user = await db.user.create({
        data: {
          email: firebaseUser.email,
          name: emailName,
          password: `firebase:${firebaseUser.uid}`,
          lastActive: new Date(),
        },
      });
    }

    // Update streak
    const now = new Date();
    const last = user.lastActive;
    let streak = user.streak;
    if (last) {
      const diff = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= 1 && diff < 2) streak += 1;
      else if (diff >= 2) streak = 1;
    } else {
      streak = 1;
    }
    await db.user.update({ where: { id: user.id }, data: { lastActive: now, streak } });

    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, xp: user.xp, level: xpToLevel(user.xp), streak, virtualCash: user.virtualCash },
    });
    response.cookies.set("auth-token", token, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (err) {
    console.error("[login]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
