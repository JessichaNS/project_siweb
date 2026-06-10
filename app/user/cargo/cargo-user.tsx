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
  berat?: number;
  catatan_barang: string;
};

type Summary = {
  total_shipments: number;
  total_value: number;
  completed: number;
  in_transit: number;
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [summary, setSummary] = useState<Summary>({
    total_shipments: 0,
    total_value: 0,
    completed: 0,
    in_transit: 0,
  });

  const [newCargo, setNewCargo] = useState({
    nama_pengirim: '',
    nama_penerima: '',
    no_telepon: '',
    kota_asal: '',
    kota_tujuan: '',
    jenis_pengiriman: 'Biasa',
    berat: '',
    tarif: 0,
    catatan_barang: '',
  });

  // Hitung tarif otomatis
  useEffect(() => {
    const beratNum = Number(newCargo.berat) || 0;
    let hargaPerKg = 10000;
    if (newCargo.jenis_pengiriman === 'Cepat') hargaPerKg = 15000;
    else if (newCargo.jenis_pengiriman === 'VVIP') hargaPerKg = 20000;
    const totalTarif = beratNum * hargaPerKg;
    setNewCargo((prev) => prev.tarif !== totalTarif ? { ...prev, tarif: totalTarif } : prev);
  }, [newCargo.berat, newCargo.jenis_pengiriman]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'user') {
      router.push('/login');
      return;
    }
  }, [router]);

  // ✅ getCargo bersih — ambil juga summary dari response
  const getCargo = async () => {
    try {
      const res = await fetch(`/api/pengiriman?search=${search}&page=${page}&limit=4`);
      const data = await res.json();
      setCargo(data.pengiriman || []);
      setTotalPages(data.totalPages || 1);

      // ✅ Set summary dari database
      if (data.summary) setSummary(data.summary);

      if (selected) {
        const updatedSelected = data.pengiriman?.find((c: Cargo) => c.id === selected.id);
        if (updatedSelected) setSelected(updatedSelected);
      }
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

  // ✅ Validasi ada di sini, bukan di getCargo
  const handleAddCargo = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: Record<string, string> = {};
    if (!newCargo.nama_pengirim.trim()) validationErrors.nama_pengirim = "Nama pengirim wajib diisi";
    if (!newCargo.nama_penerima.trim()) validationErrors.nama_penerima = "Nama penerima wajib diisi";
    if (!newCargo.no_telepon.trim()) validationErrors.no_telepon = "Nomor telepon wajib diisi";
    if (!newCargo.kota_asal.trim()) validationErrors.kota_asal = "Kota asal wajib diisi";
    if (!newCargo.kota_tujuan.trim()) validationErrors.kota_tujuan = "Kota tujuan wajib diisi";
    if (!newCargo.berat || Number(newCargo.berat) <= 0) validationErrors.berat = "Berat barang harus lebih dari 0";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      const payload = { ...newCargo, berat: Number(newCargo.berat), status: 'Diproses' };
      const res = await fetch('/api/pengiriman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast('Cargo berhasil ditambahkan!', 'success');
        setIsAddModalOpen(false);
        setNewCargo({
          nama_pengirim: '',
          nama_penerima: '',
          no_telepon: '',
          kota_asal: '',
          kota_tujuan: '',
          jenis_pengiriman: 'Biasa',
          berat: '',
          tarif: 0,
          catatan_barang: '',
        });
        getCargo();
      } else {
        const errorData = await res.json();
        showToast(errorData.message || 'Gagal menambahkan cargo', 'error');
      }
    } catch (error) {
      console.error('Error adding cargo:', error);
      showToast('Terjadi kesalahan pada server', 'error');
    }
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
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                className={styles.search}
                placeholder="🔍 Search by resi / pengirim / penerima..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <button
                className={styles.submitBtn}
                onClick={() => setIsAddModalOpen(true)}
                style={{ padding: '12px 20px', margin: 0, borderRadius: '18px' }}
              >
                + Tambah Cargo
              </button>
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
                    <span className={styles.infoLabel}>Berat Barang</span>
                    <span className={styles.infoValue}>{selected.berat ? `${selected.berat} kg` : '-'}</span>
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
              <div className={styles.emptyTips}></div>
            </div>
          )}
        </aside>
      </section>

      {/* MODAL TAMBAH CARGO */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
          <div className={styles.addModal} onClick={(e) => e.stopPropagation()} style={{ width: '500px' }}>
            <h2>📦 Tambah Cargo Baru</h2>
            <form onSubmit={handleAddCargo}>
              <div className={styles.modalFormGrid}>
                <div className={styles.formColumn}>
                  <div className={styles.formGroup}>
                    <label>Nama Pengirim</label>
                    <input
                      value={newCargo.nama_pengirim}
                      onChange={(e) => {
                        setNewCargo({ ...newCargo, nama_pengirim: e.target.value });
                        setErrors({ ...errors, nama_pengirim: "" });
                      }}
                      placeholder='Contoh: Budi Esa'
                    />
                    {errors.nama_pengirim && <span className={styles.errorText}>{errors.nama_pengirim}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Nama Penerima</label>
                    <input
                      value={newCargo.nama_penerima}
                      onChange={(e) => {
                        setNewCargo({ ...newCargo, nama_penerima: e.target.value });
                        setErrors({ ...errors, nama_penerima: "" });
                      }}
                      placeholder='Contoh: Andi Santoso'
                    />
                    {errors.nama_penerima && <span className={styles.errorText}>{errors.nama_penerima}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>No Telepon</label>
                    <input
                      value={newCargo.no_telepon}
                      onChange={(e) => {
                        setNewCargo({ ...newCargo, no_telepon: e.target.value });
                        setErrors({ ...errors, no_telepon: "" });
                      }}
                      placeholder='Contoh: 08xxxxxxxxxx'
                    />
                    {errors.no_telepon && <span className={styles.errorText}>{errors.no_telepon}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Catatan Barang</label>
                    <input
                      value={newCargo.catatan_barang}
                      onChange={e => setNewCargo({ ...newCargo, catatan_barang: e.target.value })}
                      placeholder="Opsional"
                    />
                  </div>
                </div>

                <div className={styles.formColumn}>
                  <div className={styles.formGroup}>
                    <label>Kota Asal</label>
                    <input
                      value={newCargo.kota_asal}
                      onChange={(e) => {
                        setNewCargo({ ...newCargo, kota_asal: e.target.value });
                        setErrors({ ...errors, kota_asal: "" });
                      }}
                      placeholder="Contoh: Jakarta"
                    />
                    {errors.kota_asal && <span className={styles.errorText}>{errors.kota_asal}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Kota Tujuan</label>
                    <input
                      value={newCargo.kota_tujuan}
                      onChange={(e) => {
                        setNewCargo({ ...newCargo, kota_tujuan: e.target.value });
                        setErrors({ ...errors, kota_tujuan: "" });
                      }}
                      placeholder="Contoh: Bandung"
                    />
                    {errors.kota_tujuan && <span className={styles.errorText}>{errors.kota_tujuan}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Jenis Pengiriman</label>
                    <select
                      value={newCargo.jenis_pengiriman}
                      onChange={e => setNewCargo({ ...newCargo, jenis_pengiriman: e.target.value })}
                    >
                      <option value="Biasa">Biasa</option>
                      <option value="Cepat">Cepat</option>
                      <option value="VVIP">VVIP</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Berat Barang (kg)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={newCargo.berat}
                      onChange={(e) => {
                        setNewCargo({ ...newCargo, berat: e.target.value });
                        setErrors({ ...errors, berat: "" });
                      }}
                      placeholder="Contoh: 5"
                    />
                    {errors.berat && <span className={styles.errorText}>{errors.berat}</span>}
                  </div>

                  <div className={styles.formGroup}>
                    <label>Tarif Otomatis</label>
                    <input
                      readOnly
                      type="text"
                      value={`Rp ${newCargo.tarif.toLocaleString()}`}
                      style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed', color: '#666', fontWeight: 'bold' }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalButtons}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className={styles.submitBtn}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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