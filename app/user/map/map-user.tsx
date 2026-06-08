'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  currentLocation: string;
  speed: string;
  pinColor: string;
  position: {
    top: string;
    left?: string;
    right?: string;
  };
};

type Toast = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

const dummyDetails: Record<string, VesselDetail> = {
  'KM Kelud': {
    captain: 'Capt. Herman Prasetyo',
    destination: 'Pelabuhan Tanjung Priok, Jakarta',
    currentLocation: 'Selat Sunda, 15 mil dari Pelabuhan Merak',
    speed: '18.5 knots',
    pinColor: '#2ed573',
    position: { top: '62%', left: '20%' },
  },
  'KM Dorolonda': {
    captain: 'Capt. Budi Santoso',
    destination: 'Pelabuhan Tanjung Perak, Surabaya',
    currentLocation: 'Laut Jawa, 30 mil dari Surabaya',
    speed: '16.2 knots',
    pinColor: '#ffa502',
    position: { top: '55%', right: '9%' },
  },
  'KM Gunung Dempo': {
    captain: 'Capt. Ahmad Fauzi',
    destination: 'Pelabuhan Belawan, Medan',
    currentLocation: 'Selat Malaka, mendekati Pelabuhan Belawan',
    speed: '19.0 knots',
    pinColor: '#ff4757',
    position: { top: '42%', right: '12%' },
  },
  'KM Sinabung': {
    captain: 'Capt. Yusuf Wijaya',
    destination: 'Pelabuhan Soekarno-Hatta, Makassar',
    currentLocation: 'Laut Flores, 50 mil dari Makassar',
    speed: '15.8 knots',
    pinColor: '#45aaff',
    position: { top: '70%', left: '8%' },
  },
  'MV Pasific Star': {
    captain: 'Capt. Michael Johnson',
    destination: 'Pelabuhan Tanjung Priok, Jakarta',
    currentLocation: 'Samudra Pasifik, 200 mil dari Indonesia',
    speed: '22.5 knots',
    pinColor: '#ff6b6b',
    position: { top: '35%', right: '25%' },
  },
  'KM Nusantara': {
    captain: 'Capt. Surya Dharma',
    destination: 'Pelabuhan Benoa, Denpasar',
    currentLocation: 'Laut Bali, 30 mil dari Denpasar',
    speed: '14.2 knots',
    pinColor: '#4ecdc4',
    position: { top: '75%', left: '35%' },
  },
};

const getVesselDetails = (vessel: Vessel | null): VesselDetail | null => {
  if (!vessel) return null;
  return dummyDetails[vessel.name] || {
    captain: 'Capt. John Doe',
    destination: 'Pelabuhan Domestik, Indonesia',
    currentLocation: 'Laut Indonesia',
    speed: '17.0 knots',
    pinColor: '#ff4757',
    position: { top: '50%', left: '50%' },
  };
};

export default function UserMapPage() {
  const router = useRouter();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selected, setSelected] = useState<Vessel | null>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const details = getVesselDetails(selected);

  // Cek role user
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'user') {
      router.push('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    async function getVessels() {
      try {
        const res = await fetch('/api/map', { cache: 'no-store' });
        const data = await res.json();
        setVessels(data.vessels || []);
        if (data.vessels?.[0]) {
          setSelected(data.vessels[0]);
        }
      } catch (error) {
        console.error('Error fetching vessels:', error);
        showToast('Gagal memuat data kapal', 'error');
      }
    }
    getVessels();
  }, []);

  const filtered = vessels.filter((vessel) =>
    vessel.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    router.push('/login');
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
          <Link href="/user/dashboard" className={styles.navItem}>Dashboard</Link>
          <Link href="/user/fleet" className={styles.navItem}>Fleet</Link>
          <Link href="/user/cargo" className={styles.navItem}>Cargo</Link>
          <Link href="/user/map" className={`${styles.navItem} ${styles.active}`}>Map</Link>
        </nav>

        <div className={styles.rightNavSection}>
          <div className={styles.userBox}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>User</span>
              <span className={styles.userRole}>View Only</span>
            </div>
            <div 
              className={styles.userIcon}
              onClick={() => setIsLogoutModalOpen(true)}
              style={{ cursor: 'pointer' }}
            >
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
            placeholder="🔍 Search vessel..."
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
                <span className={styles.statusBadge}>{vessel.status}</span>
                <p>📍 {vessel.location}</p>
                <small>⚡ Fuel: {vessel.fuel}%</small>
              </div>
            ))}
          </div>

          <div className={styles.fleetStats}>
            <div className={styles.statItem}>
  <span>En Route</span>
  <strong>{vessels.filter(v => v.status === 'En Route').length}</strong>
</div>
<div className={styles.statItem}>
  <span>In Port</span>
  <strong>{vessels.filter(v => v.status === 'In Port').length}</strong>
</div>
<div className={styles.statItem}>
  <span>Maintenance</span>
  <strong>{vessels.filter(v => v.status === 'Maintenance').length}</strong>
</div>
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
                <div className={styles.radarPinRing}></div>
              </div>
            )}
          </div>

          <div className={styles.infoBox}>
            <h2>📊 Detail Kapal: {selected?.name || 'No Vessel Selected'}</h2>

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
                <span className={styles.infoLabel}>📍 Lokasi Kapal Saat Ini</span>
                <span className={styles.infoValue}>{details?.currentLocation || '-'}</span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>⚡ Kecepatan</span>
                <span className={styles.infoValue}>{details?.speed || '-'}</span>
              </div>
            </div>

            {selected && (
              <div className={styles.vesselStatusNote}>
                <div className={styles.noteIcon}>ℹ️</div>
                <div className={styles.noteText}>
                  <strong>Status: {selected.status}</strong>
                  <p>Vessel ini sedang {selected.status === 'En Route' ? 'berlayar menuju tujuan' : 
                     selected.status === 'In Port' ? 'bersandar di pelabuhan' :
                     selected.status === 'Maintenance' ? 'menjalani perawatan' : 'mengalami keterlambatan'}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </section>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsLogoutModalOpen(false)}>
          <div className={styles.logoutModal} onClick={(e) => e.stopPropagation()}>
            <h2>🚪 Konfirmasi Logout</h2>
            <p>Apakah Anda yakin ingin keluar?</p>
            <div className={styles.logoutButtons}>
              <button 
                className={styles.cancelLogout}
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Tidak
              </button>
              <button 
                className={styles.confirmLogout}
                onClick={handleLogout}
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          <span>{toast.message}</span>
          <button 
            className={styles.toastClose}
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}