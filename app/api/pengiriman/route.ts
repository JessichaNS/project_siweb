import postgres from 'postgres';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

let _sql: ReturnType<typeof postgres> | null = null;

function getSql() {
  if (_sql) return _sql;
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL atau POSTGRES_URL belum diisi di .env.local');
  }
  const isLocalDatabase =
    databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
  _sql = postgres(databaseUrl, {
    ssl: isLocalDatabase ? false : 'require',
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return _sql;
}

function hitungTarif(berat: number, jenis: string): number {
  const tarif: Record<string, number> = {
    'Biasa': 10000,
    'Cepat': 15000,
    'VVIP':  25000,
  };
  return Math.round(berat * (tarif[jenis] ?? 10000));
}

// ─── GET ─────────────────────────────────────────────────────────────────────
// ?stats=true  → hanya kembalikan agregat (COUNT per status), sangat cepat
// ?search=&page=&limit= → list biasa dengan pagination
export async function GET(request: NextRequest) {
  const sql = getSql();
  try {
    const statsOnly = request.nextUrl.searchParams.get('stats') === 'true';

    // ── MODE STATS: satu query agregat lengkap ──
    if (statsOnly) {
      const now       = new Date();
      const thisMonth = now.getMonth() + 1;
      const thisYear  = now.getFullYear();
      const prevMonth = thisMonth === 1 ? 12 : thisMonth - 1;
      const prevYear  = thisMonth === 1 ? thisYear - 1 : thisYear;

      const result = await sql`
        SELECT
          COUNT(*)::int                                                        AS total,
          COUNT(*) FILTER (WHERE status = 'Selesai')::int                     AS selesai,
          COUNT(*) FILTER (WHERE status = 'Dikirim')::int                     AS dikirim,
          COUNT(*) FILTER (WHERE status IN ('Diproses','Pending'))::int        AS diproses,
          COALESCE(SUM(tarif), 0)::bigint                                      AS total_revenue,
          COUNT(*) FILTER (
            WHERE EXTRACT(MONTH FROM tanggal_transaksi) = ${thisMonth}
            AND   EXTRACT(YEAR  FROM tanggal_transaksi) = ${thisYear}
          )::int                                                               AS monthly_shipments,
          COALESCE(SUM(tarif) FILTER (
            WHERE EXTRACT(MONTH FROM tanggal_transaksi) = ${thisMonth}
            AND   EXTRACT(YEAR  FROM tanggal_transaksi) = ${thisYear}
          ), 0)::bigint                                                        AS monthly_revenue,
          COUNT(*) FILTER (
            WHERE EXTRACT(MONTH FROM tanggal_transaksi) = ${prevMonth}
            AND   EXTRACT(YEAR  FROM tanggal_transaksi) = ${prevYear}
          )::int                                                               AS prev_monthly
        FROM pengiriman
      `;
      return NextResponse.json(result[0]);
    }

    // ── MODE LIST: pagination biasa ──
    const search = request.nextUrl.searchParams.get('search') || '';
    const page   = Number(request.nextUrl.searchParams.get('page')  || '1');
    const limit  = Number(request.nextUrl.searchParams.get('limit') || '4');
    const offset = (page - 1) * limit;

    const [pengiriman, countResult] = await Promise.all([
      sql`
        SELECT
          p.id, p.no_resi,
          pl.nama_customer AS nama_pengirim,
          pl.telepon       AS no_telepon,
          pl.kota_asal,
          p.nama_penerima, p.kota_tujuan,
          p.tanggal_transaksi, p.jenis_pengiriman,
          p.status, p.tarif, p.berat,
          p.catatan_tambahan AS catatan_barang,
          p.pelanggan_id, p.vessel_id,
          p.pelabuhan_asal_id, p.pelabuhan_tujuan_id,
          v.nama_kapal           AS nama_kapal,
          pb_asal.nama_pelabuhan AS nama_pelabuhan_asal,
          pb_tuj.nama_pelabuhan  AS nama_pelabuhan_tujuan
        FROM pengiriman p
        LEFT JOIN pelanggan pl      ON pl.id      = p.pelanggan_id
        LEFT JOIN vessels   v       ON v.id       = p.vessel_id
        LEFT JOIN pelabuhan pb_asal ON pb_asal.id = p.pelabuhan_asal_id
        LEFT JOIN pelabuhan pb_tuj  ON pb_tuj.id  = p.pelabuhan_tujuan_id
        WHERE
          p.no_resi           ILIKE ${'%' + search + '%'}
          OR pl.nama_customer ILIKE ${'%' + search + '%'}
          OR p.nama_penerima  ILIKE ${'%' + search + '%'}
        ORDER BY p.id ASC
        LIMIT  ${limit}
        OFFSET ${offset}
      `,
      sql`
        SELECT COUNT(*)::int AS total
        FROM pengiriman p
        LEFT JOIN pelanggan pl ON pl.id = p.pelanggan_id
        WHERE
          p.no_resi           ILIKE ${'%' + search + '%'}
          OR pl.nama_customer ILIKE ${'%' + search + '%'}
          OR p.nama_penerima  ILIKE ${'%' + search + '%'}
      `,
    ]);

    const total = Number(countResult[0]?.total || 0);
    return NextResponse.json({
      pengiriman,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    return NextResponse.json(
      { pengiriman: [], total: 0, page: 1, totalPages: 1,
        error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  } finally {
  }
}

// ─── POST ────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const sql = getSql();
  try {
    const body = await request.json();

    const required = [
      'tanggal_transaksi', 'nama_pengirim', 'nama_penerima',
      'no_telepon', 'kota_asal', 'kota_tujuan', 'berat',
    ];
    for (const field of required) {
      if (body[field] === undefined || body[field] === '') {
        return NextResponse.json(
          { success: false, error: `Field '${field}' wajib diisi` },
          { status: 400 }
        );
      }
    }

    const berat = Number(body.berat);
    if (isNaN(berat) || berat <= 0) {
      return NextResponse.json(
        { success: false, error: 'Berat harus berupa angka positif' },
        { status: 400 }
      );
    }

    const tarif = hitungTarif(berat, body.jenis_pengiriman || 'Biasa');

    // ── Cek kapasitas kapal ──
    const vesselId = Number(body.vessel_id) || 1;
    const kapasitasCheck = await sql`
      SELECT
        v.kapasitas_ton,
        COALESCE(SUM(p.berat) FILTER (WHERE p.status IN ('Diproses','Dikirim','Pending')), 0) AS muatan
      FROM vessels v
      LEFT JOIN pengiriman p ON p.vessel_id = v.id
      WHERE v.id = ${vesselId}
      GROUP BY v.kapasitas_ton
    `;
    if (kapasitasCheck.length > 0) {
      const kapasitas  = Number(kapasitasCheck[0].kapasitas_ton) * 1000; // ton → kg
      const muatan     = Number(kapasitasCheck[0].muatan);
      if (muatan + berat > kapasitas) {
        const sisa = (kapasitas - muatan).toLocaleString('id-ID');
        return NextResponse.json(
          { success: false, error: `Kapasitas kapal tidak mencukupi. Sisa muatan: ${sisa} kg` },
          { status: 422 }
        );
      }
    }

    const pelangganResult = await sql`
      INSERT INTO pelanggan (nama_customer, kota_asal, telepon)
      VALUES (${body.nama_pengirim}, ${body.kota_asal}, ${body.no_telepon})
      RETURNING id
    `;
    const pelangganId = pelangganResult[0].id;
    const noResi = body.no_resi || await generateNextResi(sql);

    await sql`
      INSERT INTO pengiriman (
        no_resi, tanggal_transaksi, pelanggan_id, vessel_id,
        pelabuhan_asal_id, pelabuhan_tujuan_id,
        nama_penerima, kota_tujuan, jenis_pengiriman,
        status, tarif, berat, catatan_tambahan
      ) VALUES (
        ${noResi}, ${body.tanggal_transaksi}, ${pelangganId},
        ${Number(body.vessel_id)           || 1},
        ${Number(body.pelabuhan_asal_id)   || 1},
        ${Number(body.pelabuhan_tujuan_id) || 2},
        ${body.nama_penerima}, ${body.kota_tujuan},
        ${body.jenis_pengiriman || 'Biasa'},
        ${body.status           || 'Diproses'},
        ${tarif}, ${berat}, ${body.catatan_barang || ''}
      )
    `;

    return NextResponse.json({ success: true, message: 'Pengiriman berhasil ditambahkan', no_resi: noResi, tarif });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  } finally {
  }
}

// ─── PUT ─────────────────────────────────────────────────────────────────────
export async function PUT(request: NextRequest) {
  const sql = getSql();
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ success: false, error: 'ID wajib disertakan' }, { status: 400 });

    const berat = Number(body.berat);
    if (isNaN(berat) || berat <= 0) return NextResponse.json({ success: false, error: 'Berat harus berupa angka positif' }, { status: 400 });

    const tarif = hitungTarif(berat, body.jenis_pengiriman || 'Biasa');

    const existing = await sql`SELECT pelanggan_id FROM pengiriman WHERE id = ${Number(body.id)}`;
    if (existing.length === 0) return NextResponse.json({ success: false, error: 'Pengiriman tidak ditemukan' }, { status: 404 });

    const pelangganId = existing[0].pelanggan_id;
    if (pelangganId) {
      await sql`
        UPDATE pelanggan SET nama_customer = ${body.nama_pengirim}, kota_asal = ${body.kota_asal}, telepon = ${body.no_telepon}
        WHERE id = ${pelangganId}
      `;
    }

    await sql`
      UPDATE pengiriman SET
        no_resi = ${body.no_resi}, nama_penerima = ${body.nama_penerima},
        kota_tujuan = ${body.kota_tujuan}, jenis_pengiriman = ${body.jenis_pengiriman},
        status = ${body.status}, berat = ${berat}, tarif = ${tarif},
        vessel_id = ${Number(body.vessel_id) || 1},
        catatan_tambahan = ${body.catatan_barang || ''}
      WHERE id = ${Number(body.id)}
    `;

    return NextResponse.json({ success: true, message: 'Pengiriman berhasil diupdate', tarif });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  } finally {
  }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const sql = getSql();
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID wajib disertakan' }, { status: 400 });

    const existing = await sql`SELECT pelanggan_id FROM pengiriman WHERE id = ${Number(id)}`;
    if (existing.length === 0) return NextResponse.json({ success: false, error: 'Pengiriman tidak ditemukan' }, { status: 404 });

    const pelangganId = existing[0].pelanggan_id;
    await sql`DELETE FROM map_tracking      WHERE pengiriman_id = ${Number(id)}`;
    await sql`DELETE FROM detail_pengiriman WHERE pengiriman_id = ${Number(id)}`;
    await sql`DELETE FROM pengiriman        WHERE id            = ${Number(id)}`;

    if (pelangganId) {
      const stillUsed = await sql`SELECT COUNT(*)::int AS total FROM pengiriman WHERE pelanggan_id = ${pelangganId}`;
      if (Number(stillUsed[0].total) === 0) await sql`DELETE FROM pelanggan WHERE id = ${pelangganId}`;
    }

    return NextResponse.json({ success: true, message: 'Pengiriman berhasil dihapus' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  } finally {
  }
}

async function generateNextResi(sql: ReturnType<typeof postgres>) {
  const result = await sql`SELECT no_resi FROM pengiriman WHERE no_resi LIKE 'RESI%' ORDER BY id DESC LIMIT 1`;
  if (result.length === 0) return 'RESI001';
  const match = (result[0].no_resi as string).match(/RESI(\d+)/);
  if (!match) return 'RESI001';
  return `RESI${String(Number(match[1]) + 1).padStart(3, '0')}`;
}