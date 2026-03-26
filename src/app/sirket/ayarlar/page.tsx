"use client";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

function AyarCard({
  title,
  subtitle,
  icon,
  iconBg,
  danger = false,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-100 rounded-3xl p-4 flex items-center gap-4 hover:shadow-md transition shadow-sm text-left"
    >
      <div
        className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center text-xl shrink-0`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`font-bold text-sm ${danger ? "text-red-500" : "text-[#1C3FAA]"}`}
        >
          {title}
        </p>
        <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>
      </div>
      <span className="text-gray-300 text-xl shrink-0">›</span>
    </button>
  );
}

export default function SirketAyarlar() {
  const router = useRouter();

  const handleCikis = () => {
    auth.signOut().then(() => router.push("/login"));
  };

  return (
    <div className="max-w-2xl mx-auto text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-gray-400 text-sm font-medium">
            Uygulama Tercihleri ⚙️
          </p>
          <h1 className="text-3xl font-black text-[#1C3FAA]">Ayarlar</h1>
        </div>
        <div className="w-11 h-11 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-xl">
          ⚙️
        </div>
      </div>

      {/* Hesap Yönetimi */}
      <h2 className="text-base font-bold text-[#1C3FAA] mb-3 px-1">
        Hesap Yönetimi
      </h2>
      <div className="space-y-3 mb-8">
        <AyarCard
          title="Hesap Güvenliği"
          subtitle="Email, şifre ve güvenlik işlemleri"
          icon="🔒"
          iconBg="bg-blue-50"
        />
        <AyarCard
          title="Bildirimler"
          subtitle="Başvuru ve ilan hatırlatıcıları"
          icon="🔔"
          iconBg="bg-orange-50"
        />
      </div>

      {/* Uygulama ve Veri */}
      <h2 className="text-base font-bold text-[#1C3FAA] mb-3 px-1">
        Uygulama ve Veri
      </h2>
      <div className="space-y-3 mb-8">
        <AyarCard
          title="Gizlilik & Veri"
          subtitle="Veri kullanımı ve izinleri yönet"
          icon="🛡️"
          iconBg="bg-green-50"
        />
        <AyarCard
          title="Tema ve Görünüm"
          subtitle="Karanlık mod ve uygulama dili"
          icon="🎨"
          iconBg="bg-purple-50"
        />
      </div>

      {/* Destek ve Çıkış */}
      <div className="space-y-3">
        <AyarCard
          title="Destek ve Yardım"
          subtitle="Sıkça sorulan sorular ve iletişim"
          icon="💬"
          iconBg="bg-gray-100"
        />
        <AyarCard
          title="Çıkış Yap"
          subtitle="Hesabından güvenli şekilde ayrıl"
          icon="🚪"
          iconBg="bg-red-50"
          danger
          onClick={handleCikis}
        />
      </div>

      {/* App Info */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-300 font-medium">
          Staj Yönetim Sistemi • v1.0.0
        </p>
      </div>
    </div>
  );
}
