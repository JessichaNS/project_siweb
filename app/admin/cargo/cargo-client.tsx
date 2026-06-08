'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './carg.module.css';

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

export default function CargoAdminPage() {
  const router = useRouter();
  const [cargo, setCargo] = useState<Cargo[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Cargo | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const [addForm, setAddForm] = useState({
    no_resi: '',
    tanggal_transaksi: '',
    nama_pengirim: '',
    nama_penerima: '',
    no_telepon: '+62',
    kota_asal: '',
    kota_tujuan: '',
    jenis_pengiriman: 'Biasa',
    status: 'Diproses',
    tarif: '',
    catatan_barang: '',
    pelanggan_id: '1',
    vessel_id: '1',
    pelabuhan_asal_id: '1',
    pelabuhan_tujuan_id: '2',
  });

  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    id: '',
    no_resi: '',
    nama_pengirim: '',
    nama_penerima: '',
    no_telepon: '',
    kota_asal: '',
    kota_tujuan: '',
    jenis_pengiriman: '',
    status: '',
    tarif: '',
    catatan_barang: '',
  });

  const getCargo = async () => {
    const res = await fetch(
      `/api/pengiriman?search=${search}&page=${page}&limit=4`
    );
    const data = await res.json();
    setCargo(data.pengiriman || []);
    setTotalPages(data.totalPages || 1);
  };

  useEffect(() => {
    getCargo();
  }, [search, page]);

  const deleteCargo = async (id: number) => {
    await fetch(`/api/pengiriman?id=${id}`, {
      method: 'DELETE',
    });
    setSelected(null);
    getCargo();
    showToast('🗑️ Cargo berhasil dihapus', 'success');
  };

  const getNextResiNumber = async () => {
    try {
      const res = await fetch('/api/pengiriman?limit=999');
      const data = await res.json();
      const existingResi = data.pengiriman || [];
      
      let maxNumber = 0;
      existingResi.forEach((item: any) => {
        const match = item.no_resi.match(/RESI(\d+)/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxNumber) maxNumber = num;
        }
      });
      
      const nextNumber = maxNumber + 1;
      return `RESI${nextNumber}`;
    } catch (error) {
      console.error('Error getting next resi:', error);
      return `RESI${Date.now()}`;
    }
  };

  // Handle nomor telepon agar selalu ada +62 di awal
  const handlePhoneChange = (value: string, isEdit: boolean = false) => {
    let cleanValue = value.replace(/[^0-9+]/g, '');
    if (!cleanValue.startsWith('+62')) {
      if (cleanValue.startsWith('62')) {
        cleanValue = '+' + cleanValue;
      } else if (cleanValue.startsWith('0')) {
        cleanValue = '+62' + cleanValue.substring(1);
      } else if (cleanValue.startsWith('+')) {
        // sudah benar
      } else {
        cleanValue = '+62' + cleanValue;
      }
    }
    
    if (isEdit) {
      setEditForm({ ...editForm, no_telepon: cleanValue });
    } else {
      setAddForm({ ...addForm, no_telepon: cleanValue });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
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
          <Link href="/admin/dashboard" className={styles.navItem}>Dashboard</Link>
          <Link href="/admin/fleet" className={styles.navItem}>Fleet</Link>
          <Link href="/admin/cargo" className={`${styles.navItem} ${styles.active}`}>Cargo</Link>
          <Link href="/admin/map" className={styles.navItem}>Map</Link>
          <Link href="/admin/analytic" className={styles.navItem}>Analytic</Link>
        </nav>

        <div className={styles.userBox}>
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
            <h2>Cargo List</h2>
            <input
              className={styles.search}
              placeholder="Search no resi / pengirim / penerima"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className={styles.cargoGrid}>
            {cargo.length === 0 ? (
              <p className={styles.empty}>Loading Cargo</p>
            ) : (
              cargo.map((item) => (
                <div
                  key={item.id}
                  className={styles.card}
                  onClick={() => setSelected(item)}
                >
                  <div className={styles.cardTop}>
                    <h3>{item.no_resi}</h3>
                    <span className={styles.badge}>{item.status}</span>
                  </div>
                  <p>{item.nama_pengirim} → {item.nama_penerima}</p>
                  <p>{item.kota_asal} → {item.kota_tujuan}</p>
                  <p>{item.jenis_pengiriman}</p>
                  <strong>Rp {item.tarif}</strong>
                </div>
              ))
            )}
          </div>

          <div className={styles.pagination}>
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>←</button>
            <span>{page} / {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>→</button>
          </div>
        </section>

        <aside className={styles.rightPanel}>
          {selected ? (
            <div className={styles.detailCard}>
              <h2>{selected.no_resi}</h2>
              <p><b>Pengirim:</b> {selected.nama_pengirim}</p>
              <p><b>Penerima:</b> {selected.nama_penerima}</p>
              <p><b>No Telepon:</b> {selected.no_telepon}</p>
              <p><b>Asal:</b> {selected.kota_asal}</p>
              <p><b>Tujuan:</b> {selected.kota_tujuan}</p>
              <p><b>Jenis:</b> {selected.jenis_pengiriman}</p>
              <p><b>Status:</b> {selected.status}</p>
              <p><b>Catatan:</b> {selected.catatan_barang}</p>
              <button className={styles.deleteButton} onClick={() => deleteCargo(selected.id)}>
                Delete Cargo
              </button>
            </div>
          ) : (
            <div className={styles.emptyDetail}>
              No Cargo Selected
              <br />
              Select cargo to view details
            </div>
          )}

          <div className={styles.buttons}>
            <button className={styles.actionButton} onClick={() => {
              setAddError('');
              setIsAddOpen(true);
            }}>
              Add Cargo
            </button>

            <button className={styles.actionButton} onClick={() => {
              if (!selected) return;
              setEditForm({
                id: String(selected.id),
                no_resi: selected.no_resi,
                nama_pengirim: selected.nama_pengirim,
                nama_penerima: selected.nama_penerima,
                no_telepon: selected.no_telepon,
                kota_asal: selected.kota_asal,
                kota_tujuan: selected.kota_tujuan,
                jenis_pengiriman: selected.jenis_pengiriman,
                status: selected.status,
                tarif: String(selected.tarif),
                catatan_barang: selected.catatan_barang,
              });
              setEditError('');
              setIsEditOpen(true);
            }}>
              Edit Cargo
            </button>
          </div>
        </aside>
      </section>

      {/* Add Modal - Layout 2 kolom */}
      {isAddOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddOpen(false)}>
          <div className={styles.addModal} onClick={(e) => e.stopPropagation()}>
            <h2>Add Cargo</h2>
            {addError && <div className={styles.errorMessage}>{addError}</div>}
            
            <div className={styles.modalFormGrid}>
              {/* Kolom Kiri */}
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>No Resi</label>
                  <input
                    placeholder="Otomatis"
                    value={addForm.no_resi}
                    disabled
                    style={{ background: '#3a1760', cursor: 'not-allowed' }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Nama Pengirim</label>
                  <input
                    placeholder="Nama Pengirim"
                    value={addForm.nama_pengirim}
                    onChange={(e) => {
                      setAddForm({
                        ...addForm,
                        nama_pengirim: e.target.value
                      });
                    }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Nama Penerima</label>
                  <input
                    placeholder="Nama Penerima"
                    value={addForm.nama_penerima}
                    onChange={(e) => setAddForm({ ...addForm, nama_penerima: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>No Telepon</label>
                  <input
                    placeholder="+62xxx"
                    value={addForm.no_telepon}
                    onChange={(e) => handlePhoneChange(e.target.value, false)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={addForm.tanggal_transaksi}
                    onChange={(e) => setAddForm({ ...addForm, tanggal_transaksi: e.target.value })}
                  />
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>Kota Asal</label>
                  <input
                    placeholder="Kota Asal"
                    value={addForm.kota_asal}
                    onChange={(e) => setAddForm({ ...addForm, kota_asal: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Kota Tujuan</label>
                  <input
                    placeholder="Kota Tujuan"
                    value={addForm.kota_tujuan}
                    onChange={(e) => setAddForm({ ...addForm, kota_tujuan: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Jenis Pengiriman</label>
                  <select
                    value={addForm.jenis_pengiriman}
                    onChange={(e) => setAddForm({ ...addForm, jenis_pengiriman: e.target.value })}
                  >
                    <option>Biasa</option>
                    <option>Cepat</option>
                    <option>VVIP</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                  >
                    <option>Diproses</option>
                    <option>Dikirim</option>
                    <option>Selesai</option>
                    <option>Pending</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Tarif</label>
                  <input
                    type="number"
                    placeholder="Tarif"
                    value={addForm.tarif}
                    onChange={(e) => setAddForm({ ...addForm, tarif: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Catatan Barang</label>
                  <input
                    placeholder="Catatan Barang"
                    value={addForm.catatan_barang}
                    onChange={(e) => setAddForm({ ...addForm, catatan_barang: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={() => setIsAddOpen(false)}>CANCEL</button>
              <button className={styles.submitBtn} onClick={async () => {
                if (!addForm.tanggal_transaksi || !addForm.nama_pengirim || !addForm.nama_penerima || !addForm.no_telepon || !addForm.kota_asal || !addForm.kota_tujuan || !addForm.tarif) {
                  setAddError('Error: Form tidak lengkap! Silakan isi semua field.');
                  return;
                }
                if (!/^\+?[0-9]{8,15}$/.test(addForm.no_telepon.replace(/\+/g, ''))) {
                  setAddError('Error: Tipe data nomor telepon tidak sesuai! Harus berupa angka 8-15 digit.');
                  return;
                }
                const numericTarif = Number(addForm.tarif);
                if (isNaN(numericTarif) || numericTarif < 0) {
                  setAddError('Error: Tipe data tarif tidak sesuai! Harus berupa angka positif.');
                  return;
                }

                try {
                  const nextResi = await getNextResiNumber();
                  
                  const res = await fetch('/api/pengiriman', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      ...addForm,
                      no_resi: nextResi,
                    }),
                  });
                  const result = await res.json();
                  if (!res.ok || !result.success) {
                    setAddError(result.error || 'Error: Gagal menyimpan data ke database.');
                    return;
                  }

                  setAddError('');
                  setIsAddOpen(false);
                  showToast(`✅ Resi ${nextResi} berhasil ditambahkan`, 'success');

                  setAddForm({
                    no_resi: '',
                    tanggal_transaksi: '',
                    nama_pengirim: '',
                    nama_penerima: '',
                    no_telepon: '+62',
                    kota_asal: '',
                    kota_tujuan: '',
                    jenis_pengiriman: 'Biasa',
                    status: 'Diproses',
                    tarif: '',
                    catatan_barang: '',
                    pelanggan_id: '1',
                    vessel_id: '1',
                    pelabuhan_asal_id: '1',
                    pelabuhan_tujuan_id: '2',
                  });

                  await getCargo();
                } catch (err) {
                  setAddError('Error: Koneksi database terputus atau gagal terhubung.');
                }
              }}>SAVE</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Layout 2 kolom */}
      {isEditOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEditOpen(false)}>
          <div className={styles.addModal} onClick={(e) => e.stopPropagation()}>
            <h2>Edit Cargo</h2>
            {editError && <div className={styles.errorMessage}>{editError}</div>}
            
            <div className={styles.modalFormGrid}>
              {/* Kolom Kiri */}
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>No Resi</label>
                  <input
                    value={editForm.no_resi}
                    onChange={(e) => setEditForm({ ...editForm, no_resi: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Nama Pengirim</label>
                  <input
                    value={editForm.nama_pengirim}
                    onChange={(e) => setEditForm({ ...editForm, nama_pengirim: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Nama Penerima</label>
                  <input
                    value={editForm.nama_penerima}
                    onChange={(e) => setEditForm({ ...editForm, nama_penerima: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>No Telepon</label>
                  <input
                    value={editForm.no_telepon}
                    onChange={(e) => handlePhoneChange(e.target.value, true)}
                  />
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>Kota Asal</label>
                  <input
                    value={editForm.kota_asal}
                    onChange={(e) => setEditForm({ ...editForm, kota_asal: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Kota Tujuan</label>
                  <input
                    value={editForm.kota_tujuan}
                    onChange={(e) => setEditForm({ ...editForm, kota_tujuan: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Jenis Pengiriman</label>
                  <select
                    value={editForm.jenis_pengiriman}
                    onChange={(e) => setEditForm({ ...editForm, jenis_pengiriman: e.target.value })}
                  >
                    <option>Biasa</option>
                    <option>Cepat</option>
                    <option>VVIP</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option>Diproses</option>
                    <option>Dikirim</option>
                    <option>Selesai</option>
                    <option>Pending</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Tarif</label>
                  <input
                    type="number"
                    value={editForm.tarif}
                    onChange={(e) => setEditForm({ ...editForm, tarif: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Catatan Barang</label>
                  <input
                    value={editForm.catatan_barang}
                    onChange={(e) => setEditForm({ ...editForm, catatan_barang: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={() => { setEditError(''); setIsEditOpen(false); }}>CANCEL</button>
              <button className={styles.submitBtn} onClick={async () => {
                if (!editForm.no_resi || !editForm.nama_pengirim || !editForm.nama_penerima || !editForm.no_telepon || !editForm.kota_asal || !editForm.kota_tujuan || !editForm.tarif) {
                  setEditError('Error: Form tidak lengkap! Silakan isi semua field.');
                  return;
                }
                if (!/^\+?[0-9]{8,15}$/.test(editForm.no_telepon.replace(/\+/g, ''))) {
                  setEditError('Error: Tipe data nomor telepon tidak sesuai! Harus berupa angka 8-15 digit.');
                  return;
                }
                const numericTarif = Number(editForm.tarif);
                if (isNaN(numericTarif) || numericTarif < 0) {
                  setEditError('Error: Tipe data tarif tidak sesuai! Harus berupa angka positif.');
                  return;
                }

                try {
                  const res = await fetch('/api/pengiriman', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editForm),
                  });
                  const result = await res.json();
                  if (!res.ok || !result.success) {
                    setEditError(result.error || 'Error: Gagal mengupdate data di database.');
                    return;
                  }

                  setEditError('');
                  setIsEditOpen(false);
                  showToast(`✏️ Resi ${editForm.no_resi} berhasil diupdate`, 'success');
                  await getCargo();
                } catch (err) {
                  setEditError('Error: Koneksi database terputus atau gagal terhubung.');
                }
              }}>SAVE</button>
            </div>
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

      {/* Toast Notification */}
      {toast.show && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          <span>{toast.message}</span>
          <button className={styles.toastClose} onClick={() => setToast({ show: false, message: '', type: 'success' })}>×</button>
        </div>
      )}
    </main>
  );
}