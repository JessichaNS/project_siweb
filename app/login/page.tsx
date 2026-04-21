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
    if (!user || !pass) {
      alert("Isi semua field!");
      return;
    }

    if (user === "admin123" && pass === "admin321") {
      localStorage.setItem("role", "admin");
      localStorage.setItem("user", user);
      router.push("/dashboard");
      return;
    }

    if (user === "user123" && pass === "user321") {
      localStorage.setItem("role", "user");
      localStorage.setItem("user", user);
      router.push("/dashboard");
      return;
    }

    alert("Username atau password salah!");
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
            placeholder="admin123 / user123"
          />
        </div>

        <div className={styles.field}>
          <label>Masukkan Password Anda</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="admin321 / user321"
          />
        </div>

        <button onClick={handleLogin} className={styles.btn}>
          Login
        </button>

        <p className={styles.switch}>
          Belum punya akun? <Link href="/signup">Sign Up</Link>
        </p>
      </div>

      <Link href="/tentang" className={styles.back}>
        ← Kembali
      </Link>
    </main>
  );
}