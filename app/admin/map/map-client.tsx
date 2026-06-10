'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './map.module.css';
import Megamenu from '@/app/ui/megamenu/megamenu';

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
  fuel: number;
  speed: string;
  pinColor: string;
  position: {
    top: string;
    left?: string;
    right?: string;
  };
};

const dummyDetails: Record<string, Omit<VesselDetail, 'pinColor' | 'fuel'>> = {
  'KM Kelud': {
    captain: 'Capt. Herman Prasetyo',
    destination: 'Pelabuhan Tanjung Priok, Jakarta',
    speed: '18.5 knots',
    position: { top: '62%', left: '20%' },
  },
  'KM Dorolonda': {
    captain: 'Capt. Budi Santoso',
    destination: 'Pelabuhan Tanjung Perak, Surabaya',
    speed: '16.2 knots',
    position: { top: '55%', right: '9%' },
  },
  'KM Gunung Dempo': {
    captain: 'Capt. Ahmad Fauzi',
    destination: 'Pelabuhan Belawan, Medan',
    speed: '19.0 knots',
    position: { top: '42%', right: '12%' },
  },
  'KM Sinabung': {
    captain: 'Capt. Yusuf Wijaya',
    destination: 'Pelabuhan Soekarno-Hatta, Makassar',
    speed: '15.8 knots',
    position: { top: '70%', left: '8%' },
  },
};

const getColorByStatus = (status: string): string => {
  switch (status) {
    case 'En Route':    return '#2ed573';
    case 'In Port':     return '#ffa502';
    case 'Maintenance': return '#ff4757';
    default:            return '#2e7dd1';
  }
};

const getVesselDetails = (vessel: Vessel | null): VesselDetail | null => {
  if (!vessel) return null;
  const baseDetail = dummyDetails[vessel.name] || {
    captain: 'Capt. John Doe',
    destination: 'Pelabuhan Domestik, Indonesia',
    speed: '17.0 knots',
    position: { top: '50%', left: '50%' },
  };
  return {
    ...baseDetail,
    fuel: vessel.fuel || 80,
    pinColor: getColorByStatus(vessel.status),
  };
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export default function AdminMapPage() {
  const router = useRouter();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selected, setSelected] = useState<Vessel | null>(null);
  const [search, setSearch] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [toast, setToast] = useState<{show: boolean; message: string; type: 'success'|'error'}>({ show: false, message: '', type: 'success' });

  const showToast = (message: string, type: 'success'|'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // ── zoom & pan state ──
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const mapBoxRef = useRef<HTMLDivElement>(null);

  const details = getVesselDetails(selected);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      alert('Anda harus login sebagai Admin!');
      setTimeout(() => router.push('/login'), 1000);
    }
  }, []);

  useEffect(() => {
    async function getVessels() {
      const res = await fetch('/api/map', { cache: 'no-store' });
      const data = await res.json();
      setVessels(data.vessels || []);
      setSelected(data.vessels?.[0] || null);
    }
    getVessels();
  }, []);

  const filtered = vessels.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── zoom helpers ──
  const zoomIn  = () => setZoom((z) => Math.min(+(z + ZOOM_STEP).toFixed(1), MAX_ZOOM));
  const zoomOut = () => setZoom((z) => {
    const next = Math.max(+(z - ZOOM_STEP).toFixed(1), MIN_ZOOM);
    if (next === MIN_ZOOM) setPan({ x: 0, y: 0 });
    return next;
  });
  const resetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // ── scroll to zoom ──
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  // ── drag to pan ──
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
  };

  const handleMouseUp = () => { isDragging.current = false; };

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
      <Megamenu onLogout={() => setIsLogoutModalOpen(true)} />

        <div className={styles.rightNavSection}>
          <button className={styles.editButton} onClick={() => setIsEditOpen(true)}>
            Edit Status Kapal
          </button>
        </div>

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
                className={`${styles.vesselCard} ${selected?.id === vessel.id ? styles.selected : ''}`}
                onClick={() => setSelected(vessel)}
              >
                <span style={{ backgroundColor: getColorByStatus(vessel.status) }}>
                  {vessel.status}
                </span>
                <h3>{vessel.name}</h3>
                <p>📍 {vessel.location}</p>
                <small>ETA: April 7, 14:30</small>
              </div>
            ))}
          </div>
        </aside>

        <section className={styles.mapArea}>
          {/* ── MAP BOX ── */}
          <div
            ref={mapBoxRef}
            className={styles.mapBox}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoom > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default' }}
          >
            {/* map image + pins inside a zoomable/pannable wrapper */}
            <div
              className={styles.mapInner}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
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
                  <div
                    className={styles.radarPinRing}
                    style={{ borderColor: details.pinColor }}
                  />
                </div>
              )}
            </div>

            {/* ── ZOOM CONTROLS ── */}
            <div className={styles.zoomControls}>
              <button className={styles.zoomBtn} onClick={zoomIn}  disabled={zoom >= MAX_ZOOM} title="Zoom In">+</button>
              <div className={styles.zoomDivider} />
              <button className={styles.zoomBtn} onClick={resetZoom} title="Reset View">⟳</button>
              <div className={styles.zoomDivider} />
              <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
              <div className={styles.zoomDivider} />
              <button className={styles.zoomBtn} onClick={zoomOut} disabled={zoom <= MIN_ZOOM} title="Zoom Out">−</button>
            </div>
          </div>

          {/* ── INFO BOX ── */}
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
                <span className={styles.infoLabel}>⛽ Bensin (Fuel)</span>
                <div className={styles.fuelContainer}>
                  <span className={styles.infoValue}>{details?.fuel || 0}%</span>
                  <div className={styles.miniFuelBar}>
                    <div className={styles.miniFuelFill} style={{ width: `${details?.fuel || 0}%` }} />
                  </div>
                </div>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>⚡ Kecepatan</span>
                <span className={styles.infoValue}>{details?.speed || '-'}</span>
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* ── EDIT STATUS MODAL ── */}
      {isEditOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEditOpen(false)}>
          <div className={styles.statusModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Status Kapal</h2>
              <button className={styles.modalClose} onClick={() => setIsEditOpen(false)}>×</button>
            </div>
            <label>Status kapal sekarang</label>
            <div className={styles.currentStatus}>
              🟢 {selected?.status || 'Tidak ada status'} — {selected?.location}
            </div>
            <label>Status Kapal Baru</label>
            <select
              className={styles.statusInput}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">— Pilih status baru —</option>
              <option value="In Port">⚓ In Port</option>
              <option value="En Route">🚢 En Route</option>
              <option value="Maintenance">🔧 Maintenance</option>
              <option value="Delayed">⚠️ Delayed</option>
            </select>
            <div className={styles.modalFooter}>
              <button className={styles.cancelStatus} onClick={() => { setIsEditOpen(false); setNewStatus(''); }}>
                Batal
              </button>
              <button
                className={styles.saveStatus}
                onClick={() => {
                  if (!newStatus) {
                    showToast('⚠️ Pilih status baru terlebih dahulu', 'error');
                    return;
                  }
                  showToast('✅ Status kapal berhasil disimpan', 'success');
                  setIsEditOpen(false);
                  setNewStatus('');
                }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast.show && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          <span>{toast.message}</span>
          <button className={styles.toastClose} onClick={() => setToast({ show: false, message: '', type: 'success' })}>×</button>
        </div>
      )}
    </main>
  );
}
