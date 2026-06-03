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

export default function AdminMapPage() {
  const router = useRouter();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selected, setSelected] = useState<Vessel | null>(null);
  const [search, setSearch] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const details = getVesselDetails(selected);

  useEffect(() => {
    async function getVessels() {
      try {
        const res = await fetch('/api/map', { cache: 'no-store' });
        const data = await res.json();
        setVessels(data.vessels || []);
        if (data.vessels?.[0]) {
          setSelected(data.vessels[0]);
          setNewStatus(data.vessels[0].status);
        }
      } catch (error) {
        console.error('Error fetching vessels:', error);
        showToast('Gagal memuat data kapal', 'error');
      }
    }
    getVessels();
  }, []);

  useEffect(() => {
    if (selected) {
      setNewStatus(selected.status);
    }
  }, [selected]);

  const filtered = vessels.filter((vessel) =>
    vessel.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateStatus = async () => {
    if (!selected) {
      showToast('Tidak ada kapal yang dipilih', 'error');
      return;
    }

    if (!newStatus.trim()) {
      showToast('Status kapal tidak boleh kosong!', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/map', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selected.id,
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setVessels(prevVessels =>
          prevVessels.map(vessel =>
            vessel.id === selected.id
              ? { ...vessel, status: newStatus }
              : vessel
          )
        );
        setSelected(prev => prev ? { ...prev, status: newStatus } : null);
        
        showToast(`✅ Status kapal "${selected.name}" berhasil diperbarui menjadi "${newStatus}"`, 'success');
        setIsEditOpen(false);
      } else {
        showToast(data.error || 'Gagal memperbarui status kapal', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Terjadi kesalahan saat menghubungi server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Hapus session/token jika ada
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Redirect ke halaman login
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
                <span className={styles.infoLabel}>📍 Lokasi Kapal Saat Ini</span>
                <span className={styles.infoValue}>{details?.currentLocation || '-'}</span>
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
        <div className={styles.modalOverlay} onClick={() => setIsEditOpen(false)}>
          <div className={styles.statusModal} onClick={(e) => e.stopPropagation()}>
            <h2>Edit Status Kapal</h2>

            <label>Status kapal sekarang</label>
            <div className={styles.currentStatus}>
              {selected?.status || 'Tidak ada kapal dipilih'}
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
              onClick={handleUpdateStatus}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsLogoutModalOpen(false)}>
          <div className={styles.logoutModal} onClick={(e) => e.stopPropagation()}>
            <h2>Konfirmasi Logout</h2>
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