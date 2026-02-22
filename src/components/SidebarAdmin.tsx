"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function SidebarAdmin() {
  const pathname = usePathname();
  const menu = [
    { name: "Yönetim Paneli", href: "/admin", icon: "🛡️" },
    { name: "Tüm Kullanıcılar", href: "/admin/kullanicilar", icon: "👥" },
    { name: "Şirket Yönetimi", href: "/admin/sirketler", icon: "🏢" },
    { name: "Ayarlar", href: "/admin/ayarlar", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 bg-[#1C3FAA] min-h-screen p-6 text-white flex flex-col shadow-xl">
      <div className="mb-10 px-2">
        <h2 className="text-xl font-bold italic border-b border-blue-400 pb-2">
          ADMIN PANEL
        </h2>
      </div>
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
