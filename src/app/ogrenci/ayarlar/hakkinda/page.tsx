"use client";
import { useRouter } from "next/navigation";

export default function HakkindaPage() {
  const router = useRouter();

  return (
    <div className="text-black">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-[#2F6FED] font-bold text-sm mb-6">
        ← Geri
      </button>

      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-[#2F6FED] rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg shadow-blue-200">
          🎓
        </div>
        <h1 className="text-2xl font-black text-[#1C3FAA]">İnteraktif Staj</h1>
        <p className="text-gray-400 text-sm mt-1">Yönetim Sistemi</p>
        <span className="bg-blue-50 text-[#2F6FED] text-xs font-black px-3 py-1 rounded-xl inline-block mt-2">
          v1.0.0
        </span>
      </div>

      <div className="space-y-3">
        {[
          { label: "Geliştirici", value: "İnteraktif Staj Ekibi" },
          { label: "Sürüm", value: "1.0.0" },
          { label: "Platform", value: "Web (Next.js)" },
          { label: "Destek", value: "destek@staj.edu.tr" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex justify-between items-center">
            <p className="text-gray-500 text-sm font-medium">{item.label}</p>
            <p className="font-bold text-[#1C3FAA] text-sm">{item.value}</p>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-300 text-xs mt-8">
        © 2024 İnteraktif Staj Yönetim Sistemi. Tüm hakları saklıdır.
      </p>
    </div>
  );
}
