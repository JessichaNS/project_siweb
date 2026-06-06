'use client';

import styles from './fleetadm.module.css';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type Vessel = {
  id: number;
  name: string;
  type: string;
  status: string;
  location: string;
  fuel: number;
};

type VesselForm = {
  name: string;
  type: string;
  status: string;
};

const initialForm: VesselForm = {
  name: '',
  type: 'Cargo',
  status: 'In Port',
};

export default function FleetAdminPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newVessel, setNewVessel] = useState<VesselForm>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const getVessels = useCallback(
    async (targetPage = page) => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/vessels?search=${search}&page=${targetPage}&limit=4`,
          {
            cache: 'no-store',
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || 'Gagal mengambil data vessels');
          return;
        }

        setVessels(data.vessels || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        console.log(error);
        alert('Terjadi kesalahan saat mengambil data vessels');
      } finally {
        setLoading(false);
      }
    },
    [search, page]
  );

  useEffect(() => {
    getVessels(page);
  }, [getVessels, page]);

  const handleAddVessel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newVessel.name.trim()) {
      alert('Nama kapal wajib diisi');
      return;
    }

    try {
      setSaving(true);

      const res = await fetch('/api/vessels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVessel),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Gagal menambahkan vessel');
        return;
      }

      alert('Vessel berhasil ditambahkan');

      setNewVessel(initialForm);
      setIsAddOpen(false);
      setPage(1);
      await getVessels(1);
    } catch (error) {
      console.log(error);
      alert('Terjadi kesalahan saat menambahkan vessel');
    } finally {
      setSaving(false);
    }
  };

  const getBadgeClass = (status: string) => {
    if (status === 'In Port') return styles.inPort;
    if (status === 'En Route') return styles.enRoute;
    if (status === 'Maintenance') return styles.maintenance;
    if (status === 'Delayed') return styles.delayed;
    return '';
  };

  return (
    <main className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.logoBox}>
          <Link href="/admin/dashboard" className={styles.logo}>
            <img
              src="/shipylogo.jpeg"
              alt="Shipy Logo"
              className={styles.logoImage}
            />
          </Link>
        </div>

        <nav className={styles.nav}>
          <Link href="/admin/dashboard" className={styles.navItem}>
            Dashboard
          </Link>
          <Link href="/admin/fleet" className={`${styles.navItem} ${styles.active}`}>
            Fleet
          </Link>
          <Link href="/admin/cargo" className={styles.navItem}>
            Cargo
          </Link>
          <Link href="/admin/map" className={styles.navItem}>
            Map
          </Link>
          <Link href="/admin/analytic" className={styles.navItem}>
            Analytic
          </Link>
        </nav>

        <div className={styles.userBox}>
          <div className={styles.userIcon}>
            <img src="/profile.png" alt="User" className={styles.userImage} />
          </div>
        </div>
      </header>

      <section className={styles.mainGrid}>
        <div className={styles.leftPanel}>
          <div className={styles.leftHeader}>
            <h2>Vessel List</h2>

            <input
              className={styles.search}
              placeholder="Search vessel..."
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

                  <p className={styles.location}>{vessel.location}</p>
                  <p className={styles.location}>Type: {vessel.type}</p>

                  <div className={styles.fuelRow}>
                    <span>Fuel Level</span>
                    <strong>{vessel.fuel}%</strong>
                  </div>

                  <div className={styles.fuelBar}>
                    <div
                      className={styles.fuelFill}
                      style={{
                        width: `${vessel.fuel}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.pagination}>
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              ←
            </button>

            <span>
              {page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              →
            </button>
          </div>
        </div>

        <div className={styles.rightPanel}>
          {selectedVessel ? (
            <div className={styles.detailCard}>
              <h2>{selectedVessel.name}</h2>
              <p>Location: {selectedVessel.location}</p>
              <p>Type: {selectedVessel.type}</p>
              <p>Status: {selectedVessel.status}</p>
              <p>Fuel: {selectedVessel.fuel}%</p>
            </div>
          ) : (
            <div className={styles.emptyDetail}>
              <div>
                <p>No Vessel Selected</p>
                <span>Select a vessel to view details</span>
              </div>
            </div>
          )}

          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.actionButton}
              onClick={() => setIsAddOpen(true)}
            >
              Add Vessels
            </button>

            <button
              type="button"
              className={styles.actionButton}
              onClick={() => alert('Pilih vessel dulu, nanti fitur edit bisa disambungkan.')}
            >
              Edit Vessels
            </button>
          </div>
        </div>
      </section>

      {isAddOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <form
            onSubmit={handleAddVessel}
            style={{
              width: '420px',
              background: '#2a0d45',
              border: '2px solid #5f37ff',
              borderRadius: '22px',
              padding: '24px',
              color: 'white',
            }}
          >
            <h2 style={{ marginBottom: '18px' }}>Add Vessel</h2>

            <label style={{ display: 'block', marginBottom: '8px' }}>
              Vessel Name
            </label>
            <input
              type="text"
              value={newVessel.name}
              onChange={(e) =>
                setNewVessel({
                  ...newVessel,
                  name: e.target.value,
                })
              }
              placeholder="Contoh: KM Sinabung"
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                marginBottom: '16px',
              }}
            />

            <label style={{ display: 'block', marginBottom: '8px' }}>
              Vessel Type
            </label>
            <select
              value={newVessel.type}
              onChange={(e) =>
                setNewVessel({
                  ...newVessel,
                  type: e.target.value,
                })
              }
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                marginBottom: '16px',
              }}
            >
              <option value="Cargo">Cargo</option>
              <option value="Passenger">Passenger</option>
              <option value="Tanker">Tanker</option>
              <option value="Container">Container</option>
            </select>

            <label style={{ display: 'block', marginBottom: '8px' }}>
              Vessel Status
            </label>
            <select
              value={newVessel.status}
              onChange={(e) =>
                setNewVessel({
                  ...newVessel,
                  status: e.target.value,
                })
              }
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                marginBottom: '20px',
              }}
            >
              <option value="In Port">In Port</option>
              <option value="En Route">En Route</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Delayed">Delayed</option>
            </select>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setNewVessel(initialForm);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #5f37ff',
                  background: '#2d1048',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#6d4cff',
                  color: 'white',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}