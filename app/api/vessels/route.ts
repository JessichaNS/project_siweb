import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.POSTGRES_URL!);
    const vessels = await sql`SELECT * FROM vessels`;

    return NextResponse.json(vessels);
  } catch (err) {
    return NextResponse.json({ error: String(err) });
  }
}