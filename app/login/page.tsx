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
      router.push("/fleet");
    } else {
      alert("Username atau password salah!");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h2>Login</h2>

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

        <button onClick={handleLogin}>Login</button>

        <p>
          Belum punya akun? <Link href="/signup">Sign Up</Link>
        </p>
      </div>
    </main>
  );
}