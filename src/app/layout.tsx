import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FormCheck AI — 스쿼트 자세 분석",
  description: "AI가 실시간으로 운동 자세를 분석하고 교정해드립니다",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
