"use client";

import styles from '@/app/ui/auth/auth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();

  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleSignup = () => {
    if (!user || !email || !pass) {
      alert("Isi semua field!");
      return;
    }

    localStorage.setItem("user", user);
    localStorage.setItem("email", email);
    localStorage.setItem("pass", pass);

    alert("Berhasil daftar!");
    router.push("/login");
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h2>Sign Up Shipy</h2>

        <div className={styles.field}>
          <label>Username</label>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Username"
          />
        </div>

        <div className={styles.field}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
        </div>

        <div className={styles.field}>
          <label>Password</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Password"
          />
        </div>

        <button onClick={handleSignup} className={styles.btn}>
          Sign Up
        </button>

        <p className={styles.switch}>
          Sudah punya akun? <Link href="/login">Login</Link>
        </p>
      </div>

      <Link href="/tentang" className={styles.back}>
        Kembali
      </Link>
    </main>
  );
}