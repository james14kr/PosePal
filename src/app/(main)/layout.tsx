import BottomTabBar from "@/components/BottomTabBar"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", paddingBottom: 60 }}>
      {children}
      <BottomTabBar />
    </div>
  )
}