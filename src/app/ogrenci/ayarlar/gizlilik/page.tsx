"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const GIZLILIK_ITEMS = [
  { key: "profilGorunurluk", label: "Profil Görünürlüğü", desc: "Profiliniz şirketler tarafından görülsün" },
  { key: "cvGorunurluk", label: "CV Görünürlüğü", desc: "CV'niz başvuru olmadan görülebilsin" },
  { key: "istatistikler", label: "İstatistik Paylaşımı", desc: "Anonim kullanım verilerini paylaş" },
];

export default function GizlilikPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, boolean>>({
    profilGorunurluk: true,
    cvGorunurluk: false,
    istatistikler: true,
  });

  const toggle = (key: string) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="text-black">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-[#2F6FED] font-bold text-sm mb-6">
        ← Geri
      </button>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1C3FAA]">Gizlilik</h1>
        <p className="text-gray-400 text-sm mt-1">Hesap gizlilik tercihlerinizi yönetin</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {GIZLILIK_ITEMS.map((item, i) => (
          <div key={item.key}
            className={`flex items-center gap-4 px-5 py-4 ${i < GIZLILIK_ITEMS.length - 1 ? "border-b border-gray-50" : ""}`}>
            <div className="flex-1">
              <p className="font-bold text-[#1C3FAA] text-sm">{item.label}</p>
              <p className="text-gray-400 text-xs">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`w-12 h-6 rounded-full transition-all duration-300 relative shrink-0 ${
                settings[item.key] ? "bg-[#2F6FED]" : "bg-gray-200"
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                settings[item.key] ? "left-6" : "left-0.5"
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
