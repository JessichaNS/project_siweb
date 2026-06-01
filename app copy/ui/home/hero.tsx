import Image from 'next/image';
import styles from './hero.module.css';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <Image
        src="/bg-pc.jpg"
        alt="bg"
        fill
        priority
        className={styles.bg}
      />

      <div className={styles.overlay}></div>

      <div className={styles.content}>
        <h1 className={styles.title}>
          Navigate Your <br /> Maritime Future
        </h1>

        <p className={styles.subtitle}>
          One Platform, Global Visibility.
        </p>

        <Link href="/tentang" className={styles.btn}>
          Tentang Kami →
        </Link>
      </div>
    </section>
  );
}