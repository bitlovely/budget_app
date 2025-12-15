import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

function dbError(message = "Database unavailable") {
  return NextResponse.json(
    { error: message },
    { status: 503 } // Service Unavailable
  );
}

export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) return dbError();

  try {
    const action = req.nextUrl.searchParams.get("action");

    if (action === "income") {
      const [rows]: any = await db.query(
        "SELECT amount FROM income LIMIT 1"
      );
      return NextResponse.json(rows[0]);
    }

    if (action === "envelopes") {
      const [rows] = await db.query("SELECT * FROM envelopes");
      return NextResponse.json(rows);
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (err) {
    console.error("❌ DB GET error:", err);
    return dbError();
  }
}

export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return dbError();

  try {
    const body = await req.json();

    if (body.action === "addIncome") {
      await db.query(
        "UPDATE income SET amount = amount + ?",
        [body.amount]
      );
      return NextResponse.json({ ok: true });
    }

    if (body.action === "addEnvelope") {
      await db.query(
        "INSERT INTO envelopes (name, balance) VALUES (?, 0)",
        [body.name]
      );
      return NextResponse.json({ ok: true });
    }

    if (body.action === "move") {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        await conn.query(
          "UPDATE income SET amount = amount - ?",
          [body.amount]
        );
        await conn.query(
          "UPDATE envelopes SET balance = balance + ? WHERE id = ?",
          [body.amount, body.envelopeId]
        );
        await conn.commit();
        return NextResponse.json({ ok: true });
      } catch (err) {
        await conn.rollback();
        throw err;
      } finally {
        conn.release();
      }
    }

    if (body.action === "spend") {
      await db.query(
        "UPDATE envelopes SET balance = balance - ? WHERE id = ?",
        [body.amount, body.envelopeId]
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (err) {
    console.error("❌ DB POST error:", err);
    return dbError();
  }
}
