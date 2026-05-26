import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const search = request.nextUrl.searchParams.get('search') || '';
    const page = Number(request.nextUrl.searchParams.get('page') || '1');
    const limit = Number(request.nextUrl.searchParams.get('limit') || '4');
    const offset = (page - 1) * limit;

    const data = await sql`
  SELECT
    pengiriman.*,
    pelanggan.nama_customer AS nama_pengirim,
    pelanggan.telepon AS no_telepon,
    pelanggan.kota_asal AS kota_asal
  FROM pengiriman
  JOIN pelanggan
  ON pengiriman.pelanggan_id = pelanggan.id
  WHERE
    pengiriman.no_resi ILIKE ${'%' + search + '%'}
    OR pelanggan.nama_customer ILIKE ${'%' + search + '%'}
    OR pengiriman.nama_penerima ILIKE ${'%' + search + '%'}
  ORDER BY pengiriman.id DESC
  LIMIT ${limit}
  OFFSET ${offset}
`;

    const countResult = await sql`
      SELECT COUNT(*)::int AS total
      FROM pengiriman
      JOIN pelanggan
      ON pengiriman.pelanggan_id = pelanggan.id
      WHERE
        pengiriman.no_resi ILIKE ${'%' + search + '%'}
        OR pelanggan.nama_customer ILIKE ${'%' + search + '%'}
        OR pengiriman.nama_penerima ILIKE ${'%' + search + '%'}
    `;

    const total = countResult[0].total;

    return NextResponse.json({
      pengiriman: data,
      page,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();

    await sql`
      INSERT INTO pengiriman (
        no_resi,
        pelanggan_id,
        vessel_id,
        pelabuhan_asal_id,
        pelabuhan_tujuan_id,
        nama_penerima,
        kota_tujuan,
        tanggal_transaksi,
        jenis_pengiriman,
        status,
        tarif,
        catatan_tambahan
      )
      VALUES (
        ${body.no_resi},
        ${Number(body.pelanggan_id || 1)},
        ${Number(body.vessel_id || 1)},
        ${Number(body.pelabuhan_asal_id || 1)},
        ${Number(body.pelabuhan_tujuan_id || 2)},
        ${body.nama_penerima},
        ${body.kota_tujuan},
        ${body.tanggal_transaksi},
        ${body.jenis_pengiriman},
        ${body.status},
        ${Number(body.tarif)},
        ${body.catatan_barang || body.catatan_tambahan || ''}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const body = await request.json();

    await sql`
      UPDATE pengiriman
      SET
        no_resi = ${body.no_resi},
        nama_penerima = ${body.nama_penerima},
        kota_tujuan = ${body.kota_tujuan},
        jenis_pengiriman = ${body.jenis_pengiriman},
        status = ${body.status},
        tarif = ${Number(body.tarif)},
        catatan_tambahan = ${body.catatan_barang || ''}
      WHERE id = ${Number(body.id)}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const id = request.nextUrl.searchParams.get('id');

    await sql`
      DELETE FROM detail_pengiriman
      WHERE pengiriman_id = ${Number(id)}
    `;

    await sql`
      DELETE FROM pengiriman
      WHERE id = ${Number(id)}
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}