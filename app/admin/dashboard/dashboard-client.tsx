'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './dash.module.css';

type DashboardData = {
  summary: {
    totalVessels: number;
    arrivedVessels: number;
    enRouteVessels: number;
    maintenanceVessels: number;
    delayedVessels: number;
  };
  cargo: {
    currentMonthCargo: number;
    lastMonthCargo: number;
    currentMonthRevenue: number;
    monthlyCargoTarget: number;
    cargoPercentage: number;
    cargoGrowth: number;
  };
  statusPercentage: {
    arrived: number;
    enRoute: number;
    maintenance: number;
    delayed: number;
  };
  fuel: {
    totalConsumption: number;
  };
  deliverySpeed: {
    average: number;
    growth: number;
    weekly: number[];
  };
  alerts: {
    noResi: string;
    namaPenerima: string;
    status: string;
    tanggalTransaksi: string;
  }[];
};

const initialDashboardData: DashboardData = {
  summary: {
    totalVessels: 0,
    arrivedVessels: 0,
    enRouteVessels: 0,
    maintenanceVessels: 0,
    delayedVessels: 0,
  },
  cargo: {
    currentMonthCargo: 0,
    lastMonthCargo: 0,
    currentMonthRevenue: 0,
    monthlyCargoTarget: 1000,
    cargoPercentage: 0,
    cargoGrowth: 0,
  },
  statusPercentage: {
    arrived: 0,
    enRoute: 0,
    maintenance: 0,
    delayed: 0,
  },
  fuel: {
    totalConsumption: 48.5,
  },
  deliverySpeed: {
    average: 28.8,
    growth: 65,
    weekly: [21.6, 19.4, 29.5, 21.8],
  },
  alerts: [],
};

export default function DashboardPage() {
  const [dashboardData, setDashboardData] =
    useState<DashboardData>(initialDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fleetLink, setFleetLink] = useState('/admin/fleet');

  useEffect(() => {
    const role = localStorage.getItem('role');

    if (role === 'admin') {
      setFleetLink('/admin/fleet');
    } else {
      setFleetLink('/auser/fleet_usr');
    }
  }, []);

  useEffect(() => {
    async function getDashboardData() {
      try {
        setLoading(true);
        setError('');

        const res = await fetch('/api/dashboard', {
          cache: 'no-store',
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Gagal mengambil data dashboard');
        }

        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    getDashboardData();
  }, []);

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (value: string) => {
    if (!value) return '-';

    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  };

  const getAlertClass = (index: number) => {
    if (index === 0) return `${styles.alertBox} ${styles.alertRed}`;
    if (index === 1) return `${styles.alertBox} ${styles.alertYellow}`;
    return `${styles.alertBox} ${styles.alertBrown}`;
  };

  return (
    <main className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.logoBox}>
          <Link href="/admin/dashboard" className={styles.logo}>
            <img
              src="/shipylogo.jpeg"
              alt="Shipy Logo"
              className={styles.logoImage}
            />
          </Link>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/admin/dashboard"
            className={`${styles.navItem} ${styles.active}`}
          >
            Dashboard
          </Link>
          <Link href={fleetLink} className={styles.navItem}>
            Fleet
          </Link>
          <Link href="/admin/cargo" className={styles.navItem}>
            Cargo
          </Link>
          <Link href="/admin/map" className={styles.navItem}>
            Map
          </Link>
          <Link href="/admin/analytic" className={styles.navItem}>
            Analytic
          </Link>
        </nav>

        <div className={styles.userBox}>
          <div className={styles.userIcon}>
            <img src="/profile.png" alt="User" className={styles.userImage} />
          </div>
        </div>
      </header>

      {error && (
        <div
          style={{
            background: '#a00f26',
            border: '1px solid #ff375d',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}

      <section className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <span>Total Vessels</span>
          <strong>
            {loading ? '-' : formatNumber(dashboardData.summary.totalVessels)}
          </strong>
        </div>

        <div className={styles.summaryItem}>
          <span>Arrived Vessels</span>
          <strong>
            {loading ? '-' : formatNumber(dashboardData.summary.arrivedVessels)}
          </strong>
        </div>

        <div className={styles.summaryItem}>
          <span>En Route Vessels</span>
          <strong>
            {loading ? '-' : formatNumber(dashboardData.summary.enRouteVessels)}
          </strong>
        </div>

        <div className={styles.summaryItem}>
          <span>Maintenance</span>
          <strong>
            {loading
              ? '-'
              : formatNumber(dashboardData.summary.maintenanceVessels)}
          </strong>
        </div>

        <div className={styles.summaryItem}>
          <span>Delayed Vessels</span>
          <strong>
            {loading ? '-' : formatNumber(dashboardData.summary.delayedVessels)}
          </strong>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.cargoCard}>
          <h3>Monthly Cargo in</h3>

          <div className={styles.progressWrap}>
            <div className={styles.progressHeader}>
              <span>{loading ? '-' : `${dashboardData.cargo.cargoPercentage}%`}</span>
            </div>

            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${dashboardData.cargo.cargoPercentage}%`,
                }}
              />
            </div>

            <div className={styles.smallText}>
              <strong>
                {loading
                  ? '-'
                  : `${formatNumber(
                      dashboardData.cargo.currentMonthCargo
                    )}/${formatNumber(dashboardData.cargo.monthlyCargoTarget)}`}
              </strong>
              <br />
              Shipment
              <br />
              Revenue:{' '}
              {loading
                ? '-'
                : formatCurrency(dashboardData.cargo.currentMonthRevenue)}
            </div>

            <div className={styles.greenText}>
              {dashboardData.cargo.cargoGrowth >= 0 ? '↑' : '↓'}{' '}
              {Math.abs(dashboardData.cargo.cargoGrowth)}% from
              <br />
              last month
            </div>
          </div>
        </div>

        <div className={styles.mapCard}>
          <img
            src="/map siweb baru.png"
            alt="Map"
            className={styles.mapImage}
          />
          <span className={`${styles.dot} ${styles.red}`} />
          <span className={`${styles.dot} ${styles.green}`} />
          <span className={`${styles.dot} ${styles.yellow}`} />
          <span className={`${styles.dot} ${styles.blueOne}`} />
          <span className={`${styles.dot} ${styles.blueTwo}`} />
        </div>

        <div className={styles.statusCard}>
          <h3>Fleet Status Overview</h3>

          <div className={styles.statusBars}>
            <div className={styles.statusBar}>
              <div
                className={`${styles.fill} ${styles.fillBlue}`}
                style={{
                  width: `${dashboardData.statusPercentage.enRoute}%`,
                }}
              />
            </div>

            <div className={styles.statusBar}>
              <div
                className={`${styles.fill} ${styles.fillRed}`}
                style={{
                  width: `${dashboardData.statusPercentage.delayed}%`,
                }}
              />
            </div>

            <div className={styles.statusBar}>
              <div
                className={`${styles.fill} ${styles.fillGreen}`}
                style={{
                  width: `${dashboardData.statusPercentage.arrived}%`,
                }}
              />
            </div>

            <div className={styles.statusBar}>
              <div
                className={`${styles.fill} ${styles.fillYellow}`}
                style={{
                  width: `${dashboardData.statusPercentage.maintenance}%`,
                }}
              />
            </div>
          </div>

          <div className={styles.legend}>
            <span>
              <i className={styles.legendBlue} />
              En Route
            </span>
            <span>
              <i className={styles.legendRed} />
              Delayed
            </span>
            <span>
              <i className={styles.legendGreen} />
              In Port
            </span>
            <span>
              <i className={styles.legendYellow} />
              Maintenance
            </span>
          </div>
        </div>

        <div className={styles.fuelCard}>
          <h3>Fuel Consumption</h3>

          <div className={styles.fuelStats}>
            <p className={styles.muted}>Today</p>

            <div className={styles.fuelNumberRow}>
              <h2>{dashboardData.fuel.totalConsumption}</h2>
              <span className={styles.unit}>KL</span>
            </div>

            <p className={styles.mutedSmall}>Total Consumption</p>
          </div>

          <div className={styles.chart}>
            <div className={styles.chartGrid} />

            <svg
              className={styles.svgChart}
              viewBox="0 0 280 150"
              preserveAspectRatio="none"
            >
              <polyline
                points="0,120 40,95 80,105 120,60 160,72 210,45 280,80"
                fill="none"
                stroke="#5c4bff"
                strokeWidth="4"
              />
              <circle className={styles.chartPoint} cx="40" cy="95" r="4" />
              <circle className={styles.chartPoint} cx="80" cy="105" r="4" />
              <circle className={styles.chartPoint} cx="120" cy="60" r="4" />
              <circle className={styles.chartPoint} cx="160" cy="72" r="4" />
              <circle className={styles.chartPoint} cx="210" cy="45" r="4" />
            </svg>
          </div>

          <div className={styles.fuelXAxis}>
            <span>00.00</span>
            <span>04.00</span>
            <span>08.00</span>
            <span>12.00</span>
            <span>20.00</span>
            <span>24.00</span>
          </div>
        </div>

        <div className={styles.deliveryCard}>
          <div className={styles.deliveryHeaderRow}>
            <div className={styles.deliveryHeaderLeft}>
              <h3 className={styles.deliveryTitle}>Monthly Delivery Speed</h3>
              <p className={styles.deliverySubtitle}>(Average)</p>

              <div className={styles.deliveryValueRow}>
                <span className={styles.deliveryBigNumber}>
                  {dashboardData.deliverySpeed.average}
                </span>
                <span className={styles.deliveryBigUnit}>Knots</span>
              </div>
            </div>

            <div className={styles.deliveryGrowthBox}>
              <span className={styles.deliveryGrowthTop}>
                ↑ {dashboardData.deliverySpeed.growth}%
              </span>
              <span className={styles.deliveryGrowthBottom}>
                from last month
              </span>
            </div>
          </div>

          <div className={styles.deliveryChartBox}>
            <div className={styles.deliveryLeftAxis}>
              <span>40</span>
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>

            <svg className={styles.deliveryChartSvg} viewBox="0 0 360 190">
              <line
                className={styles.deliveryAxisLine}
                x1="20"
                y1="10"
                x2="20"
                y2="150"
              />
              <line
                className={styles.deliveryAxisLine}
                x1="20"
                y1="150"
                x2="340"
                y2="150"
              />

              <line
                className={styles.deliveryGuideLine}
                x1="20"
                y1="45"
                x2="340"
                y2="45"
              />
              <line
                className={styles.deliveryGuideLine}
                x1="20"
                y1="80"
                x2="340"
                y2="80"
              />
              <line
                className={styles.deliveryGuideLine}
                x1="20"
                y1="115"
                x2="340"
                y2="115"
              />

              <polyline
                points="55,76 135,83 215,48 295,75"
                fill="none"
                stroke="#5a46ff"
                strokeWidth="5"
              />

              <circle className={styles.deliveryPoint} cx="55" cy="76" r="7" />
              <circle className={styles.deliveryPoint} cx="135" cy="83" r="7" />
              <circle className={styles.deliveryPoint} cx="215" cy="48" r="7" />
              <circle className={styles.deliveryPoint} cx="295" cy="75" r="7" />

              <text className={styles.deliveryPointText} x="43" y="63">
                {dashboardData.deliverySpeed.weekly[0]}
              </text>
              <text className={styles.deliveryPointText} x="123" y="70">
                {dashboardData.deliverySpeed.weekly[1]}
              </text>
              <text className={styles.deliveryPointText} x="203" y="35">
                {dashboardData.deliverySpeed.weekly[2]}
              </text>
              <text className={styles.deliveryPointText} x="283" y="62">
                {dashboardData.deliverySpeed.weekly[3]}
              </text>

              <text className={styles.deliveryWeekText} x="38" y="180">
                Week 1
              </text>
              <text className={styles.deliveryWeekText} x="118" y="180">
                Week 2
              </text>
              <text className={styles.deliveryWeekText} x="198" y="180">
                Week 3
              </text>
              <text className={styles.deliveryWeekText} x="278" y="180">
                Week 4
              </text>
            </svg>
          </div>
        </div>

        <div className={styles.alertsCard}>
          <h3>ALERTS</h3>

          {loading ? (
            <div className={`${styles.alertBox} ${styles.alertBrown}`}>
              <div className={styles.alertInner}>
                <div className={styles.alertLeft}>
                  <div className={styles.alertIcon}>...</div>
                  <strong>Loading alerts...</strong>
                </div>
              </div>
            </div>
          ) : dashboardData.alerts.length === 0 ? (
            <div className={`${styles.alertBox} ${styles.alertBrown}`}>
              <div className={styles.alertInner}>
                <div className={styles.alertLeft}>
                  <div className={styles.alertIcon}>✓</div>
                  <strong>No active alerts</strong>
                </div>
                <p>All shipment data is clear</p>
              </div>
            </div>
          ) : (
            dashboardData.alerts.map((alert, index) => (
              <div key={`${alert.noResi}-${index}`} className={getAlertClass(index)}>
                <div className={styles.alertInner}>
                  <div className={styles.alertLeft}>
                    <div className={styles.alertIcon}>⚠</div>
                    <strong>
                      Shipment {alert.noResi} untuk {alert.namaPenerima} masih{' '}
                      {alert.status}
                    </strong>
                  </div>

                  <p>{formatDate(alert.tanggalTransaksi)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}