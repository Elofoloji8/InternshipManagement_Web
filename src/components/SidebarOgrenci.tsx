"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const menuItems = [
  { name: "İlanlar", href: "/ogrenci", icon: "🚀" },
  { name: "Başvurularım", href: "/ogrenci/basvurular", icon: "📄" },
  { name: "Kaydedilenler", href: "/ogrenci/kaydedilenler", icon: "🔖" },
  { name: "Profilim", href: "/ogrenci/profil", icon: "👤" },
  { name: "Ayarlar", href: "/ogrenci/ayarlar", icon: "⚙️" },
];

export default function SidebarOgrenci() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-6 flex flex-col shadow-sm">
      <div className="mb-10 px-2">
        <h2 className="text-2xl font-bold text-blue-700">İnteraktif Staj</h2>
        <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">Öğrenci Paneli</p>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/ogrenci" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              }`}>
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t">
        <button onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors duration-200">
          <span className="text-xl">🚪</span>
          <span className="font-semibold">Güvenli Çıkış</span>
        </button>
      </div>
    </aside>
  );
}
