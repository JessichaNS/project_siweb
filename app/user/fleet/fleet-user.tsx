'use client';

import styles from './fleet.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Vessel = {
  id: number;
  name: string;
  status: string;
  location: string;
  fuel: number;
};

type Toast = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

export default function FleetUserPage() {
  const router = useRouter();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'user') {
      router.push('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    const getVessels = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/vessels?search=${search}&page=${page}&limit=4`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        setVessels(data.vessels || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.log(error);
        showToast('Gagal memuat data', 'error');
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

  const getStatusIcon = (status: string) => {
    if (status === 'In Port') return '';
    if (status === 'En Route') return '';
    if (status === 'Maintenance') return '';
    if (status === 'Delayed') return '';
    return '';
  };

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
            <img src="/shipylogo.jpeg" alt="Shipy Logo" className={styles.logoImage} />
          </div>
        </div>

        <nav className={styles.nav}>
          <Link href="/user/dashboard" className={styles.navItem}>Dashboard</Link>
          <Link href="/user/fleet" className={`${styles.navItem} ${styles.active}`}>Fleet</Link>
          <Link href="/user/cargo" className={styles.navItem}>Cargo</Link>
          <Link href="/user/map" className={styles.navItem}>Map</Link>
        </nav>

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
            <img src="/profile.png" alt="User" className={styles.userImage} />
          </div>
        </div>
      </header>

      <section className={styles.mainGrid}>
        <section className={styles.leftPanel}>
          <div className={styles.leftHeader}>
            <h2>Fleet Directory</h2>
            <input
              className={styles.search}
              placeholder="🔍 Search vessel..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statMiniCard}>
              <span className={styles.statEmoji}>🚢</span>
              <div>
                <strong>{vessels.length}</strong>
                <p>Active Vessels</p>
              </div>
            </div>
            <div className={styles.statMiniCard}>
              <span className={styles.statEmoji}>⛽</span>
              <div>
                <strong>{Math.round(vessels.reduce((acc, v) => acc + v.fuel, 0) / vessels.length || 0)}%</strong>
                <p>Avg Fuel</p>
              </div>
            </div>
            <div className={styles.statMiniCard}>
              <span className={styles.statEmoji}>📍</span>
              <div>
                <strong>{vessels.filter(v => v.status === 'En Route').length}</strong>
                <p>En Route</p>
              </div>
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
                  className={`${styles.vesselCard} ${selectedVessel?.id === vessel.id ? styles.selectedCard : ''}`}
                  onClick={() => setSelectedVessel(vessel)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.vesselIcon}>
                      {getStatusIcon(vessel.status)}
                    </div>
                    <h3>{vessel.name}</h3>
                    <span className={`${styles.badge} ${getBadgeClass(vessel.status)}`}>
                      {vessel.status}
                    </span>
                  </div>

                  <p className={styles.location}>📍 {vessel.location}</p>

                  <div className={styles.fuelRow}>
                    <span>⛽ Fuel Level</span>
                    <span className={styles.fuelPercent}>{vessel.fuel}%</span>
                  </div>

                  <div className={styles.fuelBar}>
                    <div
                      className={styles.fuelFill}
                      style={{ width: `${vessel.fuel}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.pagination}>
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>
              ← Previous
            </button>
            <span className={styles.pageInfo}>{page} / {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
              Next →
            </button>
          </div>
        </section>

        <aside className={styles.rightPanel}>
          {selectedVessel ? (
            <div className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <div className={styles.detailIcon}>
                  {getStatusIcon(selectedVessel.status)}
                </div>
                <h2>{selectedVessel.name}</h2>
                <span className={`${styles.detailBadge} ${getBadgeClass(selectedVessel.status)}`}>
                  {selectedVessel.status}
                </span>
              </div>

              <div className={styles.detailInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>📍 Current Location</span>
                  <span className={styles.infoValue}>{selectedVessel.location}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>⛽ Fuel Status</span>
                  <div className={styles.infoFuel}>
                    <span className={styles.infoValue}>{selectedVessel.fuel}%</span>
                    <div className={styles.detailFuelBar}>
                      <div style={{ width: `${selectedVessel.fuel}%` }} />
                    </div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>🚢 Vessel ID</span>
                  <span className={styles.infoValue}>#SHIP-{selectedVessel.id}</span>
                </div>
              </div>

              <div className={styles.funFact}>
                <div className={styles.funFactIcon}>💡</div>
                <div className={styles.funFactText}>
                  <strong>Did you know?</strong>
                  <p>This vessel is currently {selectedVessel.status.toLowerCase()} and has {selectedVessel.fuel}% fuel remaining.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyDetail}>
              <div className={styles.emptyIcon}>🚢</div>
              <h3>No Vessel Selected</h3>
              <div className={styles.emptyTips}>
              </div>
            </div>
          )}
        </aside>
      </section>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsLogoutModalOpen(false)}>
          <div className={styles.logoutModal} onClick={(e) => e.stopPropagation()}>
            <h2>🚪 Konfirmasi Logout</h2>
            <p>Apakah Anda yakin ingin keluar?</p>
            <div className={styles.logoutButtons}>
              <button className={styles.cancelLogout} onClick={() => setIsLogoutModalOpen(false)}>
                Tidak
              </button>
              <button className={styles.confirmLogout} onClick={handleLogout}>
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          <span>{toast.message}</span>
          <button className={styles.toastClose} onClick={() => setToast({ show: false, message: '', type: 'success' })}>
            ×
          </button>
        </div>
      )}
    </main>
  );
}