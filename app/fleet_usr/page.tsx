import styles from './fleetusr.module.css';
import Link from 'next/link';

export default function FleetPage() {
  return (
    <main className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.logoBox}>
          <div className={styles.logo}>
            <img
              src="/shipylogo.jpeg"
              alt="Shipy Logo"
              className={styles.logoImage}
            />
          </div>
        </div>

        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navItem}>
            Dashboard
          </Link>

          <Link href="/fleet_usr" className={`${styles.navItem} ${styles.active}`}>
            Fleet
          </Link>

          <Link href="#" className={styles.navItem}>
            Map
          </Link>

          <Link href="#" className={styles.navItem}>
            Analytic
          </Link>
        </nav>

        <div className={styles.topRight}>
          <div className={styles.notifyIcon}></div>

          <div className={styles.userBox}>
            <div className={styles.userIcon}>
              <img
                src="/profile.png"
                alt="Profile"
                className={styles.userImage}
              />
            </div>
          </div>
        </div>
      </header>

      <section className={styles.mainGrid}>
        <section className={styles.leftPanel}>
          <div className={styles.leftHeader}>
            <h2>Vessel List</h2>

            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>⌕</span>
              <input type="text" placeholder="Search" />
            </div>
          </div>

          <div className={styles.vesselGrid}>
            <div className={styles.vesselCard}>
              <div className={styles.cardTop}>
                <h3>SS Atlantic Wave</h3>
                <span className={`${styles.badge} ${styles.inPort}`}>In Port</span>
              </div>
              <p className={styles.location}>📍 Tokyo Port</p>
              <div className={styles.fuelRow}>
                <span>Fuel Level</span>
                <span>65%</span>
              </div>
              <div className={styles.fuelBar}>
                <div className={styles.fuelFill} style={{ width: '65%' }}></div>
              </div>
            </div>

            <div className={`${styles.vesselCard} ${styles.highlightCard}`}>
              <div className={styles.cardTop}>
                <h3>MV Pasific Star</h3>
                <span className={`${styles.badge} ${styles.enRoute}`}>En Route</span>
              </div>
              <p className={styles.location}>📍 Pacific Ocean</p>
              <p className={styles.eta}>ETA: April 7, 14:30</p>
              <div className={styles.fuelRow}>
                <span>Fuel Level</span>
                <span>90%</span>
              </div>
              <div className={styles.fuelBar}>
                <div className={styles.fuelFill} style={{ width: '90%' }}></div>
              </div>
            </div>

            <div className={styles.vesselCard}>
              <div className={styles.cardTop}>
                <h3>MV Ocean Pioneer</h3>
                <span className={`${styles.badge} ${styles.maintenance}`}>Maintenance</span>
              </div>
              <p className={styles.location}>📍 Shangai Port</p>
              <div className={styles.fuelRow}>
                <span>Fuel Level</span>
                <span>35%</span>
              </div>
              <div className={styles.fuelBar}>
                <div className={styles.fuelFill} style={{ width: '35%' }}></div>
              </div>
            </div>

            <div className={styles.vesselCard}>
              <div className={styles.cardTop}>
                <h3>SS Northern Light</h3>
                <span className={`${styles.badge} ${styles.delayed}`}>Delayed</span>
              </div>
              <p className={styles.location}>📍 Indian Ocean</p>
              <p className={styles.eta}>ETA: April 20, 16:00</p>
              <div className={styles.fuelRow}>
                <span>Fuel Level</span>
                <span>70%</span>
              </div>
              <div className={styles.fuelBar}>
                <div className={styles.fuelFill} style={{ width: '70%' }}></div>
              </div>
            </div>

            <div className={styles.vesselCard}>
              <div className={styles.cardTop}>
                <h3>MV Cargo Express</h3>
                <span className={`${styles.badge} ${styles.enRoute}`}>En Route</span>
              </div>
              <p className={styles.location}>📍 Indian Ocean</p>
              <p className={styles.eta}>ETA: April 9, 21:30</p>
              <div className={styles.fuelRow}>
                <span>Fuel Level</span>
                <span>50%</span>
              </div>
              <div className={styles.fuelBar}>
                <div className={styles.fuelFill} style={{ width: '50%' }}></div>
              </div>
            </div>

            <div className={styles.vesselCard}>
              <div className={styles.cardTop}>
                <h3>SS Thunder Bay</h3>
              </div>
              <p className={styles.location}>📍 South China Sea</p>
              <p className={styles.eta}>ETA: April 7, 22:45</p>
              <div className={styles.fuelRow}>
                <span>Fuel Level</span>
                <span>85%</span>
              </div>
              <div className={styles.fuelBar}>
                <div className={styles.fuelFill} style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>
        </section>

        <aside className={styles.rightPanel}>
          <div className={styles.infoCard}>
            <h2>Route Overview</h2>
            <p className={styles.routeText}>Tokyo → Los Angeles</p>

            <div className={styles.routeLoadRow}>
              <span>Cargo Load</span>
              <span>80%</span>
            </div>

            <div className={styles.routeBar}>
              <div className={styles.routeFill}></div>
            </div>

            <div className={styles.routeMeta}>
              <p>Distance Remaining: 1,200 nm</p>
              <p>ETA: April 7, 14:30</p>
            </div>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.detailTop}>
              <h2>MV Pasific Star</h2>
              <span className={styles.smallBadge}>EN ROUTE</span>
            </div>

            <div className={styles.detailLocationBlock}>
              <div className={styles.bigPin}>📍</div>
              <div>
                <p className={styles.detailLocation}>Pacific Ocean</p>
                <p className={styles.detailEta}>ETA: April 7, 14:30</p>
              </div>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span>Speed</span>
                <strong>30 knots</strong>
              </div>

              <div className={styles.statBox}>
                <span>Current Position</span>
                <strong>0.0000 ° N, 160.0000 ° W</strong>
              </div>
            </div>

            <button className={styles.detailButton}>View Detail →</button>
          </div>
        </aside>
      </section>
    </main>
  );
}