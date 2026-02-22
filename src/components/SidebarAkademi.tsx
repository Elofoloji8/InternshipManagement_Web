"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function SidebarAkademi() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Genel Bakış", href: "/akademi", icon: "🎓" },
    { name: "Onay Bekleyenler", href: "/akademi/onaylar", icon: "📋" },
    { name: "Aktif Stajyerler", href: "/akademi/stajyerler", icon: "👥" },
    { name: "Ayarlar", href: "/akademi/ayarlar", icon: "⚙️" },
  ];

  return (
    <aside className="w-72 bg-[#1C3FAA] min-h-screen p-6 text-white flex flex-col shadow-2xl">
      <div className="mb-12 px-4">
        <h2 className="text-2xl font-black italic tracking-tighter uppercase">
          Akademi
        </h2>
        <div className="h-1 w-12 bg-blue-400 mt-1"></div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? "bg-white text-[#1C3FAA] shadow-lg font-bold scale-105"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut(auth)}
        className="mt-auto flex items-center space-x-4 px-4 py-4 rounded-2xl text-red-300 hover:bg-red-500/10 hover:text-red-100 transition-all font-bold"
      >
        <span>🚪</span>
        <span>Çıkış Yap</span>
      </button>
    </aside>
  );
}
