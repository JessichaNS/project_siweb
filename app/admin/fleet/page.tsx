'use client';

import styles from './fleetadm.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';

type Vessel = {
  id: number;
  name: string;
  status: string;
  location: string;
  fuel: number;
};

export default function FleetAdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    status: '',
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin !== true) return;

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
  }, [search, page, isAdmin]);

  const getBadgeClass = (status: string) => {
    if (status === 'In Port') return styles.inPort;
    if (status === 'En Route') return styles.enRoute;
    if (status === 'Maintenance') return styles.maintenance;
    if (status === 'Delayed') return styles.delayed;
    return '';
  };

  if (isAdmin === null) {
    return null;
  }

  if (!isAdmin) {
    notFound();
  }

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
          <Link href="/admin/dashboard" className={styles.navItem}>
            Dashboard
          </Link>

          <Link
            href="/admin/fleet"
            className={`${styles.navItem} ${styles.active}`}
          >
            Fleet
          </Link>

          <Link href="/admin/cargo" className={styles.navItem}>
            Cargo
          </Link>

<Link href="/admin/map" className={styles.navItem}>
  Map
</Link>

          {/* <Link href="#" className={styles.navItem}>
            Analytic
          </Link> */}
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
            {loading ? (
              <p className={styles.loadingText}>Loading vessels...</p>
            ) : vessels.length === 0 ? (
              <p className={styles.loadingText}>No vessels found</p>
            ) : (
              vessels.map((vessel) => (
  <div
    key={vessel.id}
    className={`${styles.vesselCard}`}
    onClick={() => {
      setSelectedVessel(vessel);
    }}
  >
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
          {selectedVessel ? (
  <div className={styles.emptyDetailCard}>
    <h2>{selectedVessel.name}</h2>
    <p>📍 {selectedVessel.location}</p>
    <p>Status: {selectedVessel.status}</p>
    <p>Fuel: {selectedVessel.fuel}%</p>

    <div className={styles.fuelBar}>
      <div
        className={styles.fuelFill}
        style={{ width: `${selectedVessel.fuel}%` }}
      />
    </div>
  </div>
) : (
  <div className={styles.emptyDetailCard}>
    <p>
      No Vessel Selected
      <br />
      Select a vessel to
      <br />
      view details
    </p>
  </div>
)}

          <div className={styles.bottomButtons}>
            <button className={styles.actionButton}>Add Vessels</button>
            <button className={styles.actionButton}>Edit Vessels</button>
          </div>
        </aside>
      </section>
    </main>
  );
}