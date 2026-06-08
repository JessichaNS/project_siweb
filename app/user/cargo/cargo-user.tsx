'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './cargo.module.css';

type Cargo = {
  id: number;
  no_resi: string;
  nama_pengirim: string;
  nama_penerima: string;
  no_telepon: string;
  kota_asal: string;
  kota_tujuan: string;
  jenis_pengiriman: string;
  status: string;
  tarif: number;
  catatan_barang: string;
};

type Toast = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

export default function CargoUserPage() {
  const router = useRouter();
  const [cargo, setCargo] = useState<Cargo[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Cargo | null>(null);
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

  const getCargo = async () => {
    try {
      const res = await fetch(
        `/api/pengiriman?search=${search}&page=${page}&limit=4`
      );
      const data = await res.json();
      setCargo(data.pengiriman || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching cargo:', error);
      showToast('Gagal memuat data cargo', 'error');
    }
  };

  useEffect(() => {
    getCargo();
  }, [search, page]);

  const getStatusClass = (status: string) => {
    if (status === 'Diproses') return styles.statusDiproses;
    if (status === 'Dikirim') return styles.statusDikirim;
    if (status === 'Selesai') return styles.statusSelesai;
    if (status === 'Pending') return styles.statusPending;
    return '';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Diproses') return '';
    if (status === 'Dikirim') return '';
    if (status === 'Selesai') return '';
    if (status === 'Pending') return '';
    return '';
  };

  const getJenisIcon = (jenis: string) => {
    if (jenis === 'Biasa') return '📦';
    if (jenis === 'Cepat') return '⚡';
    if (jenis === 'VVIP') return '💎';
    return '📦';
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const totalShipments = cargo.length;
  const totalValue = cargo.reduce((sum, item) => sum + item.tarif, 0);
  const completedShipments = cargo.filter(item => item.status === 'Selesai').length;
  const inTransit = cargo.filter(item => item.status === 'Dikirim').length;

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
          <Link href="/user/fleet" className={styles.navItem}>Fleet</Link>
          <Link href="/user/cargo" className={`${styles.navItem} ${styles.active}`}>Cargo</Link>
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
            <h2>Cargo Shipments</h2>
            <input
              className={styles.search}
              placeholder="🔍 Search by resi / pengirim / penerima..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statMiniCard}>
              <span className={styles.statEmoji}>📦</span>
              <div>
                <strong>{totalShipments}</strong>
                <p>Total Shipments</p>
              </div>
            </div>
            <div className={styles.statMiniCard}>
              <span className={styles.statEmoji}>💰</span>
              <div>
                <strong>Rp {totalValue.toLocaleString()}</strong>
                <p>Total Value</p>
              </div>
            </div>
            <div className={styles.statMiniCard}>
              <span className={styles.statEmoji}>✅</span>
              <div>
                <strong>{completedShipments}</strong>
                <p>Completed</p>
              </div>
            </div>
            <div className={styles.statMiniCard}>
              <span className={styles.statEmoji}>🚚</span>
              <div>
                <strong>{inTransit}</strong>
                <p>In Transit</p>
              </div>
            </div>
          </div>

          <div className={styles.cargoGrid}>
            {cargo.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📭</div>
                <p>No cargo shipments found</p>
                <span>Try adjusting your search</span>
              </div>
            ) : (
              cargo.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.card} ${selected?.id === item.id ? styles.selectedCard : ''}`}
                  onClick={() => setSelected(item)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.resiInfo}>
                      <span className={styles.resiIcon}></span>
                      <h3>{item.no_resi}</h3>
                    </div>
                    <span className={`${styles.badge} ${getStatusClass(item.status)}`}>
                      {getStatusIcon(item.status)} {item.status}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.shipper}>
                      <span className={styles.label}>From:</span> {item.nama_pengirim}
                    </p>
                    <p className={styles.receiver}>
                      <span className={styles.label}>To:</span> {item.nama_penerima}
                    </p>
                    <div className={styles.route}>
                      <span className={styles.routeOrigin}>{item.kota_asal}</span>
                      <span className={styles.routeArrow}>→</span>
                      <span className={styles.routeDest}>{item.kota_tujuan}</span>
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.shipmentType}>{getJenisIcon(item.jenis_pengiriman)} {item.jenis_pengiriman}</span>
                      <strong className={styles.price}>Rp {item.tarif.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.pagination}>
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>← Previous</button>
            <span className={styles.pageInfo}>{page} / {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next →</button>
          </div>
        </section>

        <aside className={styles.rightPanel}>
          {selected ? (
            <div className={styles.detailCard}>
              <div className={styles.detailHeader}>
                <div className={styles.detailResiIcon}>📄</div>
                <h2>{selected.no_resi}</h2>
                <span className={`${styles.detailBadge} ${getStatusClass(selected.status)}`}>
                  {getStatusIcon(selected.status)} {selected.status}
                </span>
              </div>

              <div className={styles.detailInfo}>
                <div className={styles.infoSection}>
                  <h4>📋 Shipment Details</h4>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Pengirim</span>
                    <span className={styles.infoValue}>{selected.nama_pengirim}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Penerima</span>
                    <span className={styles.infoValue}>{selected.nama_penerima}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>No Telepon</span>
                    <span className={styles.infoValue}>{selected.no_telepon}</span>
                  </div>
                </div>

                <div className={styles.infoSection}>
                  <h4>📍 Route Information</h4>
                  <div className={styles.routeDetail}>
                    <div className={styles.routePoint}>
                      <div className={styles.routeDotAsal}></div>
                      <div>
                        <span className={styles.routeLabel}>Asal</span>
                        <span className={styles.routeValue}>{selected.kota_asal}</span>
                      </div>
                    </div>
                    <div className={styles.routeLine}></div>
                    <div className={styles.routePoint}>
                      <div className={styles.routeDotTujuan}></div>
                      <div>
                        <span className={styles.routeLabel}>Tujuan</span>
                        <span className={styles.routeValue}>{selected.kota_tujuan}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.infoSection}>
                  <h4>💰 Financial & Service</h4>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Jenis Pengiriman</span>
                    <span className={styles.infoValue}>
                      {getJenisIcon(selected.jenis_pengiriman)} {selected.jenis_pengiriman}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Tarif</span>
                    <span className={styles.infoValue}>Rp {selected.tarif.toLocaleString()}</span>
                  </div>
                </div>

                {selected.catatan_barang && (
                  <div className={styles.infoSection}>
                    <h4>📝 Notes</h4>
                    <div className={styles.noteBox}>
                      <p>{selected.catatan_barang}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.funFact}>
                <div className={styles.funFactIcon}>💡</div>
                <div className={styles.funFactText}>
                  <strong>Shipment Info</strong>
                  <p>This shipment is currently <strong>{selected.status.toLowerCase()}</strong> with {selected.jenis_pengiriman.toLowerCase()} service type.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyDetail}>
              <div className={styles.emptyIcon}>📦</div>
              <h3>No Cargo Selected</h3>
              <div className={styles.emptyTips}>
              </div>
            </div>
          )}
        </aside>
      </section>

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

      {toast.show && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          <span>{toast.message}</span>
          <button className={styles.toastClose} onClick={() => setToast({ show: false, message: '', type: 'success' })}>×</button>
        </div>
      )}
    </main>
  );
}