import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { decodeFirebaseToken } from "@/lib/firebase-verify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, name } = body;

    if (!idToken || !name?.trim()) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const firebaseUser = decodeFirebaseToken(idToken);
    if (!firebaseUser) {
      return NextResponse.json({ error: "Invalid or expired session. Please try again." }, { status: 401 });
    }

    // If user already exists, sign them in
    const exists = await db.user.findUnique({ where: { email: firebaseUser.email } });
    if (exists) {
      const token = signToken({ userId: exists.id, email: exists.email, name: exists.name });
      const response = NextResponse.json({ user: { id: exists.id, email: exists.email, name: exists.name } });
      response.cookies.set("auth-token", token, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
      return response;
    }

    const user = await db.user.create({
      data: {
        email: firebaseUser.email,
        name: name.trim(),
        password: `firebase:${firebaseUser.uid}`,
        lastActive: new Date(),
      },
    });

    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, xp: 0, level: 1 } });
    response.cookies.set("auth-token", token, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (err: any) {
    console.error("[register]", err?.message ?? err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
