"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [nickname, setNickname] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? "")
        setNickname(user.user_metadata?.nickname ?? "")
      }
    })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>내 정보</h1>

      <div style={styles.profileCard}>
        <div style={styles.avatar}>{nickname?.[0]?.toUpperCase() ?? "?"}</div>
        <div style={styles.profileInfo}>
          <div style={styles.profileName}>{nickname || "-"}</div>
          <div style={styles.profileEmail}>{email}</div>
        </div>
      </div>

      <div style={styles.menuList}>
        <div style={styles.menuItem}>
          <span style={styles.menuLabel}>닉네임</span>
          <span style={styles.menuValue}>{nickname || "-"}</span>
        </div>
        <div style={styles.menuItem}>
          <span style={styles.menuLabel}>이메일</span>
          <span style={styles.menuValue}>{email || "-"}</span>
        </div>
        <div style={styles.menuItem}>
          <span style={styles.menuLabel}>총 운동 횟수</span>
          <span style={styles.menuValue}>0회</span>
        </div>
      </div>

      <button onClick={handleLogout} style={styles.logoutBtn}>
        로그아웃
      </button>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "24px 16px", maxWidth: 480, margin: "0 auto" },
  title: { fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 20px" },
  profileCard: {
    background: "#111", borderRadius: 12,
    padding: 16, display: "flex", alignItems: "center",
    gap: 14, marginBottom: 16,
  },
  avatar: {
    width: 52, height: 52, borderRadius: "50%",
    background: "#16a34a", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, fontWeight: 700, flexShrink: 0,
  },
  profileInfo: {},
  profileName: { fontSize: 16, fontWeight: 600, color: "#fff" },
  profileEmail: { fontSize: 12, color: "#666", marginTop: 2 },
  menuList: {
    background: "#111", borderRadius: 12,
    overflow: "hidden", marginBottom: 16,
  },
  menuItem: {
    display: "flex", justifyContent: "space-between",
    padding: "14px 16px", borderBottom: "1px solid #1a1a1a",
  },
  menuLabel: { fontSize: 14, color: "#aaa" },
  menuValue: { fontSize: 14, color: "#fff" },
  logoutBtn: {
    width: "100%", padding: "13px 0",
    background: "transparent", border: "1px solid #ef4444",
    color: "#ef4444", borderRadius: 10,
    fontSize: 15, fontWeight: 600, cursor: "pointer",
  },
}