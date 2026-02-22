"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Basvuru } from "@/types";

export default function AkademiOnayPage() {
  const [basvurular, setBasvurular] = useState<Basvuru[]>([]);
  const [seciliBasvuru, setSeciliBasvuru] = useState<Basvuru | null>(null);
  const [belgeMetni, setBelgeMetni] = useState("");
  const [redSebebi, setRedSebebi] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Sadece 'AKADEMIK_BEKLIYOR' durumundaki başvuruları dinle
  useEffect(() => {
    const q = query(
      collection(db, "basvurular"),
      where("durum", "==", "AKADEMIK_BEKLIYOR"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Basvuru[];
      setBasvurular(data);
    });

    return () => unsubscribe();
  }, []);

  // 2. Onay veya Red işlemini gerçekleştir
  const handleDecision = async (status: "ONAYLANDI" | "AKADEMIK_REDDETTI") => {
    if (!seciliBasvuru) return;
    setLoading(true);

    try {
      const basvuruRef = doc(db, "basvurular", seciliBasvuru.id);

      const updateData: any = {
        durum: status,
        akademisyenOnayTarihi: serverTimestamp(),
      };

      if (status === "ONAYLANDI") {
        // Kotlin kodundaki gibi virgülle ayrılan belgeleri diziye çeviriyoruz
        updateData.istenenBelgeler = belgeMetni
          .split(",")
          .map((b) => b.trim())
          .filter((b) => b !== "");
      } else {
        updateData.redSebebi = redSebebi;
      }

      await updateDoc(basvuruRef, updateData);

      alert(
        status === "ONAYLANDI"
          ? "Başvuru onaylandı ve belgeler öğrenciye iletildi."
          : "Başvuru reddedildi.",
      );
      setSeciliBasvuru(null);
      setBelgeMetni("");
      setRedSebebi("");
    } catch (error) {
      alert("İşlem sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-8 text-black">
      {/* SOL TARAF: ÖĞRENCİ LİSTESİ */}
      <div className="w-1/3 overflow-y-auto space-y-4 pr-2">
        <h2 className="text-2xl font-bold mb-6 italic text-blue-900">
          Onay Bekleyenler ({basvurular.length})
        </h2>
        {basvurular.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-dashed text-center text-gray-400">
            Bekleyen başvuru bulunmuyor.
          </div>
        ) : (
          basvurular.map((b) => (
            <div
              key={b.id}
              onClick={() => setSeciliBasvuru(b)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                seciliBasvuru?.id === b.id
                  ? "bg-white border-blue-600 shadow-md"
                  : "bg-white border-transparent hover:border-blue-200"
              }`}
            >
              <p className="font-bold text-blue-900">{b.email}</p>
              <p className="text-sm text-gray-600 font-medium">
                {b.ilanBaslik}
              </p>
              <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-widest">
                {b.firmaAdi}
              </p>
            </div>
          ))
        )}
      </div>

      {/* SAĞ TARAF: DEĞERLENDİRME PANELİ */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-y-auto">
        {seciliBasvuru ? (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 italic border-b pb-4">
              Süreç Değerlendirme
            </h3>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Şirket Motivasyonu
                </p>
                <div className="bg-gray-50 p-4 rounded-xl text-sm italic">
                  "{seciliBasvuru.motivasyon}"
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">
                  Akademik Motivasyon
                </p>
                <div className="bg-blue-50 p-4 rounded-xl text-sm italic text-blue-800">
                  "{seciliBasvuru.akademikMotivasyon || "Belirtilmemiş"}"
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Onay Senaryosu */}
              <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                <label className="block text-sm font-bold text-green-800 mb-2 italic">
                  ✓ Onaylamak İçin İstenen Belgeler
                </label>
                <input
                  type="text"
                  placeholder="Örn: SGK Giriş, Onaylı Defter, Sözleşme..."
                  className="w-full p-3 border border-green-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  value={belgeMetni}
                  onChange={(e) => setBelgeMetni(e.target.value)}
                />
                <button
                  onClick={() => handleDecision("ONAYLANDI")}
                  disabled={loading || !belgeMetni}
                  className="mt-4 w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100 disabled:opacity-50"
                >
                  Belgeleri İste ve Onayla
                </button>
              </div>

              {/* Red Senaryosu */}
              <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                <label className="block text-sm font-bold text-red-800 mb-2 italic">
                  ✕ Reddetmek İçin Sebep Belirtin
                </label>
                <input
                  type="text"
                  placeholder="Örn: Staj içeriği bölüme uygun değil..."
                  className="w-full p-3 border border-red-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  value={redSebebi}
                  onChange={(e) => setRedSebebi(e.target.value)}
                />
                <button
                  onClick={() => handleDecision("AKADEMIK_REDDETTI")}
                  disabled={loading || !redSebebi}
                  className="mt-4 w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-100 disabled:opacity-50"
                >
                  Başvuruyu Reddet
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <span className="text-6xl">🎓</span>
            <p className="italic font-medium">
              Değerlendirmek için soldan bir öğrenci seçin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
