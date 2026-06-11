import postgres from 'postgres';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ── Singleton connection — dibuat sekali, dipakai ulang ──
let _sql: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (_sql) return _sql;
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL belum diisi');
  const isLocal = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
  _sql = postgres(databaseUrl, {
    ssl: isLocal ? false : 'require',
    max: 5,          // pool 5 koneksi, tidak perlu buka-tutup setiap request
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return _sql;
}

// ─── GET ─────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const sql = getSql();
  try {
    const search = request.nextUrl.searchParams.get('search') || '';
    const page   = Number(request.nextUrl.searchParams.get('page')  || '1');
    const limit  = Number(request.nextUrl.searchParams.get('limit') || '4');
    const offset = (page - 1) * limit;

    // Jalankan query list dan count paralel
    const [vessels, countResult] = await Promise.all([
      sql`
        SELECT
          v.id,
          v.nama_kapal                    AS name,
          v.tipe_kapal                    AS type,
          v.status_kapal                  AS status,
          COALESCE(v.lokasi, 'Indonesia') AS location,
          v.kapasitas_ton,
          COALESCE(
            SUM(p.berat) FILTER (WHERE p.status IN ('Diproses','Dikirim','Pending')),
            0
          )::numeric(10,2)                AS muatan_saat_ini
        FROM vessels v
        LEFT JOIN pengiriman p ON p.vessel_id = v.id
        WHERE v.nama_kapal ILIKE ${'%' + search + '%'}
        GROUP BY v.id, v.nama_kapal, v.tipe_kapal, v.status_kapal, v.lokasi, v.kapasitas_ton
        ORDER BY v.id ASC
        LIMIT  ${limit}
        OFFSET ${offset}
      `,
      sql`
        SELECT COUNT(*)::int AS total FROM vessels
        WHERE nama_kapal ILIKE ${'%' + search + '%'}
      `,
    ]);

    const total = Number(countResult[0]?.total || 0);
    return NextResponse.json({
      vessels,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    return NextResponse.json(
      { vessels: [], total: 0, page: 1, totalPages: 1,
        error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
  // ← tidak ada sql.end() — koneksi dipertahankan untuk request berikutnya
}

// ─── POST ────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const sql = getSql();
  try {
    const body = await request.json();
    if (!body.name?.trim()) {
      return NextResponse.json({ success: false, error: 'Nama vessel wajib diisi' }, { status: 400 });
    }
    await sql`
      INSERT INTO vessels (nama_kapal, tipe_kapal, status_kapal, lokasi, kapasitas_ton)
      VALUES (
        ${body.name},
        ${body.type     || 'cargo'},
        ${body.status   || 'In Port'},
        ${body.location || 'Indonesia'},
        ${Number(body.kapasitas_ton) || 50}
      )
    `;
    return NextResponse.json({ success: true, message: 'Vessel berhasil ditambahkan' });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// ─── PUT ─────────────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  const sql = getSql();
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: 'ID wajib disertakan' }, { status: 400 });
    await sql`
      UPDATE vessels SET
        nama_kapal    = ${body.name},
        status_kapal  = ${body.status},
        lokasi        = ${body.location || 'Indonesia'},
        kapasitas_ton = ${Number(body.kapasitas_ton) || 50}
      WHERE id = ${body.id}
    `;
    return NextResponse.json({ success: true, message: 'Vessel berhasil diupdate' });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const sql = getSql();
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID wajib disertakan' }, { status: 400 });

    const inUse = await sql`
      SELECT COUNT(*)::int AS total FROM pengiriman WHERE vessel_id = ${Number(id)}
    `;
    if (Number(inUse[0]?.total) > 0) {
      return NextResponse.json(
        { success: false, error: 'Vessel tidak bisa dihapus karena masih digunakan di data pengiriman' },
        { status: 409 }
      );
    }
    await sql`DELETE FROM vessels WHERE id = ${Number(id)}`;
    return NextResponse.json({ success: true, message: 'Vessel berhasil dihapus' });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}