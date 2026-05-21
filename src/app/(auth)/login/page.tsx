"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>FormCheck AI</h1>
      <p style={styles.subtitle}>로그인</p>

      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p style={styles.footer}>
        계정이 없으신가요?{" "}
        <Link href="/signup" style={styles.link}>회원가입</Link>
      </p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "100%", maxWidth: 400,
    background: "#111", borderRadius: 16,
    padding: "36px 28px", display: "flex",
    flexDirection: "column", gap: 20,
  },
  title: { fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, textAlign: "center" },
  subtitle: { fontSize: 14, color: "#666", margin: 0, textAlign: "center" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: {
    background: "#1a1a1a", border: "1px solid #333",
    borderRadius: 8, padding: "12px 14px",
    color: "#fff", fontSize: 14, outline: "none",
  },
  error: { fontSize: 13, color: "#ef4444", margin: 0 },
  btn: {
    background: "#16a34a", color: "#fff",
    border: "none", borderRadius: 8,
    padding: "13px 0", fontSize: 15,
    fontWeight: 600, cursor: "pointer",
    marginTop: 4,
  },
  footer: { fontSize: 13, color: "#555", textAlign: "center", margin: 0 },
  link: { color: "#22c55e", textDecoration: "none" },
}