"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function SidebarSirket() {
  const pathname = usePathname();
  const menu = [
    { name: "Panel", href: "/sirket", icon: "🏢" },
    { name: "İlanlarım", href: "/sirket/ilanlar", icon: "💼" },
    { name: "Yeni İlan", href: "/sirket/ilan-ekle", icon: "➕" },
    { name: "Başvurular", href: "/sirket/basvurular", icon: "📥" },
    { name: "Profil", href: "/sirket/profil", icon: "👤" },
  ];

  return (
    <aside className="w-64 bg-[#1C3FAA] min-h-screen p-6 text-white flex flex-col">
      <h2 className="text-2xl font-black italic mb-10 px-2 uppercase">
        Şirket Paneli
      </h2>
      <nav className="flex-1 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 p-3.5 rounded-2xl transition ${pathname === item.href ? "bg-white text-blue-900 shadow-lg font-bold" : "hover:bg-blue-800"}`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
      <button
        onClick={() => auth.signOut()}
        className="mt-auto p-3 text-red-300 font-bold hover:text-white flex items-center space-x-2"
      >
        <span>🚪</span>
        <span>Çıkış Yap</span>
      </button>
    </aside>
  );
}
