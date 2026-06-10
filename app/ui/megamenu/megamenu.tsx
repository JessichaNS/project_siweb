'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './megamenu.module.css';

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
    label: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    label: 'Fleet & Monitoring',
    href: '/admin/fleet',
    children: [
      { label: 'Fleet Overview', href: '/admin/fleet', desc: 'Daftar & status semua kapal', icon: '🚢' },
      { label: 'Peta Jalur', href: '/admin/map', desc: 'Posisi kapal secara visual', icon: '🗺️' },
      { label: 'Analitik', href: '/admin/analytic', desc: 'Statistik performa armada', icon: '📊' },
      { label: 'Log Update', href: '/admin/logs', desc: 'Riwayat perubahan status kapal', icon: '📋' },
    ],
  },
  {
    label: 'Cargo & Pengiriman',
    href: '/admin/cargo',
    children: [
      { label: 'Manajemen Cargo', href: '/admin/cargo', desc: 'Kelola semua pengiriman', icon: '📦' },
      { label: 'Analitik Revenue', href: '/admin/analytic', desc: 'Laporan pendapatan & cargo', icon: '💰' },
    ],
  },
  {
    label: 'Map',
    href: '/admin/map',
  },
  {
    label: 'Analytic',
    href: '/admin/analytic',
  },
  {
    label: 'Logs',
    href: '/admin/logs',
  },
];

type Props = {
  lastUpdated?: string;
  onLogout?: () => void;
};

export default function Megamenu({ lastUpdated, onLogout }: Props) {
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
                      key={child.href}
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
        {lastUpdated && (
          <span className={styles.liveBadge}>
            <span className={styles.liveDot}></span>
            LIVE · {lastUpdated}
          </span>
        )}
        {onLogout && (
          <div className={styles.userIcon} onClick={onLogout} title="Logout">
            <img src="/profile.png" alt="Admin" className={styles.userImage} />
          </div>
        )}
      </div>
    </header>
  );
}
