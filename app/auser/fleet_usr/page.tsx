'use client';

import { useEffect, useState } from 'react';
import styles from './fleetusr.module.css';
import Link from 'next/link';

type Vessel = {
  id: number;
  name: string;
  status: string;
  location: string;
  fuel: number;
};

export default function FleetPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const getVessels = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/vessels?search=${search}&page=${page}&limit=4`,
          {
            cache: 'no-store',
          }
        );

        const data = await res.json();

        setVessels(data.vessels || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    getVessels();
  }, [search, page]);

  const getBadgeClass = (status: string) => {
    if (status === 'In Port') return styles.inPort;
    if (status === 'En Route') return styles.enRoute;
    if (status === 'Maintenance') return styles.maintenance;
    if (status === 'Delayed') return styles.delayed;
    return '';
  };

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

              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className={styles.vesselGrid}>
            {loading ? (
              <p className={styles.loadingText}>Loading vessels...</p>
            ) : vessels.length === 0 ? (
              <p className={styles.loadingText}>No vessels found</p>
            ) : (
              vessels.map((vessel) => (
                <div
                  key={vessel.id}
                  className={`${styles.vesselCard} ${
                    vessel.status === 'En Route'
                      ? styles.highlightCard
                      : ''
                  }`}
                >
                  <div className={styles.cardTop}>
                    <h3>{vessel.name}</h3>

                    <span
                      className={`${styles.badge} ${getBadgeClass(
                        vessel.status
                      )}`}
                    >
                      {vessel.status}
                    </span>
                  </div>

                  <p className={styles.location}>
                    📍 {vessel.location}
                  </p>

                  <div className={styles.fuelRow}>
                    <span>Fuel Level</span>
                    <span>{vessel.fuel}%</span>
                  </div>

                  <div className={styles.fuelBar}>
                    <div
                      className={styles.fuelFill}
                      style={{ width: `${vessel.fuel}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.pagination}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              ←
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              →
            </button>
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
              <h2>MV Pacific Star</h2>
              <span className={styles.smallBadge}>EN ROUTE</span>
            </div>

            <div className={styles.detailLocationBlock}>
              <div className={styles.bigPin}>📍</div>

              <div>
                <p className={styles.detailLocation}>
                  Pacific Ocean
                </p>

                <p className={styles.detailEta}>
                  ETA: April 7, 14:30
                </p>
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

            <button className={styles.detailButton}>
              View Detail →
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}