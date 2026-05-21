'use client';

import styles from './fleetadm.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Vessel = {
  id: number;
  name: string;
  status: string;
  location: string;
  fuel: number;
};

export default function FleetAdminPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const getVessels = async () => {
      try {
      const res = await fetch(
  `/api/vessels?search=${search}&page=${page}&limit=4`,
  {
    cache: 'force-cache',
  }
);
        const data = await res.json();

        setVessels(data.vessels || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.log(error);
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
            {vessels.length === 0 ? (
              <p className={styles.loadingText}>No vessels found</p>
            ) : (
              vessels.map((vessel) => (
                <div key={vessel.id} className={styles.vesselCard}>
                  <div className={styles.cardTop}>
                    <h3>{vessel.name}</h3>
                    <span className={`${styles.badge} ${getBadgeClass(vessel.status)}`}>
                      {vessel.status}
                    </span>
                  </div>

                  <p className={styles.location}>📍 {vessel.location}</p>

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