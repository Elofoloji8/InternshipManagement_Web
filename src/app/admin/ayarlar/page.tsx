"use client";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function AdminAyarlar() {
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const cards = [
    {
      icon: "🔐",
      title: "Hesap Güvenliği",
      sub: "Admin şifre ve erişim ayarları",
    },
    {
      icon: "🔔",
      title: "Sistem Bildirimleri",
      sub: "Yeni kayıt ve hata bildirimleri",
    },
    {
      icon: "🔒",
      title: "Gizlilik & Veri",
      sub: "Kullanıcı verilerini yönetin",
    },
  ];

  return (
    <div className="max-w-4xl text-black">
      <h1 className="text-3xl font-bold text-blue-900 mb-8 italic">
        Sistem Ayarları ⚙️
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition"
          >
            <span className="text-3xl mb-3 block">{c.icon}</span>
            <h3 className="font-bold text-gray-800">{c.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
        <button
          onClick={handleLogout}
          className="bg-red-50 p-6 rounded-[24px] border border-red-100 text-left hover:bg-red-100 transition"
        >
          <span className="text-3xl mb-3 block">🚪</span>
          <h3 className="font-bold text-red-700">Çıkış Yap</h3>
          <p className="text-xs text-red-500 mt-1">Sistemden güvenli çıkış</p>
        </button>
      </div>
    </div>
  );
}
