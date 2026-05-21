"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { href: "/dashboard", label: "홈",    icon: "⊞" },
  { href: "/workout",   label: "운동",  icon: "◎" },
  { href: "/history",   label: "기록",  icon: "☰" },
  { href: "/profile",   label: "내정보", icon: "◉" },
]

export default function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav style={styles.nav}>
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href)
        return (
          <Link key={tab.href} href={tab.href} style={styles.tab}>
            <span style={{ ...styles.icon, color: isActive ? "#22c55e" : "#555" }}>
              {tab.icon}
            </span>
            <span style={{ ...styles.label, color: isActive ? "#22c55e" : "#555" }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    background: "#111", borderTop: "1px solid #222",
    display: "flex", height: 60,
    zIndex: 100,
  },
  tab: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 2, textDecoration: "none",
  },
  icon:  { fontSize: 20 },
  label: { fontSize: 10, fontWeight: 500 },
}