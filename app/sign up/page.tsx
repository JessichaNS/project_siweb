"use client";
import styles from '@/ui/auth/auth.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();

  const [user, setUser] = useState<string>("");
  const [pass, setPass] = useState<string>("");

  const handleSignup = (): void => {
    if (!user || !pass) {
      alert("Tidak dapat sign up! Username dan password wajib diisi.");
      return;
    }

    localStorage.setItem("user", user);
    localStorage.setItem("pass", pass);

    router.push("/fleet");
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h2>Sign Up Account</h2>
        <p>sign up</p>

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

        <button onClick={handleSignup}>Sign Up →</button>

        <p>
          Already have an account?{" "}
          <Link href="/login">Login</Link>
        </p>
      </div>
    </main>
  );
}