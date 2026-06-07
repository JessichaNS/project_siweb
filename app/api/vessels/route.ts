import postgres from 'postgres';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSql() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL atau POSTGRES_URL belum diisi di .env.local');
  }

  const isLocalDatabase =
    databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

  return postgres(databaseUrl, {
    ssl: isLocalDatabase ? false : 'require',
    max: 1,
  });
}

export async function GET(request: NextRequest) {
  const sql = getSql();

  try {
    const search = request.nextUrl.searchParams.get('search') || '';
    const page = Number(request.nextUrl.searchParams.get('page') || '1');
    const limit = Number(request.nextUrl.searchParams.get('limit') || '4');
    const offset = (page - 1) * limit;

    const vessels = await sql`
      SELECT
        id,
        nama_kapal AS name,
        tipe_kapal AS type,
        status_kapal AS status,
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

    const total = Number(countResult[0]?.total || 0);

    return NextResponse.json({
      vessels,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    return NextResponse.json(
      {
        vessels: [],
        total: 0,
        page: 1,
        totalPages: 1,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  } finally {
    await sql.end();
  }
}

export async function POST(request: NextRequest) {
  const sql = getSql();

  try {
    const body = await request.json();

    await sql`
  INSERT INTO vessels (
    nama_kapal,
    tipe_kapal,
    status_kapal
  )
  VALUES (
    ${body.name},
    ${body.type || 'cargo', 'passenger', 'tanker', 'container'},
    ${body.status || 'In Port'}
  )
`;

    return NextResponse.json({
      success: true,
      message: 'Vessel berhasil ditambahkan',
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  } finally {
    await sql.end();
  }
}

export async function PUT(request: NextRequest) {
  const sql = getSql();

  try {
    const body = await request.json();

    await sql`
  INSERT INTO vessels (
    nama_kapal,
    tipe_kapal,
    status_kapal
  )
  VALUES (
    ${body.name},
    ${body.type || 'cargo', 'passenger', 'tanker', 'container'},
    ${body.status || 'In Port'}
  )
`; 

    return NextResponse.json({
      success: true,
      message: 'Vessel berhasil diupdate',
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  } finally {
    await sql.end();
  }
}