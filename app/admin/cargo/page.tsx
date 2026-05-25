'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function CargoAdminPage() {
  const [cargo, setCargo] = useState<Cargo[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Cargo | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

const getCargo = async () => {
  const res = await fetch(`/api/pengiriman?search=${search}&page=${page}&limit=4`, {
    cache: 'no-store',
  });

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
  };

  return (
    <main className={styles.container}>
      <header className={styles.topbar}>
        <img src="/shipylogo.jpeg" alt="Shipy" className={styles.logo} />

        <nav className={styles.nav}>
          <Link href="/admin/dashboard" className={styles.navItem}>Dashboard</Link>
          <Link href="/admin/fleet" className={styles.navItem}>Fleet</Link>
          <Link href="/admin/cargo" className={`${styles.navItem} ${styles.active}`}>Cargo</Link>
          <Link href="#" className={styles.navItem}>Map</Link>
          <Link href="#" className={styles.navItem}>Analytic</Link>
        </nav>

        <img src="/profile.png" alt="Admin" className={styles.profile} />
      </header>

      <section className={styles.mainGrid}>
        <section className={styles.leftPanel}>
          <div className={styles.leftHeader}>
            <h2>Cargo List</h2>

            <input
              className={styles.search}
              placeholder="Search no resi / pengirim / penerima"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.cargoGrid}>
            {cargo.length === 0 ? (
              <p className={styles.empty}>No cargo found</p>
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

              <button
                className={styles.deleteButton}
                onClick={() => deleteCargo(selected.id)}
              >
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
            <Link href="/admin/cargo/add" className={styles.actionButton}>
              Add Cargo
            </Link>

            <Link href="/admin/cargo/edit" className={styles.actionButton}>
              Edit Cargo
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}