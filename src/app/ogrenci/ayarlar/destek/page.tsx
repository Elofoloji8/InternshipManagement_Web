"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SSS = [
  {
    q: "Başvurumu nasıl takip edebilirim?",
    a: "Sol menüden 'Başvurularım' sayfasına giderek tüm başvurularınızı ve süreç durumlarını takip edebilirsiniz.",
  },
  {
    q: "Akademik onay için ne yapmalıyım?",
    a: "Şirket başvurunuzu onayladıktan sonra Başvurularım sayfasında 'Akademik Onaya Gönder' butonu görünecektir.",
  },
  {
    q: "Belge yükleme nasıl yapılır?",
    a: "Akademik sorumlu belge talep ettiğinde Başvurularım sayfasında 'Belge Yükle' butonu aktif hale gelir.",
  },
  {
    q: "Şifremi unuttum ne yapmalıyım?",
    a: "Giriş sayfasında 'Şifremi Unuttum' seçeneğini kullanarak e-posta adresinize sıfırlama bağlantısı alabilirsiniz.",
  },
];

export default function DestekPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mesaj, setMesaj] = useState("");
  const [gonderildi, setGonderildi] = useState(false);

  const handleGonder = () => {
    if (!mesaj.trim()) return;
    setGonderildi(true);
    setMesaj("");
    setTimeout(() => setGonderildi(false), 3000);
  };

  return (
    <div className="text-black">
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-[#2F6FED] font-bold text-sm mb-6">
        ← Geri
      </button>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1C3FAA]">Destek</h1>
        <p className="text-gray-400 text-sm mt-1">Yardım ve geri bildirim</p>
      </div>

      {/* SSS */}
      <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">Sık Sorulan Sorular</h2>
      <div className="space-y-2 mb-6">
        {SSS.map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <p className="font-bold text-[#1C3FAA] text-sm">{item.q}</p>
              <span className={`text-gray-400 transition-transform ${openIndex === i ? "rotate-180" : ""}`}>▾</span>
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4">
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* İletişim formu */}
      <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider mb-3">Bize Yazın</h2>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
        {gonderildi ? (
          <div className="text-center py-6">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-bold text-green-600">Mesajınız iletildi!</p>
          </div>
        ) : (
          <>
            <textarea
              value={mesaj}
              onChange={(e) => setMesaj(e.target.value)}
              placeholder="Sorununuzu veya geri bildiriminizi yazın..."
              className="w-full p-4 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] h-32 resize-none mb-4"
            />
            <button
              onClick={handleGonder}
              disabled={!mesaj.trim()}
              className="w-full py-3.5 bg-[#2F6FED] text-white font-bold rounded-2xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              Gönder
            </button>
          </>
        )}
      </div>
    </div>
  );
}
