import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);

  const vessels = await sql`
    SELECT
      id,
      nama_kapal   AS name,
      tipe_kapal   AS type,
      status_kapal AS status,
      COALESCE(lokasi, 'Indonesia') AS location,
      80 AS fuel
    FROM vessels
    ORDER BY id ASC
  `;

  return NextResponse.json({ vessels });
}

// PUT — update status kapal dari map page
export async function PUT(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  try {
    const body = await request.json();
    if (!body.id || !body.status) {
      return NextResponse.json({ success: false, error: 'ID dan status wajib diisi' }, { status: 400 });
    }
    await sql`
      UPDATE vessels SET status_kapal = ${body.status} WHERE id = ${body.id}
    `;
    return NextResponse.json({ success: true, message: 'Status berhasil diupdate' });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}