import styles from '@/ui/fleet/fleet.module.css';

export default function FleetPage() {
  return (
    <main className={styles.container}>
      <div className={styles.navbar}>
        <div className={styles.logo}>🚢 Shipy</div>

        <div className={styles.menu}>
          <span className={styles.active}>Fleet</span>
          <span>Map</span>
          <span>Analytic</span>
        </div>
      </div>

      <h2 className={styles.title}>ACTIVE FLEET</h2>

      <div className={styles.grid}>
        <div className={styles.cardActive}>
          MV Pasific Star
        </div>

        <div className={styles.card}>
          SS Atlantic Wave
        </div>

        <div className={styles.card}>
          MV Cargo Express
        </div>
      </div>
    </main>
  );
}