import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { SquatAngles } from "@/lib/angles";

const client = new Anthropic();

export interface AnalysisResult {
  score: number;
  phase: string;
  issues: {
    joint: string;
    severity: "ok" | "warn" | "bad";
    feedback: string;
  }[];
  nextCue: string;
  encouragement: string;
}

const SYSTEM_PROMPT = `당신은 전문 퍼스널 트레이너 AI입니다. 사용자의 스쿼트 자세를 분석하고 한국어로 피드백을 제공합니다.

규칙:
- 피드백은 구체적이고 실행 가능하게 (예: "무릎을 구부리세요" X → "오른쪽 무릎을 왼쪽과 같은 방향으로 향하게 해보세요" O)
- nextCue는 지금 즉시 할 수 있는 것 하나만
- score는 전체적인 자세 완성도 (정상 스쿼트 기준 80점 이상)
- 반드시 JSON 형식으로만 응답

JSON 스키마:
{
  "score": number,
  "phase": "하강 중" | "최저점" | "상승 중",
  "issues": [{ "joint": string, "severity": "ok"|"warn"|"bad", "feedback": string }],
  "nextCue": string,
  "encouragement": string
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, angles }: { imageBase64: string; angles: SquatAngles } = body;

    if (!imageBase64 || !angles) {
      return NextResponse.json({ error: "이미지와 각도 데이터가 필요합니다" }, { status: 400 });
    }

    const userPrompt = `스쿼트 자세 분석을 요청합니다.

측정된 각도 데이터:
- 무릎 각도 (좌/우): ${angles.leftKnee}° / ${angles.rightKnee}° (평균 ${angles.kneeAvg}°)
- 고관절 각도 (좌/우): ${angles.leftHip}° / ${angles.rightHip}° (평균 ${angles.hipAvg}°)
- 상체 기울기: ${angles.trunkLean}° (수직 기준)

정상 스쿼트 기준값:
- 무릎 각도: 80~120° (최저점 기준)
- 고관절 각도: 45~90°
- 상체 기울기: 0~25°

첨부 이미지와 측정값을 모두 참고해서 JSON으로 분석해주세요.`;

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64,
              },
            },
            { type: "text", text: userPrompt },
          ],
        },
      ],
    });

    const raw = response.content[0].type === "text" ? response.content[0].text : "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const result: AnalysisResult = JSON.parse(clean);

    return NextResponse.json(result);
  } catch (err) {
    console.error("분석 오류:", err);
    return NextResponse.json({ error: "분석 중 오류가 발생했습니다" }, { status: 500 });
  }
}
