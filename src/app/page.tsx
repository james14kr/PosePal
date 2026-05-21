"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnalysisResult } from "@/app/api/analyze/route";
import { SquatAngles } from "@/lib/angles";

const PoseCamera = dynamic(() => import("@/components/PoseCamera"), { ssr: false });

export default function Home() {
  const [isActive, setIsActive] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [angles, setAngles] = useState<SquatAngles | null>(null);

  const handleResult = useCallback((r: AnalysisResult, a: SquatAngles) => {
    setResult(r);
    setAngles(a);
  }, []);

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>FormCheck AI</h1>
          <p style={styles.subtitle}>카메라 앞에서 스쿼트를 시작하세요</p>
        </div>

        <div style={styles.cameraWrap}>
          {isActive ? (
            <PoseCamera onResult={handleResult} isActive={isActive} />
          ) : (
            <div style={styles.cameraPlaceholder}>
              <div style={styles.placeholderIcon}>📷</div>
              <p style={styles.placeholderText}>시작 버튼을 누르면 카메라가 활성화됩니다</p>
              <p style={styles.placeholderSub}>폰을 1.5m 거리, 전신이 보이도록 거치해주세요</p>
            </div>
          )}
        </div>

        <button
          style={{ ...styles.btn, background: isActive ? "#dc2626" : "#16a34a" }}
          onClick={() => { setIsActive((v) => !v); if (isActive) setResult(null); }}
        >
          {isActive ? "⏹ 분석 정지" : "▶ 분석 시작"}
        </button>

        {angles && isActive && (
          <div style={styles.anglesRow}>
            <AngleCard label="무릎 (좌)" value={angles.leftKnee} unit="°" ok={[80, 120]} />
            <AngleCard label="무릎 (우)" value={angles.rightKnee} unit="°" ok={[80, 120]} />
            <AngleCard label="상체 기울기" value={angles.trunkLean} unit="°" ok={[0, 25]} />
            <AngleCard label="고관절" value={angles.hipAvg} unit="°" ok={[45, 90]} />
          </div>
        )}

        {result && (
          <div style={styles.resultCard}>
            <div style={styles.scoreRow}>
              <div>
                <div style={styles.scoreNum}>{result.score}</div>
                <div style={styles.scoreLabel}>자세 점수</div>
              </div>
              <div style={styles.phase}>{result.phase}</div>
            </div>

            <div style={styles.cueBox}>
              <span style={styles.cueLabel}>지금 할 것</span>
              <p style={styles.cueText}>{result.nextCue}</p>
            </div>

            <div style={styles.issueList}>
              {result.issues.map((issue, i) => (
                <div key={i} style={styles.issueRow}>
                  <div style={{ ...styles.issueDot, background: dotColor(issue.severity) }} />
                  <div>
                    <span style={styles.issueJoint}>{issue.joint}</span>
                    <span style={styles.issueFeedback}>{issue.feedback}</span>
                  </div>
                </div>
              ))}
            </div>

            <p style={styles.encouragement}>{result.encouragement}</p>
          </div>
        )}
      </div>
    </main>
  );
}

function AngleCard({ label, value, unit, ok }: { label: string; value: number; unit: string; ok: [number, number] }) {
  const inRange = value >= ok[0] && value <= ok[1];
  return (
    <div style={{ ...styles.angleCard, borderColor: inRange ? "#16a34a" : "#dc2626" }}>
      <div style={{ ...styles.angleVal, color: inRange ? "#16a34a" : "#dc2626" }}>{value}{unit}</div>
      <div style={styles.angleLabel}>{label}</div>
    </div>
  );
}

function dotColor(s: "ok" | "warn" | "bad") {
  return s === "ok" ? "#16a34a" : s === "warn" ? "#d97706" : "#dc2626";
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: "100vh", background: "#0a0a0a", padding: "24px 16px" },
  container: { maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 },
  header: { textAlign: "center" },
  title: { fontSize: 26, fontWeight: 700, color: "#fff", margin: 0 },
  subtitle: { fontSize: 14, color: "#666", marginTop: 6 },
  cameraWrap: { width: "100%", borderRadius: 12, overflow: "hidden" },
  cameraPlaceholder: {
    background: "#111", borderRadius: 12, aspectRatio: "4/3",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
  },
  placeholderIcon: { fontSize: 40 },
  placeholderText: { color: "#aaa", fontSize: 14, margin: 0 },
  placeholderSub: { color: "#555", fontSize: 12, margin: 0, textAlign: "center", padding: "0 24px" },
  btn: {
    width: "100%", padding: "14px 0", borderRadius: 10, border: "none",
    color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer",
  },
  anglesRow: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 },
  angleCard: {
    background: "#111", borderRadius: 8, padding: "10px 8px", textAlign: "center",
    border: "1.5px solid", transition: "border-color 0.3s",
  },
  angleVal: { fontSize: 18, fontWeight: 700 },
  angleLabel: { fontSize: 10, color: "#666", marginTop: 2 },
  resultCard: { background: "#111", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 12 },
  scoreRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  scoreNum: { fontSize: 48, fontWeight: 700, color: "#fff", lineHeight: 1 },
  scoreLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  phase: { background: "#1f2937", color: "#9ca3af", fontSize: 13, padding: "6px 12px", borderRadius: 99 },
  cueBox: { background: "#1a2e1a", borderRadius: 8, padding: "10px 14px" },
  cueLabel: { fontSize: 11, color: "#4ade80", fontWeight: 600, letterSpacing: "0.05em" },
  cueText: { color: "#86efac", fontSize: 14, margin: "4px 0 0" },
  issueList: { display: "flex", flexDirection: "column", gap: 8 },
  issueRow: { display: "flex", alignItems: "flex-start", gap: 10 },
  issueDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5 },
  issueJoint: { fontSize: 12, color: "#9ca3af", marginRight: 6 },
  issueFeedback: { fontSize: 13, color: "#e5e7eb" },
  encouragement: { fontSize: 13, color: "#6b7280", textAlign: "center", margin: 0, fontStyle: "italic" },
};
