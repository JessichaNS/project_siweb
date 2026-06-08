'use client';

import styles from './fleetadm.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

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

export default function FleetAdminPage() {
  const router = useRouter();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', status: 'In Port' });
  const [editForm, setEditForm] = useState({ id: 0, name: '', status: '' });
  
  // Toast state
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });
  
  // Logout modal state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

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

  const handleAddVessel = async () => {
    if (!addForm.name.trim()) {
      showToast('Nama vessel harus diisi', 'error');
      return;
    }
    try {
      const res = await fetch('/api/vessels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: addForm.name, status: addForm.status }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setAddForm({ name: '', status: 'In Port' });
        const refreshRes = await fetch(`/api/vessels?search=${search}&page=${page}&limit=4`);
        const refreshData = await refreshRes.json();
        setVessels(refreshData.vessels || []);
        setTotalPages(refreshData.totalPages || 1);
        showToast(`✅ Vessel "${addForm.name}" berhasil ditambahkan`, 'success');
      } else {
        showToast('Gagal menambahkan vessel', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Terjadi kesalahan', 'error');
    }
  };

  const handleEditVessel = async () => {
    if (!editForm.name.trim()) {
      showToast('Nama vessel harus diisi', 'error');
      return;
    }
    try {
      const res = await fetch('/api/vessels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editForm.id, name: editForm.name, status: editForm.status }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        const refreshRes = await fetch(`/api/vessels?search=${search}&page=${page}&limit=4`);
        const refreshData = await refreshRes.json();
        setVessels(refreshData.vessels || []);
        setTotalPages(refreshData.totalPages || 1);
        if (selectedVessel && selectedVessel.id === editForm.id) {
          setSelectedVessel({ ...selectedVessel, name: editForm.name, status: editForm.status });
        }
        showToast(`✏️ Vessel "${editForm.name}" berhasil diupdate`, 'success');
      } else {
        showToast('Gagal mengupdate vessel', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Terjadi kesalahan', 'error');
    }
  };

  const openEditModal = () => {
    if (!selectedVessel) {
      showToast('Pilih vessel terlebih dahulu', 'error');
      return;
    }
    setEditForm({
      id: selectedVessel.id,
      name: selectedVessel.name,
      status: selectedVessel.status,
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
      <header className={styles.topbar}>
        <div className={styles.logoBox}>
          <div className={styles.logo}>
            <img src="/shipylogo.jpeg" alt="Shipy Logo" className={styles.logoImage} />
          </div>
        </div>

        <nav className={styles.nav}>
          <Link href="/admin/dashboard" className={styles.navItem}>Dashboard</Link>
          <Link href="/admin/fleet" className={styles.navItem}>Fleet</Link>
          <Link href="/admin/cargo" className={styles.navItem}>Cargo</Link>
          <Link href="/admin/map" className={`${styles.navItem} ${styles.active}`}>Map</Link>
          <Link href="/admin/analytic" className={styles.navItem}>Analytic</Link>
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
            <h2>Vessel List</h2>
            <input
              className={styles.search}
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
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
                  className={styles.vesselCard}
                  onClick={() => setSelectedVessel(vessel)}
                >
                  <div className={styles.cardTop}>
                    <h3>{vessel.name}</h3>
                    <span className={`${styles.badge} ${getBadgeClass(vessel.status)}`}>
                      {vessel.status}
                    </span>
                  </div>

                  <p className={styles.location}>📍 {vessel.location}</p>

                  <div className={styles.fuelRow}>
                    <span>Fuel Level</span>
                    <span>{vessel.fuel}%</span>
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
              ←
            </button>
            <span>{page} / {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
              →  
            </button>
          </div>
        </section>

        <aside className={styles.rightPanel}>
          {selectedVessel ? (
            <div className={styles.detailCard}>
              <h2>{selectedVessel.name}</h2>
              <p><b>Location:</b> {selectedVessel.location}</p>
              <p><b>Status:</b> {selectedVessel.status}</p>
              <p><b>Fuel:</b> {selectedVessel.fuel}%</p>

              <div className={styles.fuelBar}>
                <div
                  className={styles.fuelFill}
                  style={{ width: `${selectedVessel.fuel}%` }}
                />
              </div>
            </div>
          ) : (
            <div className={styles.emptyDetail}>
              No Vessel Selected
              <br />
              Select a vessel to view details
            </div>
          )}

          <div className={styles.buttons}>
            <button
              className={styles.actionButton}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Vessels
            </button>

            <button
              className={styles.actionButton}
              onClick={openEditModal}
            >
              Edit Vessels
            </button>
          </div>
        </aside>
      </section>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>➕ Add New Vessel</h3>
              <button className={styles.modalClose} onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label>Vessel Name</label>
                <input
                  type="text"
                  placeholder="e.g., MV. Meratus Jaya"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Status</label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                >
                  <option value="In Port">⚓ In Port</option>
                  <option value="En Route">🚢 En Route</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Delayed">⚠️ Delayed</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
              <button className={styles.submitBtn} onClick={handleAddVessel}>Add Vessel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>✏️ Edit Vessel</h3>
              <button className={styles.modalClose} onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.inputGroup}>
                <label>Vessel Name</label>
                <input
                  type="text"
                  placeholder="Vessel name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="In Port">⚓ In Port</option>
                  <option value="En Route">🚢 En Route</option>
                  <option value="Maintenance">🔧 Maintenance</option>
                  <option value="Delayed">⚠️ Delayed</option>
                </select>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button className={styles.submitBtn} onClick={handleEditVessel}>Save Changes</button>
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