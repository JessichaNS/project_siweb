'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './map.module.css';
import { notFound } from 'next/navigation';

type Vessel = {
  id: number;
  name: string;
  status: string;
  location: string;
  fuel: number;
};

export default function AdminMapPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selected, setSelected] = useState<Vessel | null>(null);
  const [search, setSearch] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  if (isAdmin === null) {
    return null;
  }

  if (!isAdmin) {
    notFound();
  }

  useEffect(() => {
    async function getVessels() {
      const res = await fetch('/api/map', { cache: 'no-store' });
      const data = await res.json();

      setVessels(data.vessels || []);
      setSelected(data.vessels?.[0] || null);
    }

    getVessels();
  }, []);

  const filtered = vessels.filter((vessel) =>
    vessel.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className={styles.container}>
      <header className={styles.topbar}>
        <img src="/shipylogo.jpeg" alt="Shipy" className={styles.logo} />

<nav className={styles.nav}>
  <Link href="/admin/dashboard" className={styles.navItem}>Dashboard</Link>
  <Link href="/admin/fleet" className={styles.navItem}>Fleet</Link>
  <Link href="/admin/cargo" className={styles.navItem}>Cargo</Link>
  <Link href="/admin/map" className={`${styles.navItem} ${styles.active}`}>Map</Link>
  {/* <Link href="#" className={styles.navItem}>Analytic</Link> */}
</nav>

        <button
  className={styles.editButton}
  onClick={() => setIsEditOpen(true)}
>
  Edit Status Kapal
</button>
        <img src="/profile.png" alt="Admin" className={styles.profile} />
      </header>

      <section className={styles.content}>
        <aside className={styles.sidebar}>
          <h2>ACTIVE FLEET</h2>

          <div className={styles.filters}>
            <button>All</button>
            <button>En Route</button>
          </div>

          <input
            className={styles.search}
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className={styles.list}>
            {filtered.map((vessel) => (
              <div
                key={vessel.id}
                className={`${styles.vesselCard} ${
                  selected?.id === vessel.id ? styles.selected : ''
                }`}
                onClick={() => setSelected(vessel)}
              >
                <h3>{vessel.name}</h3>
                <span>{vessel.status}</span>
                <p>📍 {vessel.location}</p>
                <small>ETA: April 7, 14:30</small>
              </div>
            ))}
          </div>
        </aside>

        <section className={styles.mapArea}>
          <div className={styles.mapBox}>
            <img src="/map siweb baru.png" alt="Map" className={styles.mapImage} />

            <div className={styles.pinRed}></div>
            <div className={styles.pinYellow}></div>
            <div className={styles.pinGreen}></div>
            <div className={styles.pinBlue}></div>
          </div>

          <div className={styles.infoBox}>
            <h2>{selected?.name || 'No Vessel Selected'}</h2>

            <div className={styles.infoGrid}>
              <p>🔴 Sedang dalam pemeliharaan di dermaga Shanghai.</p>
              <p>🟡 Kapal melakukan transit pada Dermaga Papua Barat.</p>
              <p>🔴 Pemeliharaan selesai, kapal berangkat Senin 5 April.</p>
              <p>🔵 Kapal berangkat dari Papua Barat menuju Pasifik.</p>
            </div>
          </div>
        </section>
      </section>
      {isEditOpen && (
  <div className={styles.modalOverlay}>
    <div className={styles.statusModal}>
      <h2>Edit Status Kapal</h2>

      <label>Status kapal sekarang</label>
      <div className={styles.currentStatus}>
        🟢 Sampai di Dermaga Tokyo pada 9 April pukul 04.30 WIB
      </div>

      <label>Status Kapal Baru</label>
      <input
        className={styles.statusInput}
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
        placeholder="Masukkan status baru"
      />

      <button
        className={styles.saveStatus}
        onClick={() => {
          alert('Status kapal berhasil disimpan');
          setIsEditOpen(false);
          setNewStatus('');
        }}
      >
        Simpan
      </button>
    </div>
  </div>
)}
    </main>
  );
}