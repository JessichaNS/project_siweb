import postgres from 'postgres';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function toNumber(value: unknown) {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!databaseUrl) {
    return NextResponse.json(
      {
        error: 'DATABASE_URL atau POSTGRES_URL belum diisi di file .env.local',
      },
      { status: 500 }
    );
  }

  const isLocalDatabase =
    databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

  const sql = postgres(databaseUrl, {
    ssl: isLocalDatabase ? false : 'require',
    max: 1,
  });

  try {
    const vesselResult = await sql`
  SELECT
    COUNT(*)::int AS total_vessels,

    COUNT(*) FILTER (
      WHERE LOWER(COALESCE(status_kapal, '')) IN ('in port', 'arrived', 'sampai', 'selesai')
    )::int AS arrived_vessels,

    COUNT(*) FILTER (
      WHERE LOWER(COALESCE(status_kapal, '')) IN ('en route', 'dikirim', 'berlayar', 'on route')
    )::int AS en_route_vessels,

    COUNT(*) FILTER (
      WHERE LOWER(COALESCE(status_kapal, '')) = 'maintenance'
    )::int AS maintenance_vessels,

    COUNT(*) FILTER (
      WHERE LOWER(COALESCE(status_kapal, '')) = 'delayed'
    )::int AS delayed_vessels
  FROM vessels
`;

    const cargoResult = await sql`
      SELECT
        COUNT(*) FILTER (
          WHERE tanggal_transaksi >= date_trunc('month', CURRENT_DATE)
            AND tanggal_transaksi < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
        )::int AS current_month_cargo,

        COUNT(*) FILTER (
          WHERE tanggal_transaksi >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
            AND tanggal_transaksi < date_trunc('month', CURRENT_DATE)
        )::int AS last_month_cargo,

        COALESCE(
          SUM(tarif) FILTER (
            WHERE tanggal_transaksi >= date_trunc('month', CURRENT_DATE)
              AND tanggal_transaksi < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
          ),
          0
        ) AS current_month_revenue
      FROM pengiriman
    `;

    const alertResult = await sql`
      SELECT
        no_resi,
        nama_penerima,
        status,
        tanggal_transaksi
      FROM pengiriman
      WHERE LOWER(COALESCE(status, '')) IN ('pending', 'diproses', 'dikirim')
      ORDER BY tanggal_transaksi DESC
      LIMIT 3
    `;

    const vessel = vesselResult[0] || {};
    const cargo = cargoResult[0] || {};

    const totalVessels = toNumber(vessel.total_vessels);
    const arrivedVessels = toNumber(vessel.arrived_vessels);
    const enRouteVessels = toNumber(vessel.en_route_vessels);
    const maintenanceVessels = toNumber(vessel.maintenance_vessels);
    const delayedVessels = toNumber(vessel.delayed_vessels);

    const currentMonthCargo = toNumber(cargo.current_month_cargo);
    const lastMonthCargo = toNumber(cargo.last_month_cargo);
    const currentMonthRevenue = toNumber(cargo.current_month_revenue);

    const monthlyCargoTarget = 1000;

    const cargoPercentage =
      monthlyCargoTarget > 0
        ? Math.min(Math.round((currentMonthCargo / monthlyCargoTarget) * 100), 100)
        : 0;

    const cargoGrowth =
      lastMonthCargo > 0
        ? Math.round(((currentMonthCargo - lastMonthCargo) / lastMonthCargo) * 100)
        : 0;

    const getStatusPercentage = (value: number) => {
      if (totalVessels === 0) return 0;
      return Math.round((value / totalVessels) * 100);
    };

    return NextResponse.json({
      summary: {
        totalVessels,
        arrivedVessels,
        enRouteVessels,
        maintenanceVessels,
        delayedVessels,
      },
      cargo: {
        currentMonthCargo,
        lastMonthCargo,
        currentMonthRevenue,
        monthlyCargoTarget,
        cargoPercentage,
        cargoGrowth,
      },
      statusPercentage: {
        arrived: getStatusPercentage(arrivedVessels),
        enRoute: getStatusPercentage(enRouteVessels),
        maintenance: getStatusPercentage(maintenanceVessels),
        delayed: getStatusPercentage(delayedVessels),
      },
      fuel: {
        totalConsumption: 48.5,
      },
      deliverySpeed: {
        average: 28.8,
        growth: 65,
        weekly: [21.6, 19.4, 29.5, 21.8],
      },
      alerts: alertResult.map((item) => ({
        noResi: item.no_resi,
        namaPenerima: item.nama_penerima,
        status: item.status,
        tanggalTransaksi: item.tanggal_transaksi,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await sql.end();
  }
}