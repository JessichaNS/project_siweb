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

// ─── GET ────────────────────────────────────────────────────────────────────
// JOIN ke pelanggan & pelabuhan supaya bisa tampil nama_pengirim, kota_asal,
// no_telepon yang tidak ada di tabel pengiriman langsung.
export async function GET(request: NextRequest) {
  const sql = getSql();
  try {
    const search = request.nextUrl.searchParams.get('search') || '';
    const page   = Number(request.nextUrl.searchParams.get('page')  || '1');
    const limit  = Number(request.nextUrl.searchParams.get('limit') || '4');
    const offset = (page - 1) * limit;

    const pengiriman = await sql`
      SELECT
        p.id,
        p.no_resi,
        pl.nama_customer   AS nama_pengirim,
        pl.telepon         AS no_telepon,
        pl.kota_asal       AS kota_asal,
        p.nama_penerima,
        p.kota_tujuan,
        p.tanggal_transaksi,
        p.jenis_pengiriman,
        p.status,
        p.tarif,
        p.catatan_tambahan AS catatan_barang,
        p.pelanggan_id,
        p.vessel_id,
        p.pelabuhan_asal_id,
        p.pelabuhan_tujuan_id,
        pb_asal.nama_pelabuhan  AS nama_pelabuhan_asal,
        pb_tuj.nama_pelabuhan   AS nama_pelabuhan_tujuan
      FROM pengiriman p
      LEFT JOIN pelanggan   pl      ON pl.id      = p.pelanggan_id
      LEFT JOIN pelabuhan   pb_asal ON pb_asal.id = p.pelabuhan_asal_id
      LEFT JOIN pelabuhan   pb_tuj  ON pb_tuj.id  = p.pelabuhan_tujuan_id
      WHERE
        p.no_resi          ILIKE ${'%' + search + '%'}
        OR pl.nama_customer ILIKE ${'%' + search + '%'}
        OR p.nama_penerima  ILIKE ${'%' + search + '%'}
      ORDER BY p.id ASC
      LIMIT  ${limit}
      OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int AS total
      FROM pengiriman p
      LEFT JOIN pelanggan pl ON pl.id = p.pelanggan_id
      WHERE
        p.no_resi          ILIKE ${'%' + search + '%'}
        OR pl.nama_customer ILIKE ${'%' + search + '%'}
        OR p.nama_penerima  ILIKE ${'%' + search + '%'}
    `;

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
    await sql.end();
  }
}

// ─── POST ───────────────────────────────────────────────────────────────────
// Karena nama_pengirim / no_telepon / kota_asal ada di tabel pelanggan,
// kita INSERT dulu ke pelanggan lalu pakai id-nya untuk pengiriman.
export async function POST(request: NextRequest) {
  const sql = getSql();
  try {
    const body = await request.json();

    // Validasi field wajib
    const required = [
      'tanggal_transaksi', 'nama_pengirim', 'nama_penerima',
      'no_telepon', 'kota_asal', 'kota_tujuan', 'tarif',
    ];
    for (const field of required) {
      if (body[field] === undefined || body[field] === '') {
        return NextResponse.json(
          { success: false, error: `Field '${field}' wajib diisi` },
          { status: 400 }
        );
      }
    }

    // 1) Insert pelanggan baru, ambil id-nya
    const pelangganResult = await sql`
      INSERT INTO pelanggan (nama_customer, kota_asal, telepon)
      VALUES (${body.nama_pengirim}, ${body.kota_asal}, ${body.no_telepon})
      RETURNING id
    `;
    const pelangganId = pelangganResult[0].id;

    // 2) Generate no_resi otomatis jika belum ada
    const noResi = body.no_resi || await generateNextResi(sql);

    // 3) Insert pengiriman
    await sql`
      INSERT INTO pengiriman (
        no_resi,
        tanggal_transaksi,
        pelanggan_id,
        vessel_id,
        pelabuhan_asal_id,
        pelabuhan_tujuan_id,
        nama_penerima,
        kota_tujuan,
        jenis_pengiriman,
        status,
        tarif,
        catatan_tambahan
      ) VALUES (
        ${noResi},
        ${body.tanggal_transaksi},
        ${pelangganId},
        ${Number(body.vessel_id)         || 1},
        ${Number(body.pelabuhan_asal_id) || 1},
        ${Number(body.pelabuhan_tujuan_id) || 2},
        ${body.nama_penerima},
        ${body.kota_tujuan},
        ${body.jenis_pengiriman  || 'Biasa'},
        ${body.status            || 'Diproses'},
        ${Number(body.tarif)},
        ${body.catatan_barang    || ''}
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Pengiriman berhasil ditambahkan',
      no_resi: noResi,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  } finally {
    await sql.end();
  }
}

// ─── PUT ────────────────────────────────────────────────────────────────────
// Update pengiriman. Data pengirim (nama, telepon, kota_asal) diupdate
// di tabel pelanggan via pelanggan_id.
export async function PUT(request: NextRequest) {
  const sql = getSql();
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID pengiriman wajib disertakan' },
        { status: 400 }
      );
    }

    // Ambil pelanggan_id dari pengiriman yang akan diedit
    const existing = await sql`
      SELECT pelanggan_id FROM pengiriman WHERE id = ${Number(body.id)}
    `;
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pengiriman tidak ditemukan' },
        { status: 404 }
      );
    }
    const pelangganId = existing[0].pelanggan_id;

    // Update data pelanggan (pengirim)
    if (pelangganId) {
      await sql`
        UPDATE pelanggan
        SET
          nama_customer = ${body.nama_pengirim},
          kota_asal     = ${body.kota_asal},
          telepon       = ${body.no_telepon}
        WHERE id = ${pelangganId}
      `;
    }

    // Update pengiriman
    await sql`
      UPDATE pengiriman
      SET
        no_resi          = ${body.no_resi},
        nama_penerima    = ${body.nama_penerima},
        kota_tujuan      = ${body.kota_tujuan},
        jenis_pengiriman = ${body.jenis_pengiriman},
        status           = ${body.status},
        tarif            = ${Number(body.tarif)},
        catatan_tambahan = ${body.catatan_barang || ''}
      WHERE id = ${Number(body.id)}
    `;

    return NextResponse.json({ success: true, message: 'Pengiriman berhasil diupdate' });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  } finally {
    await sql.end();
  }
}

// ─── DELETE ─────────────────────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const sql = getSql();
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID pengiriman wajib disertakan' },
        { status: 400 }
      );
    }

    // Ambil pelanggan_id dulu sebelum dihapus
    const existing = await sql`
      SELECT pelanggan_id FROM pengiriman WHERE id = ${Number(id)}
    `;
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Pengiriman tidak ditemukan' },
        { status: 404 }
      );
    }
    const pelangganId = existing[0].pelanggan_id;

    // Hapus tabel turunan dulu (urutan penting karena foreign key)
    await sql`DELETE FROM map_tracking      WHERE pengiriman_id = ${Number(id)}`;
    await sql`DELETE FROM detail_pengiriman WHERE pengiriman_id = ${Number(id)}`;

    // Hapus pengiriman
    await sql`DELETE FROM pengiriman WHERE id = ${Number(id)}`;

    // Hapus pelanggan jika tidak dipakai pengiriman lain
    if (pelangganId) {
      const stillUsed = await sql`
        SELECT COUNT(*)::int AS total
        FROM pengiriman WHERE pelanggan_id = ${pelangganId}
      `;
      if (Number(stillUsed[0].total) === 0) {
        await sql`DELETE FROM pelanggan WHERE id = ${pelangganId}`;
      }
    }

    return NextResponse.json({ success: true, message: 'Pengiriman berhasil dihapus' });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  } finally {
    await sql.end();
  }
}

// ─── Helper ─────────────────────────────────────────────────────────────────
async function generateNextResi(sql: ReturnType<typeof postgres>) {
  const result = await sql`
    SELECT no_resi FROM pengiriman
    WHERE no_resi LIKE 'RESI%'
    ORDER BY id DESC
    LIMIT 1
  `;
  if (result.length === 0) return 'RESI001';
  const last  = result[0].no_resi as string;
  const match = last.match(/RESI(\d+)/);
  if (!match) return 'RESI001';
  const next = Number(match[1]) + 1;
  return `RESI${String(next).padStart(3, '0')}`;
}