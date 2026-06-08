'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './map.module.css';

type Vessel = {
  id: number;
  name: string;
  status: string;
  location: string;
  fuel: number;
};

type VesselDetail = {
  captain: string;
  destination: string;
  fuel: number;
  speed: string;
  pinColor: string;
  position: {
    top: string;
    left?: string;
    right?: string;
  };
};

const dummyDetails: Record<string, Omit<VesselDetail, 'pinColor' | 'fuel'>> = {
  'KM Kelud': {
    captain: 'Capt. Herman Prasetyo',
    destination: 'Pelabuhan Tanjung Priok, Jakarta',
    speed: '18.5 knots',
    position: { top: '62%', left: '20%' },
  },
  'KM Dorolonda': {
    captain: 'Capt. Budi Santoso',
    destination: 'Pelabuhan Tanjung Perak, Surabaya',
    speed: '16.2 knots',
    position: { top: '55%', right: '9%' },
  },
  'KM Gunung Dempo': {
    captain: 'Capt. Ahmad Fauzi',
    destination: 'Pelabuhan Belawan, Medan',
    speed: '19.0 knots',
    position: { top: '42%', right: '12%' },
  },
  'KM Sinabung': {
    captain: 'Capt. Yusuf Wijaya',
    destination: 'Pelabuhan Soekarno-Hatta, Makassar',
    speed: '15.8 knots',
    position: { top: '70%', left: '8%' },
  },
};

const getColorByStatus = (status: string): string => {
  switch (status) {
    case 'En Route':
      return '#2ed573'; // Hijau
    case 'In Port':
      return '#ffa502'; // Oranye
    case 'Maintenance':
      return '#ff4757'; // Merah
    default:
      return '#2e7dd1'; // Biru bawaan asli
  }
};

const getVesselDetails = (vessel: Vessel | null): VesselDetail | null => {
  if (!vessel) return null;
  
  const baseDetail = dummyDetails[vessel.name] || {
    captain: 'Capt. John Doe',
    destination: 'Pelabuhan Domestik, Indonesia',
    speed: '17.0 knots',
    position: { top: '50%', left: '50%' },
  };

  return {
    ...baseDetail,
    fuel: vessel.fuel || 80,
    pinColor: getColorByStatus(vessel.status),
  };
};

export default function AdminMapPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selected, setSelected] = useState<Vessel | null>(null);
  const [search, setSearch] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const details = getVesselDetails(selected);

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
          <Link href="/admin/dashboard" className={styles.navItem}>Dashboard</Link>
          <Link href="/admin/fleet" className={styles.navItem}>Fleet</Link>
          <Link href="/admin/cargo" className={styles.navItem}>Cargo</Link>
          <Link href="/admin/map" className={`${styles.navItem} ${styles.active}`}>Map</Link>
          <Link href="/admin/analytic" className={styles.navItem}>Analytic</Link>
        </nav>

        <div className={styles.rightNavSection}>
          <button
            className={styles.editButton}
            onClick={() => setIsEditOpen(true)}
          >
            Edit Status Kapal
          </button>

          <div className={styles.userBox}>
            <div className={styles.userIcon}>
              <img
                src="/profile.png"
                alt="User"
                className={styles.userImage}
              />
            </div>
          </div>
        </div>
      </header>

      <section className={styles.content}>
        <aside className={styles.sidebar}>
          <h2>ACTIVE FLEET</h2>

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
                <span style={{ backgroundColor: getColorByStatus(vessel.status) }}>
                  {vessel.status}
                </span>
                <h3>{vessel.name}</h3>
                <p>📍 {vessel.location}</p>
                <small>ETA: April 7, 14:30</small>
              </div>
            ))}
          </div>
        </aside>

        <section className={styles.mapArea}>
          <div className={styles.mapBox}>
            <img src="/map siweb baru.png" alt="Map" className={styles.mapImage} />

            {details && (
              <div
                className={styles.radarPin}
                style={{
                  top: details.position.top,
                  left: details.position.left,
                  right: details.position.right,
                  backgroundColor: details.pinColor,
                  color: details.pinColor,
                }}
              >
                <div className={styles.radarPinRing} style={{ borderColor: details.pinColor }}></div>
              </div>
            )}
          </div>

          <div className={styles.infoBox}>
            <h2>Detail Kapal: {selected?.name || 'No Vessel Selected'}</h2>

            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>🧑‍✈️ Kapten</span>
                <span className={styles.infoValue}>{details?.captain || '-'}</span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>📍 Tujuan</span>
                <span className={styles.infoValue}>{details?.destination || '-'}</span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>⛽ Bensin (Fuel)</span>
                <div className={styles.fuelContainer}>
                  <span className={styles.infoValue}>{details?.fuel || 0}%</span>
                  <div className={styles.miniFuelBar}>
                    <div
                      className={styles.miniFuelFill}
                      style={{ width: `${details?.fuel || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>⚡ Kecepatan</span>
                <span className={styles.infoValue}>{details?.speed || '-'}</span>
              </div>
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
              🟢 {selected?.status || 'Tidak ada status'} - {selected?.location}
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