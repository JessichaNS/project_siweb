'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './megamenu-user.module.css';


type MegaItem = {
  label: string;
  href: string;
  desc: string;
  icon: string;
};

type NavItem = {
  label: string;
  href: string;
  children?: MegaItem[];
};

const navItems: NavItem[] = [
  {
    label: 'Beranda',
    href: '/user/dashboard',
  },
  {
    label: 'Armada Kapal',
    href: '/user/fleet',
    children: [
      { label: 'Status Armada', href: '/user/fleet', desc: 'Lihat posisi & status kapal aktif', icon: '🚢' },
      { label: 'Peta Jalur', href: '/user/map', desc: 'Visualisasi rute pengiriman di peta', icon: '🗺️' },
    ],
  },
  {
    label: 'Pengirimanku',
    href: '/user/cargo',
    children: [
      { label: 'Lacak Paket', href: '/user/cargo', desc: 'Cek status & posisi kiriman kamu', icon: '🔍' },
      { label: 'Riwayat', href: '/user/cargo', desc: 'Semua transaksi pengirimanmu', icon: '🧾' },
      { label: 'Buat Pengiriman', href: '/user/cargo', desc: 'Daftarkan pengiriman baru', icon: '✉️' },
    ],
  },
];

type Props = {
  userName?: string;
  onLogout?: () => void;
};

export default function MegamenuUser({ userName, onLogout }: Props) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <header className={styles.topbar}>
      <div className={styles.logoBox}>
        <img src="/shipylogo.jpeg" alt="Shipy Logo" className={styles.logoImage} />
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <div
            key={item.label}
            className={styles.navGroup}
            onMouseEnter={() => item.children && setOpenMenu(item.label)}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <Link
              href={item.href}
              className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
            >
              {item.label}
              {item.children && <span className={styles.chevron}>▾</span>}
            </Link>

            {item.children && openMenu === item.label && (
              <div className={styles.megadrop}>
                <div className={styles.megaGrid}>
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className={styles.megaItem}
                      onClick={() => setOpenMenu(null)}
                    >
                      <span className={styles.megaIcon}>{child.icon}</span>
                      <div>
                        <p className={styles.megaLabel}>{child.label}</p>
                        <p className={styles.megaDesc}>{child.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className={styles.rightSection}>
        {userName && (
          <div className={styles.userInfo}>
            <span className={styles.userName}>{userName}</span>
            <span className={styles.userRole}>User</span>
          </div>
        )}
        {onLogout && (
          <div className={styles.userIcon} onClick={onLogout} title="Logout">
            <img src="/profile.png" alt="User" className={styles.userImage} />
          </div>
        )}
      </div>
    </header>
  );
}
