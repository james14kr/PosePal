// MediaPipe landmark 인덱스
export const LM = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

interface Point {
  x: number;
  y: number;
  z?: number;
}

// 세 점으로 각도 계산 (degrees)
export function calcAngle(a: Point, b: Point, c: Point): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
  if (magAB === 0 || magCB === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return Math.round((Math.acos(cosAngle) * 180) / Math.PI);
}

// 두 점 사이 수직 기울기 (허리 직립도 측정용)
export function calcVerticalAngle(top: Point, bottom: Point): number {
  const dy = bottom.y - top.y;
  const dx = bottom.x - top.x;
  return Math.round(Math.abs((Math.atan2(dx, dy) * 180) / Math.PI));
}

export interface SquatAngles {
  leftKnee: number;
  rightKnee: number;
  leftHip: number;
  rightHip: number;
  trunkLean: number;
  kneeAvg: number;
  hipAvg: number;
}

export function extractSquatAngles(landmarks: Point[]): SquatAngles {
  const ls = landmarks[LM.LEFT_SHOULDER];
  const rs = landmarks[LM.RIGHT_SHOULDER];
  const lh = landmarks[LM.LEFT_HIP];
  const rh = landmarks[LM.RIGHT_HIP];
  const lk = landmarks[LM.LEFT_KNEE];
  const rk = landmarks[LM.RIGHT_KNEE];
  const la = landmarks[LM.LEFT_ANKLE];
  const ra = landmarks[LM.RIGHT_ANKLE];

  const shoulderMid = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
  const hipMid = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };

  const leftKnee = calcAngle(lh, lk, la);
  const rightKnee = calcAngle(rh, rk, ra);
  const leftHip = calcAngle(ls, lh, lk);
  const rightHip = calcAngle(rs, rh, rk);
  const trunkLean = calcVerticalAngle(shoulderMid, hipMid);

  return {
    leftKnee,
    rightKnee,
    leftHip,
    rightHip,
    trunkLean,
    kneeAvg: Math.round((leftKnee + rightKnee) / 2),
    hipAvg: Math.round((leftHip + rightHip) / 2),
  };
}

export interface QuickCheck {
  shouldCallClaude: boolean;
  reason: string;
  severity: "ok" | "warn" | "bad";
}

export function quickSquatCheck(angles: SquatAngles): QuickCheck {
  if (angles.kneeAvg > 160) {
    return { shouldCallClaude: false, reason: "서 있는 상태", severity: "ok" };
  }
  if (angles.kneeAvg < 60) {
    return { shouldCallClaude: true, reason: "무릎 과굴곡 감지", severity: "bad" };
  }
  if (angles.trunkLean > 30) {
    return { shouldCallClaude: true, reason: "상체 과도한 전방 기울기", severity: "warn" };
  }
  if (Math.abs(angles.leftKnee - angles.rightKnee) > 10) {
    return { shouldCallClaude: true, reason: "좌우 무릎 각도 불균형", severity: "warn" };
  }
  return { shouldCallClaude: false, reason: "정상 범위", severity: "ok" };
}
