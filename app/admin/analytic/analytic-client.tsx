'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './analytic.module.css';


type Vessel = {
  id: number;
  name: string;
  status: string;
  location: string;
  fuel: number;
};

const getVesselMetadata = (vessel: Vessel) => {
  const id = vessel.id || 1;
  const name = vessel.name || "KM Kelud";

  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const speedVal = Math.round(18 + pseudoRandom(id * 1.5) * 22);
  const fuelVal = Math.round(40 + pseudoRandom(id * 2.3) * 55);
  const lastUpdateMin = Math.round(5 + pseudoRandom(id * 3.7) * 50);

  const fuelTrend = Array.from({ length: 7 }, (_, i) => {
    const change = Math.sin(id + i) * 12 + Math.cos(id * 0.5 - i) * 6;
    return Math.round(Math.min(100, Math.max(10, fuelVal - 20 + change)));
  });
  fuelTrend[6] = fuelVal;

  const speedTrend = Array.from({ length: 7 }, (_, i) => {
    const change = Math.sin(id * 0.7 + i) * 0.8 + Math.cos(id * 0.3 - i) * 0.4;
    return parseFloat((10.7 + change).toFixed(1));
  });

  const weatherLocations = [
    { location: "Laut Jawa", region: "Jawa", temp: "29", desc: "Cerah Berawan", bg: "/cloudy_weather.png" },
    { location: "Selat Sunda", region: "Sumatra", temp: "28", desc: "Hujan Ringan", bg: "/cloudy_weather.png" },
    { location: "Selat Makassar", region: "Sulawesi", temp: "27", desc: "Cerah, Angin Tenang", bg: "/calm_weather.png" },
    { location: "Laut Banda", region: "Maluku", temp: "20", desc: "Hujan Badai Disertai petir", bg: "/storm_weather.png" },
    { location: "Laut Flores", region: "Nusa Tenggara", temp: "30", desc: "Cerah", bg: "/clear_weather.png" },
    { location: "Selat Bali", region: "Bali", temp: "29", desc: "Cerah Berawan", bg: "/cloudy_weather.png" },
  ];
  const weather = weatherLocations[id % weatherLocations.length];

  const routes = [
    "Laut Jawa",
    "Selat Sunda",
    "Selat Makassar",
    "Laut Banda",
    "Laut Flores",
    "Selat Bali",
    "Laut Arafura",
    "Laut Maluku"
  ];
  const locationText = routes[id % routes.length];

  const hour = 10 + (id % 12);
  const minuteStr = (id * 15) % 60 === 0 ? "00" : String((id * 15) % 60);
  const etaText = `ETA: April 7, ${hour}:${minuteStr}`;

  return {
    location: locationText,
    eta: etaText,
    speed: `${speedVal} knots`,
    fuelLevel: fuelVal,
    fuelTrend,
    speedTrend,
    weather,
    lastUpdate: `${lastUpdateMin} menit yang lalu`
  };
};

const defaultVessels: Vessel[] = [
  { id: 1, name: "KM Kelud", status: "In Port", location: "Laut Jawa", fuel: 80 },
  { id: 2, name: "KM Dorolonda", status: "En Route", location: "Selat Sunda", fuel: 65 },
  { id: 3, name: "KM Gunung Dempo", status: "In Port", location: "Selat Makassar", fuel: 75 },
  { id: 4, name: "KM Sinabung", status: "Delayed", location: "Laut Banda", fuel: 40 },
  { id: 5, name: "KM Ciremai", status: "Maintenance", location: "Laut Flores", fuel: 55 },
  { id: 6, name: "KM Dobonsolo", status: "In Port", location: "Selat Bali", fuel: 90 }
];

export default function AnalyticPage() {
  const router = useRouter();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selected, setSelected] = useState<Vessel | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    async function loadVessels() {
      try {
        setLoading(true);
        const res = await fetch('/api/map', { cache: 'no-store' });
        const data = await res.json();
        
        const list: Vessel[] = data.vessels && data.vessels.length > 0 ? data.vessels : defaultVessels;
        setVessels(list);
        
        const initialSelected = list.find(v => v.name === "KM Kelud") || list[0] || null;
        setSelected(initialSelected);
      } catch (err) {
        console.error(err);
        setVessels(defaultVessels);
        setSelected(defaultVessels[0]);
      } finally {
        setLoading(false);
      }
    }
    loadVessels();
  }, []);

  useEffect(() => {
  const role = localStorage.getItem("role");

  if (role !== "admin") {
    alert("Anda harus login sebagai Admin!");

    setTimeout(() => {
      router.push("/login");
    }, 1000);

    return;
  }
}, []);

  const filteredVessels = vessels.filter(vessel => {
    return vessel.name.toLowerCase().includes(search.toLowerCase());
  });

  const getBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('port') || s.includes('cargo') || s.includes('biasa') || s.includes('in port')) return styles.inPort;
    if (s.includes('route') || s.includes('en route') || s.includes('jalan')) return styles.enRoute;
    if (s.includes('maint') || s.includes('perbaikan') || s.includes('maintenance')) return styles.maintenance;
    if (s.includes('delay') || s.includes('terlambat') || s.includes('delayed')) return styles.delayed;
    return styles.inPort;
  };

  const meta = selected ? getVesselMetadata(selected) : null;

  const getFuelPointsStr = (trend: number[]) => {
    const xCoords = [50, 115, 180, 245, 310, 375, 440];
    return trend.map((v, idx) => {
      const y = 205 - (v / 100) * 170;
      return `${xCoords[idx]},${y}`;
    }).join(' ');
  };

  const getSpeedPointsStr = (trend: number[]) => {
    const xCoords = [50, 115, 180, 245, 310, 375, 440];
    return trend.map((v, idx) => {
      const y = 205 - ((v - 9.5) / 2.5) * 170;
      return `${xCoords[idx]},${y}`;
    }).join(' ');
  };

  return (
    <main className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.logoBox}>
          <div className={styles.logo}>
            <img
              src="/shipylogo.jpeg"
              alt="Shipy Logo"
              className={styles.logoImage}
            />
          </div>
        </div>

        <nav className={styles.nav}>
          <Link href="/admin/dashboard" className={styles.navItem}>Dashboard</Link>
          <Link href="/admin/fleet" className={styles.navItem}>Fleet</Link>
          <Link href="/admin/cargo" className={styles.navItem}>Cargo</Link>
          <Link href="/admin/map" className={styles.navItem}>Map</Link>
          <Link href="/admin/analytic" className={`${styles.navItem} ${styles.active}`}>Analytic</Link>
        </nav>

        <div className={styles.userBox}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Admin</span>
            <span className={styles.userRole}>Administrator</span>
          </div>
          <div 
            className={styles.userIcon}
            onClick={() => setIsLogoutModalOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <img src="/profile.png" alt="Admin" className={styles.userImage} />
          </div>
        </div>
        </header>

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
            {loading ? (
              <p className={styles.loadingText}>Loading...</p>
            ) : filteredVessels.length === 0 ? (
              <p className={styles.loadingText}>No vessels found</p>
            ) : (
              filteredVessels.map((vessel) => {
                const vesselMeta = getVesselMetadata(vessel);
                let displayStatus = vessel.status;
                if (vessel.status === 'Cargo' || vessel.status === 'Cargo' || displayStatus === 'Indonesia') {
                  const statuses = ["In Port", "En Route", "In Port", "Delayed", "Maintenance", "In Port"];
                  displayStatus = statuses[vessel.id % statuses.length];
                }
                
                return (
                  <div
                    key={vessel.id}
                    className={`${styles.vesselCard} ${
                      selected?.id === vessel.id ? styles.selected : ''
                    }`}
                    onClick={() => setSelected(vessel)}
                  >
                    <div className={styles.cardTop}>
                      <h3>{vessel.name}</h3>
                      <span className={`${styles.badge} ${getBadgeClass(displayStatus)}`}>
                        {displayStatus}
                      </span>
                    </div>
                    <p className={styles.location}>📍 {vesselMeta.location}</p>
                    <small className={styles.eta}>{vesselMeta.eta}</small>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        <section className={styles.middleCol}>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3>FUEL LEVEL TREND</h3>
              <div className={styles.legendRow}>
                <div className={styles.legendBox}></div>
                <span>Tingkat bahan bakar (%)</span>
              </div>
            </div>

            {meta && (
              <div className={styles.chartWrapper}>
                <svg viewBox="0 0 500 240" className={styles.chartSvg}>
                  {[0, 20, 40, 60, 80, 100].map((val) => {
                    const y = 205 - (val / 100) * 170;
                    return (
                      <g key={val}>
                        <line x1="45" y1={y} x2="460" y2={y} className={styles.gridLine} />
                        <text x="35" y={y + 4} className={styles.axisLabelY}>{val}</text>
                      </g>
                    );
                  })}

                  <polyline
                    fill="none"
                    stroke="#5cdb5c"
                    strokeWidth="2.5"
                    points={getFuelPointsStr(meta.fuelTrend)}
                    className={styles.greenPolyline}
                  />

                  {meta.fuelTrend.map((v, idx) => {
                    const xCoords = [50, 115, 180, 245, 310, 375, 440];
                    const y = 205 - (v / 100) * 170;
                    return (
                      <circle
                        key={idx}
                        cx={xCoords[idx]}
                        cy={y}
                        r="4"
                        fill="#5cdb5c"
                        stroke="#ffffff"
                        strokeWidth="1.2"
                      />
                    );
                  })}

                  {["Hari 1", "Hari 2", "Hari 3", "Hari 4", "Hari 5", "Hari 6", "Hari ini"].map((label, idx) => {
                    const xCoords = [50, 115, 180, 245, 310, 375, 440];
                    return (
                      <text key={label} x={xCoords[idx]} y="228" textAnchor="middle" className={styles.axisLabelX}>
                        {label}
                      </text>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {selected && meta && (
            <div className={styles.panelCard}>
              <div className={styles.selectedVesselHeader}>
                <h2>{selected.name}</h2>
                <span className={`${styles.badge} ${getBadgeClass(
                  ["In Port", "En Route", "In Port", "Delayed", "Maintenance", "In Port"][selected.id % 6]
                )}`}>
                  {["In Port", "En Route", "In Port", "Delayed", "Maintenance", "In Port"][selected.id % 6]}
                </span>
              </div>

              <div className={styles.kpiContainer}>
                <div className={styles.kpiRow}>
                  <div className={styles.kpiLabelBox}>
                    <svg viewBox="0 0 24 24" className={styles.kpiIcon}>
                      <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,14.4 19,16.55 17.38,18.12L15.96,16.7C17.23,15.53 18,13.86 18,12A6,6 0 0,0 12,6A6,6 0 0,0 6,12C6,13.86 6.77,15.53 8.04,16.7L6.62,18.12C5,16.55 4,14.4 4,12A8,8 0 0,1 12,4M12,8A4,4 0 0,0 8,12C8,13.2 8.5,14.3 9.34,15.07L10.76,13.65C10.29,13.29 10,12.7 10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12C14,12.7 13.71,13.29 13.24,13.65L14.66,15.07C15.5,14.3 16,13.2 16,12A4,4 0 0,0 12,8M12,12A1,1 0 0,0 11,13A1,1 0 0,0 12,14A1,1 0 0,0 13,13A1,1 0 0,0 12,12Z" />
                    </svg>
                    <span>Kecepatan</span>
                  </div>
                  <strong className={styles.kpiValue}>{meta.speed}</strong>
                </div>

                <div className={styles.kpiRow}>
                  <div className={styles.kpiLabelBox}>
                    <svg viewBox="0 0 24 24" className={styles.kpiIcon}>
                      <path fill="currentColor" d="M19,7.5H18V3H10V6A3,3 0 0,0 7,9V18A3,3 0 0,0 10,21H18A3,3 0 0,0 21,18V12.5A3.5,3.5 0 0,0 19,7.5M12,5H16V7H12V5M18,19H10A1,1 0 0,1 9,18V9A1,1 0 0,1 10,8H18A1,1 0 0,1 19,9V18A1,1 0 0,1 18,19M19,11.5A1.5,1.5 0 0,1 17.5,10A1.5,1.5 0 0,1 19,8.5A1.5,1.5 0 0,1 20.5,10A1.5,1.5 0 0,1 19,11.5Z" />
                    </svg>
                    <span>Tingkat bahan bakar</span>
                  </div>
                  <div className={styles.kpiProgressContainer}>
                    <div className={styles.kpiProgressBar}>
                      <div
                        className={styles.kpiProgressFill}
                        style={{ width: `${meta.fuelLevel}%` }}
                      ></div>
                    </div>
                    <strong className={styles.kpiValue}>{meta.fuelLevel}%</strong>
                  </div>
                </div>

                <div className={styles.kpiRow}>
                  <div className={styles.kpiLabelBox}>
                    <svg viewBox="0 0 24 24" className={styles.kpiIcon}>
                      <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                    </svg>
                    <span>Update terakhir</span>
                  </div>
                  <strong className={styles.kpiValue}>{meta.lastUpdate}</strong>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className={styles.rightCol}>
          {meta && (
            <div
              className={styles.weatherCard}
              style={{ backgroundImage: `url(${meta.weather.bg})` }}
            >
              <div className={styles.weatherOverlay}>
                <div className={styles.weatherHeader}>
                  <svg viewBox="0 0 24 24" className={styles.weatherPinIcon}>
                    <path fill="currentColor" d="M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2M12,4A5,5 0 0,1 17,9C17,12.42 13.91,17.29 12,19.74C10.09,17.29 7,12.42 7,9A5,5 0 0,1 12,4M12,6A3,3 0 0,0 9,9A3,3 0 0,0 12,12A3,3 0 0,0 15,9A3,3 0 0,0 12,6Z" />
                  </svg>
                  <span>{meta.weather.location}</span>
                </div>

                <div className={styles.weatherRegion}>{meta.weather.region}</div>
                
                <div className={styles.weatherTempRow}>
                  <span className={styles.weatherTemp}>{meta.weather.temp}</span>
                  <span className={styles.weatherDegreeCircle}>°</span>
                </div>

                <div className={styles.weatherDesc}>{meta.weather.desc}</div>
              </div>
            </div>
          )}

          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h3>{selected ? selected.name : "KM Kelud"}</h3>
              <div className={styles.legendRow}>
                <div className={`${styles.legendBox} ${styles.blueLegendBox}`}></div>
                <span>Kecepatan</span>
              </div>
            </div>

            {meta && (
              <div className={styles.chartWrapper}>
                <svg viewBox="0 0 500 240" className={styles.chartSvg}>
                  {[9.5, 10.0, 10.5, 11.0, 11.5, 12.0].map((val) => {
                    const y = 205 - ((val - 9.5) / 2.5) * 170;
                    return (
                      <g key={val}>
                        <line x1="45" y1={y} x2="460" y2={y} className={styles.gridLine} />
                        <text x="35" y={y + 4} className={styles.axisLabelY}>{val.toFixed(1)}</text>
                      </g>
                    );
                  })}

                  <polyline
                    fill="none"
                    stroke="#4ba3ff"
                    strokeWidth="2.5"
                    points={getSpeedPointsStr(meta.speedTrend)}
                    className={styles.bluePolyline}
                  />

                  {meta.speedTrend.map((v, idx) => {
                    const xCoords = [50, 115, 180, 245, 310, 375, 440];
                    const y = 205 - ((v - 9.5) / 2.5) * 170;
                    return (
                      <circle
                        key={idx}
                        cx={xCoords[idx]}
                        cy={y}
                        r="4"
                        fill="#4ba3ff"
                        stroke="#ffffff"
                        strokeWidth="1.2"
                      />
                    );
                  })}

                  {["Hari 1", "Hari 2", "Hari 3", "Hari 4", "Hari 5", "Hari 6", "Hari ini"].map((label, idx) => {
                    const xCoords = [50, 115, 180, 245, 310, 375, 440];
                    return (
                      <text key={label} x={xCoords[idx]} y="228" textAnchor="middle" className={styles.axisLabelX}>
                        {label}
                      </text>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
