"use client";

import styles from '@/app/ui/auth/auth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleLogin = () => {
    const savedUser = localStorage.getItem("user");
    const savedPass = localStorage.getItem("pass");

    if (!user || !pass) {
      alert("Isi semua field!");
      return;
    }

    if (user === savedUser && pass === savedPass) {
      router.push("/dashboard");
    } else {
      alert("Username atau password salah!");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h2>Login to Shipy</h2>

        <div className={styles.field}>
          <label>Masukkan Username Anda</label>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="username"
          />
        </div>

        <div className={styles.field}>
          <label>Masukkan Password Anda</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="password"
          />
        </div>

        <button onClick={handleLogin} className={styles.btn}>
          Login 
        </button>

        <p className={styles.switch}>
          Belum punya akun? <Link href="/signup">Sign Up</Link>
        </p>
      </div>

      {/* tombol kembali */}
      <Link href="/tentang" className={styles.back}>
        ← Kembali
      </Link>
    </main>
  );
}