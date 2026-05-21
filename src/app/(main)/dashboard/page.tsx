"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const router = useRouter()
  const [nickname, setNickname] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setNickname(user.user_metadata?.nickname ?? "")
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
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>안녕하세요 👋</p>
          <h1 style={styles.name}>{nickname || "회원"}님</h1>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>로그아웃</button>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.statNum}>0</div>
          <div style={styles.statLabel}>총 세션</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNum}>-</div>
          <div style={styles.statLabel}>평균 점수</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNum}>0</div>
          <div style={styles.statLabel}>이번 주</div>
        </div>
      </div>

      <button
        style={styles.startBtn}
        onClick={() => router.push("/workout")}
      >
        운동 시작하기
      </button>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>최근 기록</h2>
        <div style={styles.empty}>
          <p style={styles.emptyText}>아직 운동 기록이 없습니다</p>
          <p style={styles.emptySubText}>첫 번째 운동을 시작해보세요!</p>
        </div>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "24px 16px", maxWidth: 480, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  greeting: { fontSize: 13, color: "#666", margin: 0 },
  name: { fontSize: 22, fontWeight: 700, color: "#fff", margin: "4px 0 0" },
  logoutBtn: {
    background: "transparent", border: "1px solid #333",
    color: "#666", borderRadius: 8, padding: "6px 12px",
    fontSize: 12, cursor: "pointer",
  },
  statsRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 },
  statCard: {
    background: "#111", borderRadius: 10,
    padding: "14px 8px", textAlign: "center",
  },
  statNum: { fontSize: 22, fontWeight: 700, color: "#fff" },
  statLabel: { fontSize: 11, color: "#555", marginTop: 4 },
  startBtn: {
    width: "100%", padding: "14px 0",
    background: "#16a34a", color: "#fff",
    border: "none", borderRadius: 10,
    fontSize: 16, fontWeight: 600, cursor: "pointer",
    marginBottom: 28,
  },
  section: {},
  sectionTitle: { fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 12 },
  empty: {
    background: "#111", borderRadius: 10,
    padding: "32px 16px", textAlign: "center",
  },
  emptyText: { color: "#555", fontSize: 14, margin: 0 },
  emptySubText: { color: "#333", fontSize: 12, marginTop: 6 },
}