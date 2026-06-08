import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  const vessels = await sql`
    SELECT
      id,
      nama_kapal AS name,
      tipe_kapal AS type,
      status_kapal AS status,
      'Indonesia' AS location,
      80 AS fuel
    FROM vessels
    ORDER BY id ASC
  `;

  return NextResponse.json({ vessels });
}