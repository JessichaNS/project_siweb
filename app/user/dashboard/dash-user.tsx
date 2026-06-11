"use client";

import styles from './dash.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type DashboardData = {
  totalVessels: number;
  enRoute: number;
  inPort: number;
  maintenance: number;
  delayed: number;
  totalShipments: number;
  completed: number;
  inTransit: number;
  processing: number;
  totalRevenue: number;
  monthlyShipments: number;
  monthlyTarget: number;
  completionRate: number;
  monthlyGrowth: number;
};

export default function UserDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      // Fetch paralel — vessels untuk fuel & status, stats untuk cargo
      const [vesselsRes, statsRes] = await Promise.all([
        fetch('/api/vessels?limit=999'),
        fetch('/api/pengiriman?stats=true'),
      ]);

      const vesselsData = await vesselsRes.json();
      const stats       = await statsRes.json();
      const vessels: any[] = vesselsData.vessels || [];

      // ── Vessel stats ──
      const enRoute     = vessels.filter((v: any) => v.status === 'En Route').length;
      const inPort      = vessels.filter((v: any) => v.status === 'In Port').length;
      const maintenance = vessels.filter((v: any) => v.status === 'Maintenance').length;
      const delayed     = vessels.filter((v: any) => v.status === 'Delayed').length;
      const totalVessels = vessels.length;


      // ── Cargo stats dari endpoint agregat ──
      const completed        = stats.selesai            || 0;
      const inTransit        = stats.dikirim            || 0;
      const processing       = stats.diproses           || 0;
      const totalShipments   = stats.total              || 0;
      const totalRevenue     = Number(stats.total_revenue)    || 0;
      const monthlyShipments = Number(stats.monthly_shipments) || 0;
      const prevMonthly      = Number(stats.prev_monthly)      || 0;

      // Target pengiriman bulanan (realistis)
      const monthlyTarget = 20;

      const completionRate = totalShipments > 0
        ? Math.round((completed / totalShipments) * 100) : 0;

      const monthlyGrowth = prevMonthly > 0
        ? Math.round(((monthlyShipments - prevMonthly) / prevMonthly) * 100)
        : monthlyShipments > 0 ? 100 : 0;

      setData({
        totalVessels, enRoute, inPort, maintenance, delayed,
        totalShipments, completed, inTransit, processing, totalRevenue,
        monthlyShipments, monthlyTarget, completionRate, monthlyGrowth,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');

    if (role !== 'user') {
      router.push('/login');
      return;
    }

    setUserName(user || 'User');
    fetchDashboardData(true);

    // Auto-refresh 30 detik tanpa loading spinner
    const interval = setInterval(() => fetchDashboardData(false), 30000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const monthlyPct = data
    ? Math.min(Math.round((data.monthlyShipments / data.monthlyTarget) * 100), 100)
    : 0;

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingWrapper}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading dashboard data...</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingWrapper}>
          <p>Failed to load data. Please refresh the page.</p>
        </div>
      </main>
    );
  }

  const revenueDisplay = data.totalRevenue >= 1_000_000
    ? `Rp ${(data.totalRevenue / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}M`
    : `Rp ${data.totalRevenue.toLocaleString('id-ID')}`;

  return (
    <main className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.logoBox}>
          <div className={styles.logo}>
            <img src="/shipylogo.jpeg" alt="Shipy Logo" className={styles.logoImage} />
          </div>
        </div>
        <nav className={styles.nav}>
          <Link href="/user/dashboard" className={`${styles.navItem} ${styles.active}`}>Dashboard</Link>
          <Link href="/user/fleet"     className={styles.navItem}>Fleet</Link>
          <Link href="/user/cargo"     className={styles.navItem}>Cargo</Link>
          <Link href="/user/map"       className={styles.navItem}>Map</Link>
        </nav>
        <div className={styles.userBox}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>User</span>
          </div>
          <div className={styles.userIcon} onClick={() => setIsLogoutModalOpen(true)} style={{ cursor: 'pointer' }}>
            <img src="/profile.png" alt="User" className={styles.userImage} />
          </div>
        </div>
      </header>

      {/* ── SUMMARY BAR ── */}
      <section className={styles.summaryBar}>
        <div className={styles.summaryItem}><span>🚢 Total Vessels</span><strong>{data.totalVessels}</strong></div>
        <div className={styles.summaryItem}><span>✅ Delivered</span><strong>{data.completed}</strong></div>
        <div className={styles.summaryItem}><span>🚚 En Route</span><strong>{data.enRoute}</strong></div>
        <div className={styles.summaryItem}><span>📦 Shipments</span><strong>{data.totalShipments}</strong></div>
        <div className={styles.summaryItem}><span>💰 Revenue</span><strong>{revenueDisplay}</strong></div>
      </section>

      {/* ── MAIN GRID ── */}
      <section className={styles.grid}>

        {/* CARD 1: Monthly Shipments */}
        <div className={styles.cargoCard}>
          <h3>📦 Monthly Shipments</h3>
          <div className={styles.progressWrap}>
            <div className={styles.progressHeader}>
              <strong>{data.monthlyShipments}</strong>
              <span style={{ fontSize: 13, color: '#a07eff', marginLeft: 6 }}>shipments this month</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${monthlyPct}%` }} />
            </div>
            <p className={styles.smallText}>
              {data.monthlyShipments} / {data.monthlyTarget} target<br />pengiriman bulan ini
            </p>
          </div>
          <p className={data.monthlyGrowth >= 0 ? styles.greenText : styles.redText}>
            {data.monthlyGrowth >= 0 ? '↑' : '↓'} {Math.abs(data.monthlyGrowth)}% vs bulan lalu
          </p>
        </div>

        {/* CARD 2: World Map */}
        <div className={styles.mapCard}>
          <img src="/map siweb.jpeg" alt="World Map" className={styles.mapImage} />
          <div className={`${styles.dot} ${styles.red}`} />
          <div className={`${styles.dot} ${styles.green}`} />
          <div className={`${styles.dot} ${styles.yellow}`} />
          <div className={`${styles.dot} ${styles.blueOne}`} />
          <div className={`${styles.dot} ${styles.blueTwo}`} />
          <div className={styles.mapBadge}>
            <span>{data.enRoute} Active {data.enRoute === 1 ? 'Vessel' : 'Vessels'}</span>
          </div>
        </div>

        {/* CARD 3: Fleet Status Overview */}
        <div className={styles.statusCard}>
          <h3>📊 Fleet Status Overview</h3>
          <div className={styles.statusBars}>
            <div className={styles.statusBar}>
              <div className={`${styles.fill} ${styles.fillBlue}`}
                style={{ width: `${data.totalVessels > 0 ? (data.enRoute / data.totalVessels) * 100 : 0}%` }} />
            </div>
            <div className={styles.statusBar}>
              <div className={`${styles.fill} ${styles.fillGreen}`}
                style={{ width: `${data.totalVessels > 0 ? (data.inPort / data.totalVessels) * 100 : 0}%` }} />
            </div>
            <div className={styles.statusBar}>
              <div className={`${styles.fill} ${styles.fillYellow}`}
                style={{ width: `${data.totalVessels > 0 ? (data.delayed / data.totalVessels) * 100 : 0}%` }} />
            </div>
            <div className={styles.statusBar}>
              <div className={`${styles.fill} ${styles.fillRed}`}
                style={{ width: `${data.totalVessels > 0 ? (data.maintenance / data.totalVessels) * 100 : 0}%` }} />
            </div>
          </div>
          <div className={styles.legend}>
            <span><i className={styles.legendBlue}  />En Route ({data.enRoute})</span>
            <span><i className={styles.legendGreen} />In Port ({data.inPort})</span>
            <span><i className={styles.legendYellow}/>Delayed ({data.delayed})</span>
            <span><i className={styles.legendRed}   />Maintenance ({data.maintenance})</span>
          </div>
        </div>

        {/* CARD 4: Fleet Summary untuk User */}
        <div className={styles.fuelCard}>
          <h3>🚢 Fleet Summary</h3>
          <div className={styles.fuelStats}>
            <p className={styles.muted}>Total Active Vessels</p>
            <div className={styles.fuelNumberRow}>
              <h2>{data.totalVessels}</h2>
              <span className={styles.unit}>kapal</span>
            </div>
            <p className={styles.mutedSmall}>{data.enRoute} en route · {data.inPort} in port</p>
          </div>
          <div className={styles.fuelMiniBar}>
            <div className={styles.fuelMiniFill} style={{ width: `${data.totalVessels > 0 ? (data.inPort / data.totalVessels) * 100 : 0}%` }} />
          </div>
          <div className={styles.fuelNote}>
            <span>{data.maintenance > 0
              ? `🔧 ${data.maintenance} kapal dalam maintenance`
              : '✅ Semua kapal operasional'}</span>
          </div>
        </div>

        {/* CARD 5: Shipment Status */}
        <div className={styles.deliveryCard}>
          <div className={styles.deliveryHeaderRow}>
            <div className={styles.deliveryHeaderLeft}>
              <h3 className={styles.deliveryTitle}>Shipment Status</h3>
              <p className={styles.deliverySubtitle}>(All Time)</p>
              <div className={styles.deliveryValueRow}>
                <span className={styles.deliveryBigNumber}>{data.completionRate}</span>
                <span className={styles.deliveryBigUnit}>%</span>
              </div>
            </div>
            <div className={styles.deliveryGrowthBox}>
              <div className={styles.deliveryGrowthTop}>
                {data.monthlyGrowth >= 0 ? '↑' : '↓'} {Math.abs(data.monthlyGrowth)}%
              </div>
              <div className={styles.deliveryGrowthBottom}>vs last month</div>
            </div>
          </div>
          <div className={styles.shipmentStats}>
            <div className={styles.shipmentStatItem}>
              <span className={styles.shipmentStatValue}>{data.completed}</span>
              <span className={styles.shipmentStatLabel}>Completed</span>
            </div>
            <div className={styles.shipmentStatItem}>
              <span className={styles.shipmentStatValue}>{data.inTransit}</span>
              <span className={styles.shipmentStatLabel}>In Transit</span>
            </div>
            <div className={styles.shipmentStatItem}>
              <span className={styles.shipmentStatValue}>{data.processing}</span>
              <span className={styles.shipmentStatLabel}>Processing</span>
            </div>
          </div>
        </div>

        {/* CARD 6: Alerts */}
        <div className={styles.alertsCard}>
          <h3>⚠️ ALERTS</h3>

          <div className={`${styles.alertBox} ${styles.alertYellow}`}>
            <div className={styles.alertInner}>
              <div className={styles.alertLeft}>
                <div className={styles.alertIcon}>📦</div>
                <strong>{data.totalShipments - data.completed} pending {data.totalShipments - data.completed === 1 ? 'delivery' : 'deliveries'}</strong>
              </div>
              <p>{data.completed} completed this month</p>
            </div>
          </div>
          <div className={`${styles.alertBox} ${styles.alertBrown}`}>
            <div className={styles.alertInner}>
              <div className={styles.alertLeft}>
                <div className={styles.alertIcon}>🚢</div>
                <strong>{data.enRoute} {data.enRoute === 1 ? 'vessel' : 'vessels'} en route</strong>
              </div>
              <p>Track live on map</p>
            </div>
          </div>
          {data.maintenance > 0 && (
            <div className={`${styles.alertBox} ${styles.alertRed}`}>
              <div className={styles.alertInner}>
                <div className={styles.alertLeft}>
                  <div className={styles.alertIcon}>🔧</div>
                  <strong>{data.maintenance} {data.maintenance === 1 ? 'vessel' : 'vessels'} in maintenance</strong>
                </div>
                <p>Check fleet page for details</p>
              </div>
            </div>
          )}
        </div>

      </section>

      {/* ── LOGOUT MODAL ── */}
      {isLogoutModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsLogoutModalOpen(false)}>
          <div className={styles.logoutModal} onClick={(e) => e.stopPropagation()}>
            <h2>Konfirmasi Logout</h2>
            <p>Apakah Anda yakin ingin keluar?</p>
            <div className={styles.logoutButtons}>
              <button className={styles.cancelLogout} onClick={() => setIsLogoutModalOpen(false)}>Tidak</button>
              <button className={styles.confirmLogout} onClick={handleLogout}>Ya, Logout</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
