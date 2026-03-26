"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const SETTINGS_ITEMS = [
  { href: "/ogrenci/profil", icon: "👤", label: "Profil Bilgileri", desc: "Ad, bölüm, GANO ve kişisel bilgiler" },
  { href: "/ogrenci/hesap-guvenligi", icon: "🔒", label: "Hesap Güvenliği", desc: "Şifre değiştirme ve güvenlik ayarları" },
  { href: "/ogrenci/ayarlar/bildirimler", icon: "🔔", label: "Bildirimler", desc: "Bildirim tercihlerinizi yönetin" },
  { href: "/ogrenci/ayarlar/gizlilik", icon: "🛡️", label: "Gizlilik", desc: "Hesap gizlilik ayarları" },
  { href: "/ogrenci/ayarlar/uygulama", icon: "⚙️", label: "Uygulama Ayarları", desc: "Dil, tema ve görünüm tercihleri" },
  { href: "/ogrenci/ayarlar/destek", icon: "💬", label: "Destek", desc: "Yardım ve geri bildirim" },
  { href: "/ogrenci/ayarlar/hakkinda", icon: "ℹ️", label: "Hakkında", desc: "Uygulama bilgileri ve sürüm" },
];

export default function OgrenciAyarlarPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    if (!confirm("Çıkış yapmak istediğinize emin misiniz?")) return;
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="text-black">
      <div className="mb-8">
        <p className="text-gray-400 text-sm font-medium">Öğrenci Paneli</p>
        <h1 className="text-3xl font-black text-[#1C3FAA]">Ayarlar</h1>
      </div>

      {/* Profil özet kartı */}
      <div className="bg-[#2F6FED] rounded-3xl p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
          🎓
        </div>
        <div>
          <p className="text-white font-black text-lg">{auth.currentUser?.email}</p>
          <p className="text-blue-200 text-xs font-medium">Öğrenci Hesabı</p>
        </div>
      </div>

      {/* Ayar grupları */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        {SETTINGS_ITEMS.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition ${
              i < SETTINGS_ITEMS.length - 1 ? "border-b border-gray-50" : ""
            }`}
          >
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-lg shrink-0">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#1C3FAA] text-sm">{item.label}</p>
              <p className="text-gray-400 text-xs truncate">{item.desc}</p>
            </div>
            <span className="text-gray-300 text-xl shrink-0">›</span>
          </Link>
        ))}
      </div>

      {/* Çıkış */}
      <button
        onClick={handleSignOut}
        className="w-full bg-white border border-red-100 rounded-3xl py-4 flex items-center justify-center gap-3 text-red-500 font-bold hover:bg-red-50 transition shadow-sm"
      >
        <span className="text-xl">🚪</span>
        Güvenli Çıkış
      </button>
    </div>
  );
}
