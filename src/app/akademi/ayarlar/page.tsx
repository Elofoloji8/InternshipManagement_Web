"use client";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AkademiAyarlarPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const ayarKartlari = [
    {
      icon: "🔐",
      title: "Hesap Güvenliği",
      desc: "Şifre değiştirme ve güvenlik ayarları",
    },
    {
      icon: "🔔",
      title: "Bildirim Ayarları",
      desc: "Yeni başvurular için e-posta bildirimleri",
    },
    {
      icon: "🏢",
      title: "Bölüm Bilgileri",
      desc: "Sorumlu olduğunuz bölüm ve staj kriterleri",
    },
    {
      icon: "ℹ️",
      title: "Sistem Hakkında",
      desc: "Uygulama versiyonu ve destek",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 text-black">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 italic">Ayarlar ⚙️</h1>
        <p className="text-gray-500 mt-2">
          Hesap ve uygulama tercihlerinizi yönetin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ayarKartlari.map((ayar, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <span className="text-3xl grayscale group-hover:grayscale-0 transition">
                {ayar.icon}
              </span>
              <div>
                <h3 className="font-bold text-gray-800">{ayar.title}</h3>
                <p className="text-xs text-gray-500">{ayar.desc}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Çıkış Kartı */}
        <div
          onClick={handleLogout}
          className="bg-red-50 p-6 rounded-3xl border border-red-100 hover:bg-red-100 transition cursor-pointer flex items-center space-x-4"
        >
          <span className="text-3xl">🚪</span>
          <div>
            <h3 className="font-bold text-red-700">Çıkış Yap</h3>
            <p className="text-xs text-red-500">
              Hesabınızdan güvenli bir şekilde ayrılın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
