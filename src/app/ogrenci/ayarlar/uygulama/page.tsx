"use client";
import { useRouter } from "next/navigation";

export default function UygulamaAyarlariPage() {
  const router = useRouter();

  return (
    <div className="text-black">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-[#2F6FED] font-bold text-sm mb-6">
        ← Geri
      </button>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1C3FAA]">Uygulama Ayarları</h1>
        <p className="text-gray-400 text-sm mt-1">Görünüm ve dil tercihleri</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Dil</p>
          <div className="flex gap-3">
            {["Türkçe", "English"].map((lang) => (
              <button key={lang}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-bold border transition ${
                  lang === "Türkçe"
                    ? "bg-[#2F6FED] text-white border-[#2F6FED]"
                    : "bg-white text-gray-500 border-gray-200"
                }`}>
                {lang}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">Tema</p>
          <div className="flex gap-3">
            {["Açık", "Koyu", "Sistem"].map((theme) => (
              <button key={theme}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-bold border transition ${
                  theme === "Açık"
                    ? "bg-[#2F6FED] text-white border-[#2F6FED]"
                    : "bg-white text-gray-500 border-gray-200"
                }`}>
                {theme}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
