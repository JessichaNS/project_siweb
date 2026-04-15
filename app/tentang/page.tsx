import styles from '../ui/tentang/tentang.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function TentangPage() {
  return (
    <main className={styles.container}>
      <Image
        src="/bg-pc.jpg"
        alt="bg"
        fill
        priority
        className={styles.bg}
      />

      <div className={styles.overlay}></div>

      <div className={styles.content}>
        <h1 className={styles.title}>Tentang Kami</h1>

        <p className={styles.desc}>
          Shipy adalah perusahaan teknologi maritim yang berfokus pada penyederhanaan manajemen armada kompleks. Kami percaya bahwa transparansi adalah kunci keberhasilan operasional. Melalui sensor mutakhir dan dasbor yang intuitif, Shipy membantu para pemilik kapal mengubah data mentah menjadi keputusan strategis yang menguntungkan, mulai dari efisiensi bahan bakar hingga kepatuhan regulasi internasional.
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <span className={styles.badge}>VISI</span>
            <p>Menjadi ekosistem digital utama bagi industri maritim global yang menghubungkan kapal, darat, dan data secara nirkabel.</p>
          </div>

          <div className={styles.card}>
            <span className={styles.badge}>MISI</span>
            <ul>
              <li>Menyederhanakan pengelolaan armada laut melalui teknologi cloud-native.</li>
              <li>Memastikan keselamatan kru dan keamanan kargo dengan sistem deteksi risiko dini.</li>
              <li>Memberikan akses teknologi maritim kelas dunia bagi semua skala operasional perusahaan pelayaran.</li>
            </ul>
          </div>

          <div className={styles.card}>
            <span className={styles.badge}>Nilai</span>
            <ul>
              <li>Kecepatan (Speed): Akses data real-time tanpa penundaan untuk respon cepat di tengah laut.</li>
              <li>Presisi (Precision): Akurasi titik koordinat dan metrik mesin kapal yang dapat diandalkan 100%.</li>
              <li>Keberlanjutan (Sustainability): Membantu industri maritim mengurangi jejak karbon melalui rute perjalanan yang dioptimalkan secara cerdas.</li>
            </ul>
          </div>

          <div className={styles.card}>
            <span className={styles.badge}>Statistik</span>
            <ul>
              <li>5+ Tahun Pengalaman di Industri Kelautan.</li>
              <li>150+ Armada Terkoneksi secara Global.</li>
              <li>15% Penghematan Biaya Operasional Rata-rata per Tahun.</li>
              <li>Dukungan Satelit dengan cakupan wilayah laut terdalam.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* BUTTON KIRI BAWAH */}
      <Link href="/" className={styles.back}>
        ← Kembali
      </Link>

      {/* BUTTON KANAN BAWAH */}
      <button className={styles.signup}>
        Sign Up →
      </button>
    </main>
  );
}