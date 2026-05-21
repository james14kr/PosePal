"use client"

import { useRouter } from "next/navigation"

const workouts = [
  {
    type: "squat",
    name: "스쿼트",
    icon: "🏋️",
    desc: "하체 근력 강화의 기본",
    points: ["무릎 각도", "상체 기울기", "좌우 균형"],
  },
  {
    type: "pushup",
    name: "푸시업",
    icon: "💪",
    desc: "상체 전반 근력 운동",
    points: ["팔꿈치 각도", "등 직선도", "어깨 위치"],
    disabled: true,
  },
]

export default function WorkoutPage() {
  const router = useRouter()

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>운동 선택</h1>
      <p style={styles.subtitle}>분석할 운동을 선택하세요</p>

      <div style={styles.list}>
        {workouts.map((w) => (
          <button
            key={w.type}
            style={{ ...styles.card, opacity: w.disabled ? 0.4 : 1 }}
            onClick={() => !w.disabled && router.push(`/workout/${w.type}`)}
            disabled={w.disabled}
          >
            <div style={styles.cardTop}>
              <span style={styles.cardIcon}>{w.icon}</span>
              <div style={styles.cardInfo}>
                <div style={styles.cardName}>
                  {w.name}
                  {w.disabled && <span style={styles.soon}>준비 중</span>}
                </div>
                <div style={styles.cardDesc}>{w.desc}</div>
              </div>
              <span style={styles.arrow}>›</span>
            </div>
            <div style={styles.points}>
              {w.points.map((p) => (
                <span key={p} style={styles.point}>{p}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: "24px 16px", maxWidth: 480, margin: "0 auto" },
  title: { fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 6, marginBottom: 24 },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: {
    background: "#111", border: "1px solid #222",
    borderRadius: 12, padding: "16px",
    cursor: "pointer", textAlign: "left", width: "100%",
  },
  cardTop: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  cardIcon: { fontSize: 32 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: 8 },
  cardDesc: { fontSize: 13, color: "#666", marginTop: 2 },
  soon: {
    fontSize: 10, background: "#1f2937",
    color: "#6b7280", padding: "2px 6px", borderRadius: 99,
  },
  arrow: { fontSize: 20, color: "#444" },
  points: { display: "flex", gap: 6, flexWrap: "wrap" },
  point: {
    fontSize: 11, background: "#1a2e1a",
    color: "#4ade80", padding: "3px 8px", borderRadius: 99,
  },
}