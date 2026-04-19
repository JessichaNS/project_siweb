"use client";

import styles from '@/app/ui/auth/auth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleSignup = () => {
    if (!user || !pass) {
      alert("Isi semua field!");
      return;
    }

    localStorage.setItem("user", user);
    localStorage.setItem("pass", pass);

    alert("Berhasil daftar!");
    router.push("/login");
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h2>Sign Up</h2>

        <input
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Username"
        />

        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Password"
        />

        <button onClick={handleSignup}>Sign Up</button>

        <p>
          Sudah punya akun? <Link href="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}