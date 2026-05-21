"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision";
import { extractSquatAngles, quickSquatCheck, SquatAngles } from "@/lib/angles";
import { AnalysisResult } from "@/app/api/analyze/route";

interface PoseCameraProps {
  onResult: (result: AnalysisResult, angles: SquatAngles) => void;
  isActive: boolean;
}

function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number; z: number; visibility?: number }[],
  w: number,
  h: number,
  severity: "ok" | "warn" | "bad"
) {
  const color = severity === "ok" ? "#22c55e" : severity === "warn" ? "#f59e0b" : "#ef4444";

  const connections = [
    [11, 12], [11, 23], [12, 24], [23, 24],
    [23, 25], [24, 26], [25, 27], [26, 28],
    [27, 31], [28, 32],
  ];

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  for (const [a, b] of connections) {
    const pa = landmarks[a];
    const pb = landmarks[b];
    if (!pa || !pb) continue;
    if ((pa.visibility ?? 1) < 0.3 || (pb.visibility ?? 1) < 0.3) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x * w, pa.y * h);
    ctx.lineTo(pb.x * w, pb.y * h);
    ctx.stroke();
  }

  ctx.fillStyle = color;
  for (const lm of landmarks) {
    if ((lm.visibility ?? 1) < 0.3) continue;
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function PoseCamera({ onResult, isActive }: PoseCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const animFrameRef = useRef<number>(0);
  const lastCallRef = useRef<number>(0);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [currentSeverity, setCurrentSeverity] = useState<"ok" | "warn" | "bad">("ok");

  useEffect(() => {
    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
        );
        landmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        setStatus("ready");
      } catch (e) {
        console.error("MediaPipe 초기화 실패:", e);
        setStatus("error");
      }
    }
    init();
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, []);

  useEffect(() => {
    if (status !== "ready" || !isActive) return;
    let stream: MediaStream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (e) {
        console.error("카메라 접근 실패:", e);
        setStatus("error");
      }
    }
    startCamera();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [status, isActive]);

  const analyze = useCallback(
    async (timestamp: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (!video || !canvas || !landmarker || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(analyze);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      const result = landmarker.detectForVideo(video, timestamp);
      const landmarks = result.landmarks[0];

      if (landmarks && landmarks.length > 0) {
        const angles = extractSquatAngles(landmarks);
        const check = quickSquatCheck(angles);
        setCurrentSeverity(check.severity);

        drawSkeleton(ctx, landmarks, canvas.width, canvas.height, check.severity);

        const now = Date.now();
        const shouldCall = check.shouldCallClaude || now - lastCallRef.current > 2000;

        if (shouldCall && isActive) {
          lastCallRef.current = now;

          const offscreen = document.createElement("canvas");
          offscreen.width = 512;
          offscreen.height = Math.round((canvas.height / canvas.width) * 512);
          const offCtx = offscreen.getContext("2d");
          offCtx?.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);
          const base64 = offscreen.toDataURL("image/jpeg", 0.8).split(",")[1];

          fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64, angles }),
          })
            .then((r) => r.json())
            .then((analysisResult: AnalysisResult) => onResult(analysisResult, angles))
            .catch(console.error);
        }
      }

      animFrameRef.current = requestAnimationFrame(analyze);
    },
    [isActive, onResult]
  );

  const handleVideoPlay = useCallback(() => {
    animFrameRef.current = requestAnimationFrame(analyze);
  }, [analyze]);

  if (status === "loading") {
    return (
      <div style={styles.placeholder}>
        <p style={styles.statusText}>AI 모델 로딩 중...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={styles.placeholder}>
        <p style={styles.statusText}>카메라 접근 실패. 브라우저 권한을 확인해주세요.</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <video ref={videoRef} onPlay={handleVideoPlay} style={styles.video} playsInline muted />
      <canvas ref={canvasRef} style={styles.canvas} />
      <div style={{ ...styles.badge, background: severityColor(currentSeverity) }}>
        {currentSeverity === "ok" ? "● 분석 중" : currentSeverity === "warn" ? "⚠ 자세 확인" : "✕ 자세 교정 필요"}
      </div>
    </div>
  );
}

function severityColor(s: "ok" | "warn" | "bad") {
  return s === "ok" ? "#16a34a" : s === "warn" ? "#d97706" : "#dc2626";
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { position: "relative", width: "100%", borderRadius: 12, overflow: "hidden", background: "#000" },
  video: { position: "absolute", opacity: 0, pointerEvents: "none" },
  canvas: { width: "100%", display: "block", transform: "scaleX(-1)" },
  placeholder: {
    width: "100%", aspectRatio: "4/3", background: "#111", borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  statusText: { color: "#888", fontSize: 14 },
  badge: {
    position: "absolute", top: 12, right: 12,
    color: "#fff", fontSize: 12, fontWeight: 500,
    padding: "4px 10px", borderRadius: 99,
  },
};
