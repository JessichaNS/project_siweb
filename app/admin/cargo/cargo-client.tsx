'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './carg.module.css';
import Megamenu from '@/app/ui/megamenu/megamenu';

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
  pelanggan_id: number;
  vessel_id: number;
  pelabuhan_asal_id: number;
  pelabuhan_tujuan_id: number;
};

type Toast = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

export default function CargoAdminPage() {
  const router = useRouter();
  const [cargo, setCargo] = useState<Cargo[]>([]);
  const [allCargo, setAllCargo] = useState<Cargo[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Cargo | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // stats computed from ALL cargo (fetched separately)
  const [statsSelesai, setStatsSelesai] = useState(0);
  const [statsDikirim, setStatsDikirim] = useState(0);
  const [statsDiproses, setStatsDiproses] = useState(0);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const [addForm, setAddForm] = useState({
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
    const res = await fetch(`/api/pengiriman?search=${search}&page=${page}&limit=4`);
    const data = await res.json();
    setCargo(data.pengiriman || []);
    setTotalPages(data.totalPages || 1);
    setTotal(data.total || 0);
  };

  const getStats = async () => {
    const res = await fetch(`/api/pengiriman?limit=999`);
    const data = await res.json();
    const all: Cargo[] = data.pengiriman || [];
    setStatsSelesai(all.filter(c => c.status === 'Selesai').length);
    setStatsDikirim(all.filter(c => c.status === 'Dikirim').length);
    setStatsDiproses(all.filter(c => c.status === 'Diproses' || c.status === 'Pending').length);
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      alert('Anda harus login sebagai Admin!');
      setTimeout(() => router.push('/login'), 1000);
    }
    getStats();
  }, []);

  useEffect(() => {
    getCargo();
  }, [search, page]);

  const deleteCargo = async (id: number) => {
    const res = await fetch(`/api/pengiriman?id=${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      setSelected(null);
      setIsDeleteModalOpen(false);
      await getCargo();
      await getStats();
      showToast('🗑️ Cargo berhasil dihapus', 'success');
    } else {
      showToast(result.error || 'Gagal menghapus cargo', 'error');
    }
  };

  const handlePhoneChange = (value: string, isEdit: boolean = false) => {
    let clean = value.replace(/[^0-9+]/g, '');
    if (!clean.startsWith('+62')) {
      if (clean.startsWith('62'))      clean = '+' + clean;
      else if (clean.startsWith('0'))  clean = '+62' + clean.substring(1);
      else if (!clean.startsWith('+')) clean = '+62' + clean;
    }
    if (isEdit) setEditForm({ ...editForm, no_telepon: clean });
    else        setAddForm({ ...addForm, no_telepon: clean });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    sessionStorage.clear();
    router.push('/login');
  };

  const validateForm = (form: typeof addForm | typeof editForm) => {
    const required = ['nama_pengirim', 'nama_penerima', 'no_telepon', 'kota_asal', 'kota_tujuan', 'tarif'];
    for (const f of required) {
      if (!(form as any)[f]) return `Field '${f}' wajib diisi`;
    }
    if (!/^\+?[0-9]{8,15}$/.test(form.no_telepon.replace(/\+/g, '')))
      return 'Nomor telepon harus berupa angka 8-15 digit';
    if (isNaN(Number(form.tarif)) || Number(form.tarif) < 0)
      return 'Tarif harus berupa angka positif';
    return null;
  };

  const getBadgeStyle = (status: string) => {
    if (status === 'Selesai')  return styles.badgeSelesai;
    if (status === 'Dikirim')  return styles.badgeDikirim;
    if (status === 'Diproses') return styles.badgeDiproses;
    if (status === 'Pending')  return styles.badgePending;
    return styles.badge;
  };

  return (
    <main className={styles.container}>
      <Megamenu onLogout={() => setIsLogoutModalOpen(true)} />

      {/* ── MAIN GRID ── */}
      <section className={styles.mainGrid}>

        {/* LEFT — cargo list */}
        <section className={styles.leftPanel}>
          <div className={styles.leftHeader}>
            <h2>Cargo Shipments</h2>
            <input
              className={styles.search}
              placeholder="🔍 Search by resi / pengirim / penerima..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          {/* ── STATS ROW ── */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statIcon}>📦</span>
              <div>
                <div className={styles.statValue}>{total}</div>
                <div className={styles.statLabel}>Total Shipments</div>
              </div>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statIcon}>✅</span>
              <div>
                <div className={styles.statValue}>{statsSelesai}</div>
                <div className={styles.statLabel}>Completed</div>
              </div>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statIcon}>🚚</span>
              <div>
                <div className={styles.statValue}>{statsDikirim}</div>
                <div className={styles.statLabel}>In Sent</div>
              </div>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statIcon}>⏳</span>
              <div>
                <div className={styles.statValue}>{statsDiproses}</div>
                <div className={styles.statLabel}>Processing</div>
              </div>
            </div>
          </div>

          <div className={styles.cargoGrid}>
            {cargo.length === 0 ? (
              <p className={styles.empty}>Loading Cargo…</p>
            ) : (
              cargo.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.card} ${selected?.id === item.id ? styles.selected : ''}`}
                  onClick={() => setSelected(item)}
                >
                  <div className={styles.cardTop}>
                    <h3>{item.no_resi}</h3>
                    <span className={`${styles.badge} ${getBadgeStyle(item.status)}`}>{item.status}</span>
                  </div>
                  <div className={styles.cardMeta}>
                    <div><span className={styles.cardLabel}>From:</span> {item.nama_pengirim}</div>
                    <div><span className={styles.cardLabel}>To:</span> {item.nama_penerima}</div>
                  </div>
                  <div className={styles.cardRoute}>
                    <span className={styles.routeCity}>{item.kota_asal}</span>
                    <span className={styles.routeArrow}>→</span>
                    <span className={styles.routeCity}>{item.kota_tujuan}</span>
                  </div>
                  <div className={styles.cardBottom}>
                    <span className={styles.cardJenis}>
                      {item.jenis_pengiriman === 'Cepat' ? '⚡' : item.jenis_pengiriman === 'VVIP' ? '💎' : '📦'} {item.jenis_pengiriman}
                    </span>
                    <strong className={styles.cardTarif}>Rp {item.tarif.toLocaleString('id-ID')}</strong>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.pagination}>
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>← Previous</button>
            <span>{page} / {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next →</button>
          </div>
        </section>

        {/* RIGHT — detail */}
        <aside className={styles.rightPanel}>
          {selected ? (
            <div className={styles.detailCard}>
              <div className={styles.detailIconWrap}>📄</div>
              <h2 className={styles.detailResi}>{selected.no_resi}</h2>
              <span className={`${styles.badge} ${getBadgeStyle(selected.status)}`}>{selected.status}</span>

              <div className={styles.detailSection}>
                <div className={styles.detailSectionTitle}>📋 Shipment Details</div>
                <div className={styles.detailRow}>
                  <span className={styles.detailKey}>Pengirim</span>
                  <span className={styles.detailVal}>{selected.nama_pengirim}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailKey}>Penerima</span>
                  <span className={styles.detailVal}>{selected.nama_penerima}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailKey}>No Telepon</span>
                  <span className={styles.detailVal}>{selected.no_telepon}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.detailSectionTitle}>📍 Route Information</div>
                <div className={styles.routeDetail}>
                  <div className={styles.routeDetailItem}>
                    <span className={styles.routeDetailLabel}>Asal</span>
                    <span className={styles.routeDetailCity}>{selected.kota_asal}</span>
                  </div>
                  <div className={styles.routeDetailLine} />
                  <div className={styles.routeDetailItem}>
                    <span className={styles.routeDetailLabel}>Tujuan</span>
                    <span className={styles.routeDetailCity}>{selected.kota_tujuan}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.detailSectionTitle}>💰 Financial & Service</div>
                <div className={styles.detailRow}>
                  <span className={styles.detailKey}>Jenis Pengiriman</span>
                  <span className={styles.detailVal}>
                    {selected.jenis_pengiriman === 'Cepat' ? '⚡' : selected.jenis_pengiriman === 'VVIP' ? '💎' : '📦'} {selected.jenis_pengiriman}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailKey}>Tarif</span>
                  <span className={styles.detailValHighlight}>Rp {selected.tarif.toLocaleString('id-ID')}</span>
                </div>
                {selected.catatan_barang && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailKey}>Catatan</span>
                    <span className={styles.detailVal}>{selected.catatan_barang}</span>
                  </div>
                )}
              </div>

              <button className={styles.deleteButton} onClick={() => setIsDeleteModalOpen(true)}>
                Delete Cargo
              </button>
            </div>
          ) : (
            <div className={styles.emptyDetail}>
              <div className={styles.emptyIcon}>📄</div>
              <div>No Cargo Selected</div>
              <div className={styles.emptySubtext}>Select cargo to view details</div>
            </div>
          )}

          <div className={styles.buttons}>
            <button className={styles.actionButton} onClick={() => { setAddError(''); setIsAddOpen(true); }}>
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

      {/* ── ADD MODAL ── */}
      {isAddOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddOpen(false)}>
          <div className={styles.addModal} onClick={(e) => e.stopPropagation()}>
            <h2>Add Cargo</h2>
            {addError && <div className={styles.errorMessage}>{addError}</div>}
            <div className={styles.modalFormGrid}>
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>No Resi</label>
                  <input value="(otomatis)" disabled style={{ background: '#3a1760', cursor: 'not-allowed' }} />
                </div>
                <div className={styles.formGroup}>
                  <label>Nama Pengirim</label>
                  <input placeholder="Nama Pengirim" value={addForm.nama_pengirim}
                    onChange={(e) => setAddForm({ ...addForm, nama_pengirim: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Nama Penerima</label>
                  <input placeholder="Nama Penerima" value={addForm.nama_penerima}
                    onChange={(e) => setAddForm({ ...addForm, nama_penerima: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>No Telepon</label>
                  <input placeholder="+62xxx" value={addForm.no_telepon}
                    onChange={(e) => handlePhoneChange(e.target.value, false)} />
                </div>
                <div className={styles.formGroup}>
                  <label>Tanggal Transaksi</label>
                  <input type="date" value={addForm.tanggal_transaksi}
                    onChange={(e) => setAddForm({ ...addForm, tanggal_transaksi: e.target.value })} />
                </div>
              </div>
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>Kota Asal</label>
                  <input placeholder="Kota Asal" value={addForm.kota_asal}
                    onChange={(e) => setAddForm({ ...addForm, kota_asal: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Kota Tujuan</label>
                  <input placeholder="Kota Tujuan" value={addForm.kota_tujuan}
                    onChange={(e) => setAddForm({ ...addForm, kota_tujuan: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Jenis Pengiriman</label>
                  <select value={addForm.jenis_pengiriman}
                    onChange={(e) => setAddForm({ ...addForm, jenis_pengiriman: e.target.value })}>
                    <option>Biasa</option>
                    <option>Cepat</option>
                    <option>VVIP</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}>
                    <option>Diproses</option>
                    <option>Dikirim</option>
                    <option>Selesai</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Tarif</label>
                  <input type="number" placeholder="Tarif" value={addForm.tarif}
                    onChange={(e) => setAddForm({ ...addForm, tarif: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Catatan Barang</label>
                  <input placeholder="Catatan Barang" value={addForm.catatan_barang}
                    onChange={(e) => setAddForm({ ...addForm, catatan_barang: e.target.value })} />
                </div>
              </div>
            </div>
            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={() => setIsAddOpen(false)}>CANCEL</button>
              <button className={styles.submitBtn} disabled={isSubmitting} onClick={async () => {
                if (isSubmitting) return;
                if (!addForm.tanggal_transaksi) { setAddError('Tanggal transaksi wajib diisi'); return; }
                const err = validateForm(addForm);
                if (err) { setAddError(err); return; }
                setIsSubmitting(true);
                try {
                  const res = await fetch('/api/pengiriman', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(addForm),
                  });
                  const result = await res.json();
                  if (!res.ok || !result.success) { setAddError(result.error || 'Gagal menyimpan data'); return; }
                  setAddError('');
                  setIsAddOpen(false);
                  showToast(`✅ ${result.no_resi} berhasil ditambahkan`, 'success');
                  setAddForm({
                    tanggal_transaksi: '', nama_pengirim: '', nama_penerima: '',
                    no_telepon: '+62', kota_asal: '', kota_tujuan: '',
                    jenis_pengiriman: 'Biasa', status: 'Diproses', tarif: '',
                    catatan_barang: '', vessel_id: '1',
                    pelabuhan_asal_id: '1', pelabuhan_tujuan_id: '2',
                  });
                  await getCargo();
                  await getStats();
                } catch { setAddError('Koneksi database terputus atau gagal terhubung'); }
                finally { setIsSubmitting(false); }
              }}>{isSubmitting ? 'Menyimpan...' : 'SAVE'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {isEditOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEditOpen(false)}>
          <div className={styles.addModal} onClick={(e) => e.stopPropagation()}>
            <h2>Edit Cargo</h2>
            {editError && <div className={styles.errorMessage}>{editError}</div>}
            <div className={styles.modalFormGrid}>
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>No Resi</label>
                  <input value={editForm.no_resi}
                    onChange={(e) => setEditForm({ ...editForm, no_resi: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Nama Pengirim</label>
                  <input value={editForm.nama_pengirim}
                    onChange={(e) => setEditForm({ ...editForm, nama_pengirim: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Nama Penerima</label>
                  <input value={editForm.nama_penerima}
                    onChange={(e) => setEditForm({ ...editForm, nama_penerima: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>No Telepon</label>
                  <input value={editForm.no_telepon}
                    onChange={(e) => handlePhoneChange(e.target.value, true)} />
                </div>
              </div>
              <div className={styles.formColumn}>
                <div className={styles.formGroup}>
                  <label>Kota Asal</label>
                  <input value={editForm.kota_asal}
                    onChange={(e) => setEditForm({ ...editForm, kota_asal: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Kota Tujuan</label>
                  <input value={editForm.kota_tujuan}
                    onChange={(e) => setEditForm({ ...editForm, kota_tujuan: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Jenis Pengiriman</label>
                  <select value={editForm.jenis_pengiriman}
                    onChange={(e) => setEditForm({ ...editForm, jenis_pengiriman: e.target.value })}>
                    <option>Biasa</option>
                    <option>Cepat</option>
                    <option>VVIP</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                    <option>Diproses</option>
                    <option>Dikirim</option>
                    <option>Selesai</option>
                    <option>Pending</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Tarif</label>
                  <input type="number" value={editForm.tarif}
                    onChange={(e) => setEditForm({ ...editForm, tarif: e.target.value })} />
                </div>
                <div className={styles.formGroup}>
                  <label>Catatan Barang</label>
                  <input value={editForm.catatan_barang}
                    onChange={(e) => setEditForm({ ...editForm, catatan_barang: e.target.value })} />
                </div>
              </div>
            </div>
            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={() => { setEditError(''); setIsEditOpen(false); }}>CANCEL</button>
              <button className={styles.submitBtn} disabled={isSubmitting} onClick={async () => {
                if (isSubmitting) return;
                const err = validateForm(editForm);
                if (err) { setEditError(err); return; }
                setIsSubmitting(true);
                try {
                  const res = await fetch('/api/pengiriman', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editForm),
                  });
                  const result = await res.json();
                  if (!res.ok || !result.success) { setEditError(result.error || 'Gagal mengupdate data'); return; }
                  setEditError('');
                  setIsEditOpen(false);
                  showToast(`✏️ ${editForm.no_resi} berhasil diupdate`, 'success');
                  await getCargo();
                  await getStats();
                } catch { setEditError('Koneksi database terputus atau gagal terhubung'); }
                finally { setIsSubmitting(false); }
              }}>{isSubmitting ? 'Menyimpan...' : 'SAVE'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsDeleteModalOpen(false)}>
          <div className={styles.logoutModal} onClick={(e) => e.stopPropagation()}>
            <h2>Konfirmasi Hapus</h2>
            <p>Yakin ingin menghapus cargo <b>{selected?.no_resi}</b>?</p>
            <div className={styles.logoutButtons}>
              <button className={styles.cancelLogout} onClick={() => setIsDeleteModalOpen(false)}>Batal</button>
              <button className={styles.confirmLogout} onClick={() => selected && deleteCargo(selected.id)}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOGOUT MODAL ── */}
      {isLogoutModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsLogoutModalOpen(false)}>
          <div className={styles.logoutModal} onClick={(e) => e.stopPropagation()}>
            <h2>Konfirmasi Logout</h2>
            <p>Apakah Anda yakin ingin keluar?</p>
            <div className={styles.logoutButtons}>
              <button className={styles.cancelLogout} onClick={() => setIsLogoutModalOpen(false)}>Tidak</button>
              <button className={styles.confirmLogout} onClick={handleLogout}>Ya, Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast.show && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          <span>{toast.message}</span>
          <button className={styles.toastClose}
            onClick={() => setToast({ show: false, message: '', type: 'success' })}>×</button>
        </div>
      )}
    </main>
  );
}
