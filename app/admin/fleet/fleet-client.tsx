'use client';

import styles from './fleetadm.module.css';
import Link from 'next/link';
import Megamenu from '@/app/ui/megamenu/megamenu';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Vessel = {
  id: number;
  name: string;
  status: string;
  location: string;
  kapasitas_ton: number;
  muatan_saat_ini: number;
};

type Toast = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

export default function FleetAdminPage() {
  const router = useRouter();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [addForm, setAddForm] = useState({ name: '', status: 'In Port', location: '', kapasitas_ton: '50' });
  const [editForm, setEditForm] = useState({ id: 0, name: '', status: '', location: '', kapasitas_ton: '50' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // ── Helper: persen muatan ──
  const getMuatanPersen = (vessel: Vessel) => {
    const kapKg = Number(vessel.kapasitas_ton) * 1000;
    if (kapKg <= 0) return 0;
    return Math.min(Math.round((Number(vessel.muatan_saat_ini) / kapKg) * 100), 100);
  };

  const getMuatanColor = (persen: number) => {
    if (persen >= 100) return '#ff4757';
    if (persen >= 80)  return '#ffa502';
    return '#4b8cff';
  };

  const fetchVessels = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/vessels?search=${search}&page=${page}&limit=4`);
      const data = await res.json();
      setVessels(data.vessels || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      showToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVessels(); }, [search, page]);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      alert('Anda harus login sebagai Admin!');
      setTimeout(() => router.push('/login'), 1000);
    }
  }, []);

  const getBadgeClass = (status: string) => {
    if (status === 'In Port')     return styles.inPort;
    if (status === 'En Route')    return styles.enRoute;
    if (status === 'Maintenance') return styles.maintenance;
    if (status === 'Delayed')     return styles.delayed;
    return '';
  };

  const handleAddVessel = async () => {
    if (!addForm.name.trim()) { showToast('Nama vessel harus diisi', 'error'); return; }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vessels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addForm.name,
          status: addForm.status,
          location: addForm.location || 'Indonesia',
          kapasitas_ton: Number(addForm.kapasitas_ton) || 50,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setAddForm({ name: '', status: 'In Port', location: '', kapasitas_ton: '50' });
        await fetchVessels();
        showToast(`✅ Vessel "${addForm.name}" berhasil ditambahkan`, 'success');
      } else {
        showToast(data.error || 'Gagal menambahkan vessel', 'error');
      }
    } catch { showToast('Terjadi kesalahan', 'error'); }
    finally  { setIsSubmitting(false); }
  };

  const handleEditVessel = async () => {
    if (!editForm.name.trim()) { showToast('Nama vessel harus diisi', 'error'); return; }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/vessels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editForm.id,
          name: editForm.name,
          status: editForm.status,
          location: editForm.location || 'Indonesia',
          kapasitas_ton: Number(editForm.kapasitas_ton) || 50,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        await fetchVessels();
        if (selectedVessel?.id === editForm.id) {
          setSelectedVessel({
            ...selectedVessel,
            name: editForm.name,
            status: editForm.status,
            location: editForm.location || 'Indonesia',
            kapasitas_ton: Number(editForm.kapasitas_ton) || 50,
          });
        }
        showToast(`✏️ Vessel "${editForm.name}" berhasil diupdate`, 'success');
      } else {
        showToast(data.error || 'Gagal mengupdate vessel', 'error');
      }
    } catch { showToast('Terjadi kesalahan', 'error'); }
    finally  { setIsSubmitting(false); }
  };

  const handleDeleteVessel = async () => {
    if (!selectedVessel || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res  = await fetch(`/api/vessels?id=${selectedVessel.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setIsDeleteModalOpen(false);
        setSelectedVessel(null);
        await fetchVessels();
        showToast(`🗑️ Vessel "${selectedVessel.name}" berhasil dihapus`, 'success');
      } else {
        setIsDeleteModalOpen(false);
        showToast(data.error || 'Gagal menghapus vessel', 'error');
      }
    } catch { showToast('Terjadi kesalahan', 'error'); }
    finally  { setIsSubmitting(false); }
  };

  const openEditModal = () => {
    if (!selectedVessel) { showToast('Pilih vessel terlebih dahulu', 'error'); return; }
    setEditForm({
      id: selectedVessel.id,
      name: selectedVessel.name,
      status: selectedVessel.status,
      location: selectedVessel.location,
      kapasitas_ton: String(selectedVessel.kapasitas_ton || 50),
    });
    setIsEditModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    sessionStorage.clear();
    router.push('/login');
  };

  return (
    <main className={styles.container}>
      <Megamenu onLogout={() => setIsLogoutModalOpen(true)} />

      <section className={styles.mainGrid}>
        {/* LEFT — vessel list */}
        <section className={styles.leftPanel}>
          <div className={styles.leftHeader}>
            <h2>Vessel List</h2>
            <input
              className={styles.search}
              placeholder="Search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className={styles.vesselGrid}>
            {loading ? (
              <p className={styles.loadingText}>Loading vessels...</p>
            ) : vessels.length === 0 ? (
              <p className={styles.loadingText}>No vessels found</p>
            ) : (
              vessels.map((vessel) => {
                const persen = getMuatanPersen(vessel);
                const color  = getMuatanColor(persen);
                const kapKg  = Number(vessel.kapasitas_ton) * 1000;
                const muatan = Number(vessel.muatan_saat_ini ?? 0);
                return (
                  <div
                    key={vessel.id}
                    className={`${styles.vesselCard} ${selectedVessel?.id === vessel.id ? styles.selected : ''}`}
                    onClick={() => setSelectedVessel(vessel)}
                  >
                    <div className={styles.cardTop}>
                      <h3>{vessel.name}</h3>
                      <span className={`${styles.badge} ${getBadgeClass(vessel.status)}`}>{vessel.status}</span>
                    </div>
                    <p className={styles.location}>📍 {vessel.location}</p>

                    {/* Kapasitas muatan */}
                    <div className={styles.fuelRow}>
                      <span>Muatan</span>
                      <span style={{ color }}>{muatan.toLocaleString('id-ID')} / {kapKg.toLocaleString('id-ID')} kg</span>
                    </div>
                    <div className={styles.fuelBar}>
                      <div className={styles.fuelFill} style={{ width: `${persen}%`, background: color }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.pagination}>
            <button onClick={() => setPage(page - 1)} disabled={page === 1}>←</button>
            <span>{page} / {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>→</button>
          </div>
        </section>

        {/* RIGHT — detail */}
        <aside className={styles.rightPanel}>
          {selectedVessel ? (() => {
            const persen = getMuatanPersen(selectedVessel);
            const color  = getMuatanColor(persen);
            const kapKg  = Number(selectedVessel.kapasitas_ton) * 1000;
            const muatan = Number(selectedVessel.muatan_saat_ini ?? 0);
            const sisa   = Math.max(0, kapKg - muatan);
            return (
              <div className={styles.detailCard}>
                <h2>{selectedVessel.name}</h2>
                <p>📍 <b>Location:</b> {selectedVessel.location}</p>
                <p><b>Status:</b> {selectedVessel.status}</p>
                <p><b>Kapasitas:</b> {kapKg.toLocaleString('id-ID')} kg ({selectedVessel.kapasitas_ton} ton)</p>
                <p><b>Muatan Aktif:</b> {muatan.toLocaleString('id-ID')} kg</p>
                <p>
                  <b>Sisa Kapasitas:</b>{' '}
                  <span style={{ color: sisa <= 0 ? '#ff4757' : '#7fffb0', fontWeight: 700 }}>
                    {sisa <= 0 ? 'PENUH' : `${sisa.toLocaleString('id-ID')} kg`}
                  </span>
                </p>
                <div className={styles.fuelBar} style={{ marginTop: 6 }}>
                  <div className={styles.fuelFill} style={{ width: `${persen}%`, background: color }} />
                </div>
                <button className={styles.deleteButton} onClick={() => setIsDeleteModalOpen(true)}>
                  Delete Vessel
                </button>
              </div>
            );
          })() : (
            <div className={styles.emptyDetail}>
              No Vessel Selected<br />Select a vessel to view details
            </div>
          )}

          <div className={styles.buttons}>
            <button className={styles.actionButton} onClick={() => setIsAddModalOpen(true)}>Add Vessels</button>
            <button className={styles.actionButton} onClick={openEditModal}>Edit Vessels</button>
          </div>
        </aside>
      </section>

      {/* ── ADD MODAL ── */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay} onClick={() => { if (!isSubmitting) setIsAddModalOpen(false); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>➕ Add New Vessel</h3>
              <button className={styles.modalClose} onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label>Vessel Name</label>
                <input type="text" placeholder="e.g., MV. Meratus Jaya" value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} autoFocus />
              </div>
              <div className={styles.inputGroup}>
                <label>Location</label>
                <input type="text" placeholder="e.g., Pelabuhan Tanjung Priok, Jakarta" value={addForm.location}
                  onChange={(e) => setAddForm({ ...addForm, location: e.target.value })} />
              </div>
              <div className={styles.inputGroup}>
                <label>Kapasitas (ton)</label>
                <input type="number" placeholder="e.g., 50" value={addForm.kapasitas_ton}
                  onChange={(e) => setAddForm({ ...addForm, kapasitas_ton: e.target.value })} />
              </div>
              <div className={styles.inputGroup}>
                <label>Status</label>
                <select value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}>
                  <option value="In Port">⚓ In Port</option>
                  <option value="En Route">🚢 En Route</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Delayed">⚠️ Delayed</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>Cancel</button>
              <button className={styles.submitBtn} onClick={handleAddVessel} disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Add Vessel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay} onClick={() => { if (!isSubmitting) setIsEditModalOpen(false); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>✏️ Edit Vessel</h3>
              <button className={styles.modalClose} onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label>Vessel Name</label>
                <input type="text" value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} autoFocus />
              </div>
              <div className={styles.inputGroup}>
                <label>Location</label>
                <input type="text" value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
              </div>
              <div className={styles.inputGroup}>
                <label>Kapasitas (ton)</label>
                <input type="number" value={editForm.kapasitas_ton}
                  onChange={(e) => setEditForm({ ...editForm, kapasitas_ton: e.target.value })} />
              </div>
              <div className={styles.inputGroup}>
                <label>Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                  <option value="In Port">⚓ In Port</option>
                  <option value="En Route">🚢 En Route</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Delayed">⚠️ Delayed</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>Cancel</button>
              <button className={styles.submitBtn} onClick={handleEditVessel} disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ── */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsDeleteModalOpen(false)}>
          <div className={styles.logoutModal} onClick={(e) => e.stopPropagation()}>
            <h2>Konfirmasi Hapus</h2>
            <p>Yakin ingin menghapus vessel <b>{selectedVessel?.name}</b>?</p>
            <div className={styles.logoutButtons}>
              <button className={styles.cancelLogout} onClick={() => setIsDeleteModalOpen(false)} disabled={isSubmitting}>Batal</button>
              <button className={styles.confirmLogout} onClick={handleDeleteVessel} disabled={isSubmitting}>
                {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
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