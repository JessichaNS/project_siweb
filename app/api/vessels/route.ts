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
      SELECT *
      FROM vessels
      WHERE name ILIKE ${'%' + search + '%'}
      ORDER BY id ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int AS total
      FROM vessels
      WHERE name ILIKE ${'%' + search + '%'}
    `;

    return NextResponse.json({
      vessels,
      total: countResult[0].total,
      page,
      totalPages: Math.ceil(countResult[0].total / limit),
    });
  } catch (err) {
    return NextResponse.json({
      error: String(err),
    });
  }
}