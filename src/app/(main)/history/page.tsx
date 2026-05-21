export default function HistoryPage() {
  return (
    <main style={{ padding: "24px 16px", maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>운동 기록</h1>
      <p style={{ fontSize: 14, color: "#666", marginTop: 6 }}>세션별 자세 점수 기록</p>

      <div style={{
        background: "#111", borderRadius: 10,
        padding: "48px 16px", textAlign: "center", marginTop: 24,
      }}>
        <p style={{ color: "#555", fontSize: 14, margin: 0 }}>아직 운동 기록이 없습니다</p>
        <p style={{ color: "#333", fontSize: 12, marginTop: 6 }}>운동을 완료하면 여기에 기록됩니다</p>
      </div>
    </main>
  )
}