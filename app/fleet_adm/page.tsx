import styles from './fleetadm.module.css';
import Link from 'next/link';

export default function FleetAdminPage() {
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

            <Link href="/fleet_adm" className={`${styles.navItem} ${styles.active}`}>
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
          <div className={styles.userBox}>
            <div className={styles.userIcon}>
              <img
                src="/profile.png"
                alt="Admin"
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

            <div className={styles.vesselCard}>
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
          <div className={styles.emptyDetailCard}>
            <p>
              No Vessel Selected
              <br />
              Select a vessel to
              <br />
              view details
            </p>
          </div>

          <div className={styles.bottomButtons}>
            <button className={styles.actionButton}>Add Vessels</button>
            <button className={styles.actionButton}>Edit Vessels</button>
          </div>
        </aside>
      </section>
    </main>
  );
}