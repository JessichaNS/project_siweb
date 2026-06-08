"use client";

import styles from './dash.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type DashboardData = {
  // Vessel Stats
  totalVessels: number;
  enRoute: number;
  inPort: number;
  maintenance: number;
  delayed: number;
  avgFuel: number;
  // Cargo Stats
  totalShipments: number;
  completed: number;
  inTransit: number;
  processing: number;
  totalRevenue: number;
  // Monthly
  monthlyCargoIn: number;
  monthlyCargoTarget: number;
  // Delivery
  avgSpeed: number;
  speedGrowth: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch vessels
      const vesselsRes = await fetch('/api/vessels?limit=100');
      const vesselsData = await vesselsRes.json();
      const vessels = vesselsData.vessels || [];

      // Fetch cargo
      const cargoRes = await fetch('/api/pengiriman?limit=100');
      const cargoData = await cargoRes.json();
      const cargo = cargoData.pengiriman || [];

      // VESSEL STATS
      const enRoute = vessels.filter((v: any) => v.status === 'En Route').length;
      const inPort = vessels.filter((v: any) => v.status === 'In Port').length;
      const maintenance = vessels.filter((v: any) => v.status === 'Maintenance').length;
      const delayed = vessels.filter((v: any) => v.status === 'Delayed').length;
      const totalVessels = vessels.length;
      
      const avgFuel = vessels.length > 0 
        ? Math.round(vessels.reduce((sum: number, v: any) => sum + (v.fuel || 0), 0) / vessels.length)
        : 0;

      // CARGO STATS
      const completed = cargo.filter((c: any) => c.status === 'Selesai').length;
      const inTransit = cargo.filter((c: any) => c.status === 'Dikirim').length;
      const processing = cargo.filter((c: any) => c.status === 'Diproses').length;
      const totalShipments = cargo.length;
      const totalRevenue = cargo.reduce((sum: number, c: any) => sum + (Number(c.tarif) || 0), 0);

      // MONTHLY CARGO
      const currentMonth = new Date().getMonth();
      const monthlyCargo = cargo
        .filter((c: any) => new Date(c.tanggal_transaksi).getMonth() === currentMonth)
        .reduce((sum: number, c: any) => sum + (Number(c.tarif) || 0), 0);
      
      const monthlyCargoIn = Math.round(monthlyCargo / 1000000);
      const monthlyCargoTarget = 1000;

      // DELIVERY SPEED
      const avgSpeed = 22.5 + (completed / Math.max(totalShipments, 1)) * 5;
      const speedGrowth = Math.round((avgSpeed / 20 - 1) * 100);

      setData({
        totalVessels,
        enRoute,
        inPort,
        maintenance,
        delayed,
        avgFuel,
        totalShipments,
        completed,
        inTransit,
        processing,
        totalRevenue,
        monthlyCargoIn,
        monthlyCargoTarget,
        avgSpeed: Math.round(avgSpeed * 10) / 10,
        speedGrowth,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    sessionStorage.clear();
    router.push('/login');
  };

  const cargoPercentage = data ? Math.min(Math.round((data.monthlyCargoIn / data.monthlyCargoTarget) * 100), 100) : 0;
  const completedPercentage = data && data.totalShipments > 0 ? Math.round((data.completed / data.totalShipments) * 100) : 0;

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

  return (
    <main className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.logoBox}>
          <div className={styles.logo}>
            <img src="/shipylogo.jpeg" alt="Shipy Logo" className={styles.logoImage} />
          </div>
        </div>

        <nav className={styles.nav}>
          <Link href="/admin/dashboard" className={`${styles.navItem} ${styles.active}`}>Dashboard</Link>
          <Link href="/admin/fleet" className={styles.navItem}>Fleet</Link>
          <Link href="/admin/cargo" className={styles.navItem}>Cargo</Link>
          <Link href="/admin/map" className={styles.navItem}>Map</Link>
          <Link href="/admin/analytic" className={styles.navItem}>Analytic</Link>
        </nav>

        <div className={styles.userBox}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Admin</span>
            <span className={styles.userRole}>Administrator</span>
          </div>
          <div 
            className={styles.userIcon}
            onClick={() => setIsLogoutModalOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <img src="/profile.png" alt="Admin" className={styles.userImage} />
          </div>
        </div>
      </header>

      {/* SUMMARY BAR - SAMA PERSIS DENGAN USER */}
      <section className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <span>🚢 Total Vessels</span>
          <strong>{data.totalVessels}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>✅ Completed</span>
          <strong>{data.completed}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>🚚 En Route</span>
          <strong>{data.enRoute}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>📦 Shipments</span>
          <strong>{data.totalShipments}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>💰 Revenue</span>
          <strong>
            {data.totalRevenue > 0 
              ? `Rp ${(data.totalRevenue / 1000000).toLocaleString('id-ID', { minimumFractionDigits: 1 })}M`
              : 'Rp 0'}
          </strong>
        </div>
      </section>

      {/* MAIN GRID - SAMA PERSIS DENGAN USER */}
      <section className={styles.grid}>
        {/* CARD 1: Monthly Cargo In */}
        <div className={styles.cargoCard}>
          <h3>📦 Monthly Cargo In</h3>
          <div className={styles.progressWrap}>
            <div className={styles.progressHeader}>
              <strong>{cargoPercentage}%</strong>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${cargoPercentage}%` }}></div>
            </div>
            <p className={styles.smallText}>
              {data.monthlyCargoIn.toLocaleString()} / {data.monthlyCargoTarget.toLocaleString()}
              <br />
              Ton
            </p>
          </div>
          <p className={styles.greenText}>
            {cargoPercentage}% ↑ from last month
          </p>
        </div>

        {/* CARD 2: World Map */}
        <div className={styles.mapCard}>
          <img src="/map siweb.jpeg" alt="World Map" className={styles.mapImage} />
          <div className={`${styles.dot} ${styles.red}`}></div>
          <div className={`${styles.dot} ${styles.green}`}></div>
          <div className={`${styles.dot} ${styles.yellow}`}></div>
          <div className={`${styles.dot} ${styles.blueOne}`}></div>
          <div className={`${styles.dot} ${styles.blueTwo}`}></div>
          <div className={styles.mapBadge}>
            <span>{data.enRoute} Active Vessels</span>
          </div>
        </div>

        {/* CARD 3: Fleet Status Overview */}
        <div className={styles.statusCard}>
          <h3>📊 Fleet Status Overview</h3>
          <div className={styles.statusBars}>
            <div className={styles.statusBar}>
              <div className={`${styles.fill} ${styles.fillBlue}`} style={{ width: `${(data.enRoute / data.totalVessels) * 100}%` }}></div>
            </div>
            <div className={styles.statusBar}>
              <div className={`${styles.fill} ${styles.fillGreen}`} style={{ width: `${(data.inPort / data.totalVessels) * 100}%` }}></div>
            </div>
            <div className={styles.statusBar}>
              <div className={`${styles.fill} ${styles.fillYellow}`} style={{ width: `${(data.delayed / data.totalVessels) * 100}%` }}></div>
            </div>
            <div className={styles.statusBar}>
              <div className={`${styles.fill} ${styles.fillRed}`} style={{ width: `${(data.maintenance / data.totalVessels) * 100}%` }}></div>
            </div>
          </div>
          <div className={styles.legend}>
            <span><i className={styles.legendBlue}></i>En Route ({data.enRoute})</span>
            <span><i className={styles.legendGreen}></i>In Port ({data.inPort})</span>
            <span><i className={styles.legendYellow}></i>Delayed ({data.delayed})</span>
            <span><i className={styles.legendRed}></i>Maintenance ({data.maintenance})</span>
          </div>
        </div>

        {/* CARD 4: Fuel Consumption */}
        <div className={styles.fuelCard}>
          <h3>⛽ Fuel Consumption</h3>
          <div className={styles.fuelStats}>
            <p className={styles.muted}>Average Fleet Fuel</p>
            <div className={styles.fuelNumberRow}>
              <h2>{data.avgFuel}</h2>
              <span className={styles.unit}>%</span>
            </div>
            <p className={styles.mutedSmall}>Across {data.totalVessels} vessels</p>
          </div>
          <div className={styles.fuelMiniBar}>
            <div className={styles.fuelMiniFill} style={{ width: `${data.avgFuel}%` }}></div>
          </div>
          <div className={styles.fuelNote}>
            <span>⚠️ {data.avgFuel < 50 ? 'Low fuel alert on multiple vessels' : 'Fuel levels are optimal'}</span>
          </div>
        </div>

        {/* CARD 5: Shipment Status */}
        <div className={styles.deliveryCard}>
          <div className={styles.deliveryHeaderRow}>
            <div className={styles.deliveryHeaderLeft}>
              <h3 className={styles.deliveryTitle}>Shipment Status</h3>
              <p className={styles.deliverySubtitle}>(Current Month)</p>
              <div className={styles.deliveryValueRow}>
                <span className={styles.deliveryBigNumber}>{completedPercentage}</span>
                <span className={styles.deliveryBigUnit}>%</span>
              </div>
            </div>
            <div className={styles.deliveryGrowthBox}>
              <div className={styles.deliveryGrowthTop}>↑ {data.speedGrowth}%</div>
              <div className={styles.deliveryGrowthBottom}>completion rate</div>
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
          
          {data.avgFuel < 50 && (
            <div className={`${styles.alertBox} ${styles.alertRed}`}>
              <div className={styles.alertInner}>
                <div className={styles.alertLeft}>
                  <div className={styles.alertIcon}>⛽</div>
                  <strong>Low fuel warning</strong>
                </div>
                <p>Average fuel: {data.avgFuel}%</p>
              </div>
            </div>
          )}
          
          <div className={`${styles.alertBox} ${styles.alertYellow}`}>
            <div className={styles.alertInner}>
              <div className={styles.alertLeft}>
                <div className={styles.alertIcon}>📦</div>
                <strong>{data.totalShipments - data.completed} pending deliveries</strong>
              </div>
              <p>{data.completed} completed this month</p>
            </div>
          </div>
          
          <div className={`${styles.alertBox} ${styles.alertBrown}`}>
            <div className={styles.alertInner}>
              <div className={styles.alertLeft}>
                <div className={styles.alertIcon}>🚢</div>
                <strong>{data.enRoute} vessels en route</strong>
              </div>
              <p>Track live on map</p>
            </div>
          </div>
        </div>
      </section>

      {/* Logout Modal */}
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