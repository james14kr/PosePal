"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"        // ← 이 줄 추가
import dynamic from "next/dynamic"
import { AnalysisResult } from "@/app/api/analyze/route"
import { SquatAngles } from "@/lib/angles"

const PoseCamera = dynamic(() => import("@/components/PoseCamera"), { ssr: false })

export default function WorkoutAnalysisPage() {    // ← 함수명 변경
  const router = useRouter()                       // ← 이 줄 추가
  const [isActive, setIsActive] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [angles, setAngles] = useState<SquatAngles | null>(null)

  const handleResult = useCallback((r: AnalysisResult, a: SquatAngles) => {
    setResult(r)
    setAngles(a)
  }, [])

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => router.back()} style={styles.backBtn}>← 뒤로</button>  {/* ← 추가 */}
          <h1 style={styles.title}>FormCheck AI</h1>
          <p style={styles.subtitle}>카메라 앞에서 스쿼트를 시작하세요</p>
        </div>

        {/* 나머지 JSX는 기존 page.tsx와 동일 */}
        ...
      </div>
    </main>
  )
}

// styles 는 기존 page.tsx에서 아래 항목 추가
const styles: Record<string, React.CSSProperties> = {
  // 기존 스타일 전부 복사 +
  backBtn: {
    background: "transparent", border: "none",
    color: "#666", fontSize: 14, cursor: "pointer",
    padding: 0, marginBottom: 8,
  },
  // ... 나머지 기존 styles
}