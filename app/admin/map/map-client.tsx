'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './map.module.css';
import Megamenu from '@/app/ui/megamenu/megamenu';

type Vessel = {
  id: number;
  name: string;
  status: string;
  location: string;
  fuel: number;
};

const vesselData: Record<string, {
  captain: string;
  destination: string;
  speed: string;
  x: number;
  y: number;
}> = {
  'KM Kelud':        { captain: 'Capt. Herman Prasetyo', destination: 'Pelabuhan Tanjung Priok, Jakarta',   speed: '18.5 knots', x: 79.4, y: 51.2 },
  'KM Dorolonda':    { captain: 'Capt. Budi Santoso',    destination: 'Pelabuhan Tanjung Perak, Surabaya',  speed: '16.2 knots', x: 80.8, y: 49.8 },
  'KM Gunung Dempo': { captain: 'Capt. Ahmad Fauzi',     destination: 'Pelabuhan Belawan, Medan',           speed: '19.0 knots', x: 75.8, y: 46.4 },
  'KM Sinabung':     { captain: 'Capt. Yusuf Wijaya',    destination: 'Pelabuhan Soekarno-Hatta, Makassar', speed: '15.8 knots', x: 81.6, y: 50.3 },
  'KM Ciremai':      { captain: 'Capt. Agus Santoso',    destination: 'Pelabuhan Tanjung Priok, Jakarta',   speed: '17.2 knots', x: 77.9, y: 50.7 },
  'KM Dobonsolo':    { captain: 'Capt. Rudi Hartono',    destination: 'Pelabuhan Tanjung Perak, Surabaya',  speed: '16.8 knots', x: 79.9, y: 51.6 },
  'KM Nggapulu':     { captain: 'Capt. Slamet Riyadi',   destination: 'Pelabuhan Ambon, Maluku',            speed: '15.5 knots', x: 83.2, y: 49.2 },
  'KM Labobar':      { captain: 'Capt. Dedi Kusuma',     destination: 'Pelabuhan Makassar',                 speed: '18.0 knots', x: 81.2, y: 51.0 },
  'KM Awu':          { captain: 'Capt. Wahyu Prasetyo',  destination: 'Pelabuhan Bima, NTB',                speed: '16.0 knots', x: 81.0, y: 51.8 },
  'KM Binaiya':      { captain: 'Capt. Eko Purnomo',     destination: 'Pelabuhan Ambon, Maluku',            speed: '17.5 knots', x: 83.8, y: 50.0 },
  'MV Merapi':       { captain: 'Capt. Fajar Nugroho',   destination: 'Pelabuhan Ciwandan, Banten',         speed: '14.5 knots', x: 77.4, y: 51.4 },
};

const getDefaultData = (name: string) => vesselData[name] || {
  captain: 'Capt. Unknown',
  destination: 'Pelabuhan Domestik, Indonesia',
  speed: '17.0 knots',
  x: 80, y: 50,
};

const getColorByStatus = (status: string) => {
  switch (status) {
    case 'En Route':    return '#1a5fd4'; // Biru
    case 'In Port':     return '#2fae46'; // Hijau
    case 'Maintenance': return '#d31d1d'; // Merah
    case 'Delayed':     return '#e07b00'; // Oranye
    default:            return '#2fae46';
  }
};

export default function AdminMapPage() {
  const router = useRouter();
  const mapBoxRef = useRef<HTMLDivElement>(null);

  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selected, setSelected] = useState<Vessel | null>(null);
  const [search, setSearch] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false, message: '', type: 'success',
  });

  // ── Zoom & pan — default 1 & 0,0 ──
  const [zoom, setZoom] = useState(1);
  const [pan, setPan]   = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const panStart  = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      alert('Anda harus login sebagai Admin!');
      setTimeout(() => router.push('/login'), 1000);
      return;
    }
    // Fetch vessels — TIDAK auto zoom, peta mulai dari 100%
    fetch('/api/map')
      .then(r => r.json())
      .then(data => {
        const list = data.vessels || [];
        setVessels(list);
        if (list.length > 0) setSelected(list[0]); // hanya set info, tidak zoom
      });
  }, []);

  // ── Klik card → zoom ke lokasi kapal ──
  const handleSelectVessel = (vessel: Vessel) => {
    setSelected(vessel);
    const d = getDefaultData(vessel.name);
    const box = mapBoxRef.current;
    if (!box) return;

    const targetZoom = 2.5;
    const boxW = box.clientWidth;
    const boxH = box.clientHeight;

    // Clamp pan agar gambar tidak keluar dari kotak
    const imgW = boxW * targetZoom;
    const imgH = boxH * targetZoom;
    const rawX = boxW / 2 - (d.x / 100) * imgW;
    const rawY = boxH / 2 - (d.y / 100) * imgH;

    // Batas pan: gambar tidak boleh keluar kotak
    const minX = boxW - imgW;
    const minY = boxH - imgH;
    const clampedX = Math.min(0, Math.max(minX, rawX));
    const clampedY = Math.min(0, Math.max(minY, rawY));

    setZoom(targetZoom);
    setPan({ x: clampedX, y: clampedY });
  };

  // ── Pan (drag) dengan clamp ──
  const onMouseDown = (e: React.MouseEvent) => {
    isPanning.current = true;
    panStart.current  = { x: e.clientX, y: e.clientY };
    panOrigin.current = { ...pan };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const box = mapBoxRef.current;
    if (!box) return;

    const rawX = panOrigin.current.x + (e.clientX - panStart.current.x);
    const rawY = panOrigin.current.y + (e.clientY - panStart.current.y);

    // Clamp agar gambar tidak keluar dari kotak
    const imgW  = box.clientWidth  * zoom;
    const imgH  = box.clientHeight * zoom;
    const minX  = box.clientWidth  - imgW;
    const minY  = box.clientHeight - imgH;

    setPan({
      x: Math.min(0, Math.max(minX, rawX)),
      y: Math.min(0, Math.max(minY, rawY)),
    });
  };

  const onMouseUp = () => { isPanning.current = false; };

  // ── Zoom dengan clamp pan ──
  const applyZoom = (newZoom: number) => {
    const box = mapBoxRef.current;
    if (!box) return;
    const imgW = box.clientWidth  * newZoom;
    const imgH = box.clientHeight * newZoom;
    const minX = box.clientWidth  - imgW;
    const minY = box.clientHeight - imgH;
    setPan(p => ({
      x: Math.min(0, Math.max(minX, p.x)),
      y: Math.min(0, Math.max(minY, p.y)),
    }));
    setZoom(newZoom);
  };

  const handleZoomIn  = () => applyZoom(Math.min(4, parseFloat((zoom + 0.5).toFixed(1))));
  const handleZoomOut = () => applyZoom(Math.max(1, parseFloat((zoom - 0.5).toFixed(1))));
  const handleReset   = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const filtered = vessels.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveStatus = async () => {
    if (!newStatus) { showToast('⚠️ Pilih status baru terlebih dahulu', 'error'); return; }
    if (!selected)  { showToast('⚠️ Pilih kapal terlebih dahulu', 'error'); return; }
    setIsSaving(true);
    try {
      const res = await fetch('/api/map', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        const updated = { ...selected, status: newStatus };
        setSelected(updated);
        setVessels(prev => prev.map(v => v.id === selected.id ? updated : v));
        showToast('✅ Status kapal berhasil disimpan', 'success');
        setIsEditOpen(false);
        setNewStatus('');
      } else {
        showToast(result.error || 'Gagal menyimpan status', 'error');
      }
    } catch {
      showToast('Koneksi gagal', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    sessionStorage.clear();
    router.push('/login');
  };

  const selData  = selected ? getDefaultData(selected.name) : null;
  const pinColor = selected ? getColorByStatus(selected.status) : '#ffa502';

  return (
    <main className={styles.container}>
      <Megamenu onLogout={() => setIsLogoutModalOpen(true)} />

      <div className={styles.rightNavSection}>
        <button className={styles.editButton} onClick={() => setIsEditOpen(true)}>
          Edit Status Kapal
        </button>
      </div>

      <section className={styles.content}>
        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>ACTIVE FLEET</h2>
          <input
            className={styles.search}
            placeholder="Search vessel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.list}>
            {filtered.map((vessel) => (
              <div
                key={vessel.id}
                className={`${styles.vesselCard} ${selected?.id === vessel.id ? styles.selected : ''}`}
                onClick={() => handleSelectVessel(vessel)}
              >
                <div className={styles.vesselInfo}>
                  <span className={styles.vesselName}>{vessel.name}</span>
                  <span className={styles.vesselLocation}>📍 {vessel.location}</span>
                </div>
                <span className={styles.vesselBadge} style={{ backgroundColor: getColorByStatus(vessel.status) }}>
                  {vessel.status}
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── MAP AREA ── */}
        <section className={styles.mapArea}>
          <div
            ref={mapBoxRef}
            className={styles.mapBox}
            style={{ cursor: isPanning.current ? 'grabbing' : (zoom > 1 ? 'grab' : 'default') }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Inner — clip di dalam mapBox karena overflow: hidden */}
            <div
              className={styles.mapInner}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',  // ← origin pojok kiri atas agar clamp konsisten
              }}
            >
              <img
                src="/world-map-neon.png"
                alt="Peta Dunia"
                className={styles.mapImage}
                draggable={false}
              />

              {/* Pin hanya untuk kapal yang dipilih */}
              {selected && selData && (
                <div
                  className={styles.radarPin}
                  style={{
                    left: `${selData.x}%`,
                    top:  `${selData.y}%`,
                    backgroundColor: pinColor,
                    color: pinColor,
                    width: 20, height: 20,
                    marginLeft: -10, marginTop: -10,
                    boxShadow: `0 0 20px ${pinColor}, 0 0 40px ${pinColor}`,
                    zIndex: 10,
                  }}
                >
                  <div className={styles.radarPinRing} style={{ borderColor: pinColor }} />
                  <div style={{
                    position: 'absolute',
                    top: -28, left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.85)',
                    color: 'white',
                    fontSize: 11, fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    whiteSpace: 'nowrap',
                    border: `1px solid ${pinColor}`,
                    pointerEvents: 'none',
                  }}>
                    {selected.name}
                  </div>
                </div>
              )}
            </div>

            {/* ── ZOOM CONTROLS ── */}
            <div className={styles.zoomControls}>
              <button className={styles.zoomBtn} onClick={handleZoomIn}  disabled={zoom >= 4}>+</button>
              <div className={styles.zoomDivider} />
              <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
              <div className={styles.zoomDivider} />
              <button className={styles.zoomBtn} onClick={handleZoomOut} disabled={zoom <= 1}>−</button>
            </div>

            {zoom > 1 && (
              <button className={styles.resetZoomBtn} onClick={handleReset}>⟳ Reset</button>
            )}
          </div>

          {/* ── INFO BOX ── */}
          <div className={styles.infoBox}>
            <h2>Detail Kapal: {selected?.name || 'No Vessel Selected'}</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>🧑‍✈️ Kapten</span>
                <span className={styles.infoValue}>{selData?.captain || '-'}</span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>📍 Tujuan</span>
                <span className={styles.infoValue}>{selData?.destination || '-'}</span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>🚦 Status</span>
                <span className={styles.infoValue} style={{ color: pinColor, fontWeight: 700 }}>
                  {selected?.status || '-'}
                </span>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoLabel}>⚡ Kecepatan</span>
                <span className={styles.infoValue}>{selData?.speed || '-'}</span>
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
            <label>Kapal yang dipilih</label>
            <div className={styles.currentStatus}>🚢 <b>{selected?.name || '-'}</b></div>
            <label>Status saat ini</label>
            <div className={styles.currentStatus} style={{ color: pinColor }}>
              ● {selected?.status || '-'} — {selected?.location}
            </div>
            <label>Status Kapal Baru</label>
            <select className={styles.statusInput} value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              <option value="">— Pilih status baru —</option>
              <option value="In Port">⚓ In Port</option>
              <option value="En Route">🚢 En Route</option>
              <option value="Maintenance">🔧 Maintenance</option>
              <option value="Delayed">⚠️ Delayed</option>
            </select>
            <div className={styles.modalFooter}>
              <button className={styles.cancelStatus} onClick={() => { setIsEditOpen(false); setNewStatus(''); }}>Batal</button>
              <button className={styles.saveStatus} onClick={handleSaveStatus} disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan'}
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
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : ''}`}>
          <span>{toast.message}</span>
          <button className={styles.toastClose} onClick={() => setToast({ show: false, message: '', type: 'success' })}>×</button>
        </div>
      )}
    </main>
  );
}
