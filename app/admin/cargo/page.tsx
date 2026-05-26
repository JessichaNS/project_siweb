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
const [isAddOpen, setIsAddOpen] = useState(false);

const [addForm, setAddForm] = useState({
  no_resi: '',
  tanggal_transaksi: '',
  nama_penerima: '',
  no_telepon: '',
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
    `/api/pengiriman?search=${search}&page=${page}&limit=100`
  );

  const data = await res.json();

  setCargo(data.pengiriman || []);
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
          <Link href="/admin/map" className={styles.navItem}>Map</Link>
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
<button
  className={styles.actionButton}
  onClick={() => setIsAddOpen(true)}
>
  Add Cargo
</button>

            <button
  className={styles.actionButton}
  onClick={() => {
    if (!selected) return;

    setEditForm({
      id: String(selected.id),
      no_resi: selected.no_resi,
      nama_penerima: selected.nama_penerima,
      no_telepon: selected.no_telepon,
      kota_asal: selected.kota_asal,
      kota_tujuan: selected.kota_tujuan,
      jenis_pengiriman: selected.jenis_pengiriman,
      status: selected.status,
      tarif: String(selected.tarif),
      catatan_barang: selected.catatan_barang,
    });

    setIsEditOpen(true);
  }}
>
  Edit Cargo
</button>

          </div>
        </aside>
      </section>
      {isAddOpen && (
  <div className={styles.modalOverlay}>
    <div className={styles.addModal}>
      <h2>Add Cargo</h2>

      <input
        placeholder="No Resi"
        value={addForm.no_resi}
        onChange={(e) =>
          setAddForm({
            ...addForm,
            no_resi: e.target.value,
          })
        }
      />

      <input
        type="date"
        value={addForm.tanggal_transaksi}
        onChange={(e) =>
          setAddForm({
            ...addForm,
            tanggal_transaksi: e.target.value,
          })
        }
      />

      <input
        placeholder="Nama Penerima"
        value={addForm.nama_penerima}
        onChange={(e) =>
          setAddForm({
            ...addForm,
            nama_penerima: e.target.value,
          })
        }
      />

      <input
        placeholder="No Telepon"
        value={addForm.no_telepon}
        onChange={(e) =>
          setAddForm({
            ...addForm,
            no_telepon: e.target.value,
          })
        }
      />

      <input
        placeholder="Kota Asal"
        value={addForm.kota_asal}
        onChange={(e) =>
          setAddForm({
            ...addForm,
            kota_asal: e.target.value,
          })
        }
      />

      <input
        placeholder="Kota Tujuan"
        value={addForm.kota_tujuan}
        onChange={(e) =>
          setAddForm({
            ...addForm,
            kota_tujuan: e.target.value,
          })
        }
      />

      <select
        value={addForm.jenis_pengiriman}
        onChange={(e) =>
          setAddForm({
            ...addForm,
            jenis_pengiriman: e.target.value,
          })
        }
      >
        <option>Biasa</option>
        <option>Cepat</option>
        <option>VVIP</option>
      </select>

      <select
        value={addForm.status}
        onChange={(e) =>
          setAddForm({
            ...addForm,
            status: e.target.value,
          })
        }
      >
        <option>Diproses</option>
        <option>Dikirim</option>
        <option>Selesai</option>
        <option>Pending</option>
      </select>

      <input
        type="number"
        placeholder="Tarif"
        value={addForm.tarif}
        onChange={(e) =>
          setAddForm({
            ...addForm,
            tarif: e.target.value,
          })
        }
      />

      <input
        placeholder="Catatan Barang"
        value={addForm.catatan_barang}
        onChange={(e) =>
          setAddForm({
            ...addForm,
            catatan_barang: e.target.value,
          })
        }
      />

      <div className={styles.modalButtons}>
        <button
          onClick={() => setIsAddOpen(false)}
        >
          CANCEL
        </button>

        <button
          onClick={async () => {
            await fetch('/api/pengiriman', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(addForm),
            });

            setIsAddOpen(false);

            setAddForm({
              no_resi: '',
              tanggal_transaksi: '',
              nama_penerima: '',
              no_telepon: '',
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
          }}
        >
          SAVE
        </button>
      </div>
    </div>
  </div>
)}

{isEditOpen && (
  <div className={styles.modalOverlay}>
    <div className={styles.addModal}>
      <h2>Edit Cargo</h2>

      <input
        value={editForm.no_resi}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            no_resi: e.target.value,
          })
        }
      />

      <input
        value={editForm.nama_penerima}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            nama_penerima: e.target.value,
          })
        }
      />

      <input
        value={editForm.no_telepon}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            no_telepon: e.target.value,
          })
        }
      />

      <input
        value={editForm.kota_asal}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            kota_asal: e.target.value,
          })
        }
      />

      <input
        value={editForm.kota_tujuan}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            kota_tujuan: e.target.value,
          })
        }
      />

      <select
        value={editForm.jenis_pengiriman}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            jenis_pengiriman: e.target.value,
          })
        }
      >
        <option>Biasa</option>
        <option>Cepat</option>
        <option>VVIP</option>
      </select>

      <select
        value={editForm.status}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            status: e.target.value,
          })
        }
      >
        <option>Diproses</option>
        <option>Dikirim</option>
        <option>Selesai</option>
        <option>Pending</option>
      </select>

      <input
        type="number"
        value={editForm.tarif}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            tarif: e.target.value,
          })
        }
      />

      <input
        value={editForm.catatan_barang}
        onChange={(e) =>
          setEditForm({
            ...editForm,
            catatan_barang: e.target.value,
          })
        }
      />

      <div className={styles.modalButtons}>
        <button onClick={() => setIsEditOpen(false)}>
          CANCEL
        </button>

        <button
          onClick={async () => {
            await fetch('/api/pengiriman', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(editForm),
            });

            setIsEditOpen(false);

            await getCargo();
          }}
        >
          SAVE
        </button>
      </div>
    </div>
  </div>
)}

    </main>
  );
}