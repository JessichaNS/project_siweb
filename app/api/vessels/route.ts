import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const search = request.nextUrl.searchParams.get('search') || '';
    const page = Number(request.nextUrl.searchParams.get('page') || '1');
    const limit = Number(request.nextUrl.searchParams.get('limit') || '4');
    const offset = (page - 1) * limit;

    const vessels = await sql`
      SELECT
        id,
        nama_kapal AS name,
        tipe_kapal AS status,
        'Indonesia' AS location,
        80 AS fuel
      FROM vessels
      WHERE nama_kapal ILIKE ${'%' + search + '%'}
      ORDER BY id ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int AS total
      FROM vessels
      WHERE nama_kapal ILIKE ${'%' + search + '%'}
    `;

    return NextResponse.json({
      vessels,
      total: countResult[0].total,
      page,
      totalPages: Math.ceil(countResult[0].total / limit),
    });
  } catch (err) {
    return NextResponse.json({
      vessels: [],
      total: 0,
      page: 1,
      totalPages: 1,
      error: String(err),
    });
  }
}
export async function PUT(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();

    await sql`
      UPDATE vessels
      SET
        nama_kapal = ${body.name},
        tipe_kapal = ${body.status}
      WHERE id = ${Number(body.id)}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: String(err),
    });
  }
}