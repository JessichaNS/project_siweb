"use client";
import styles from '@/ui/auth/auth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const [user, setUser] = useState<string>("");
  const [pass, setPass] = useState<string>("");

  const handleLogin = (): void => {
    const savedUser = localStorage.getItem("user");
    const savedPass = localStorage.getItem("pass");

    if (!user || !pass) {
      alert("Tidak dapat login! Harap isi semua field.");
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
        <h2>Login to Shipy</h2>
        <p>Enter your credentials to access the bridge.</p>

        <input
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="commander@maritime.intel"
        />

        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="********"
        />

        <button onClick={handleLogin}>Login →</button>

        <p>
          don't have account?{" "}
          <Link href="/signup">Sign Up</Link>
        </p>
      </div>
    </main>
  );
}