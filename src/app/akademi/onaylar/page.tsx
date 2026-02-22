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

export default function AkademiOnaylar() {
  const [surecler, setSurecler] = useState<Basvuru[]>([]);
  const [seciliSurec, setSeciliSurec] = useState<Basvuru | null>(null);
  const [belgeMetni, setBelgeMetni] = useState("");
  const [redSebebi, setRedSebebi] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "basvurular"),
      where("durum", "==", "AKADEMIK_BEKLIYOR"),
    );
    return onSnapshot(q, (sn) =>
      setSurecler(sn.docs.map((d) => ({ id: d.id, ...d.data() })) as any),
    );
  }, []);

  const handleKarar = async (yeniDurum: string) => {
    if (!seciliSurec) return;
    try {
      const ref = doc(db, "basvurular", seciliSurec.id);
      await updateDoc(ref, {
        durum: yeniDurum,
        istenenBelgeler:
          yeniDurum === "ONAYLANDI"
            ? belgeMetni.split(",").map((s) => s.trim())
            : [],
        redSebebi: yeniDurum === "AKADEMIK_REDDETTI" ? redSebebi : "",
        akademisyenOnayTarihi: serverTimestamp(),
      });
      alert("İşlem başarıyla kaydedildi.");
      setSeciliSurec(null);
    } catch (e) {
      alert("Hata oluştu.");
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-100px)] text-black">
      {/* SOL: LİSTE (AkademikOgrenciCard karşılığı) */}
      <div className="flex-1 overflow-y-auto pr-4">
        <h2 className="text-2xl font-bold mb-6 italic">
          Onay Bekleyen Öğrenciler
        </h2>
        <div className="space-y-4">
          {surecler.map((surec) => (
            <div
              key={surec.id}
              onClick={() => setSeciliSurec(surec)}
              className={`p-5 bg-white rounded-2xl border-2 transition cursor-pointer ${seciliSurec?.id === surec.id ? "border-blue-500 shadow-md" : "border-transparent hover:border-blue-100"}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold">{surec.email}</p>
                  <p className="text-sm text-blue-600 font-medium">
                    {surec.ilanBaslik} - {surec.firmaAdi}
                  </p>
                </div>
                <span className="text-blue-500 font-bold">İncele →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SAĞ: DETAY (AkademikOnaySheetContent karşılığı) */}
      <div className="w-96 bg-white rounded-3xl shadow-xl p-6 border overflow-y-auto">
        {seciliSurec ? (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-blue-900 border-b pb-4 italic">
              Süreç Değerlendirme
            </h3>

            <div>
              <p className="text-xs font-bold text-gray-400 mb-2 uppercase">
                Öğrenci Motivasyonu
              </p>
              <div className="bg-gray-50 p-4 rounded-xl text-sm italic">
                "{seciliSurec.akademikMotivasyon || seciliSurec.motivasyon}"
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">
                İstenen Belgeler (Virgül ile ayırın)
              </label>
              <textarea
                value={belgeMetni}
                onChange={(e) => setBelgeMetni(e.target.value)}
                placeholder="SGK Girişi, Onaylı Form..."
                className="w-full mt-2 p-3 border rounded-xl text-sm min-h-[100px]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleKarar("AKADEMIK_REDDETTI")}
                className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100"
              >
                Reddet
              </button>
              <button
                onClick={() => handleKarar("ONAYLANDI")}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200"
              >
                Onayla
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 italic text-center">
            İncelemek istediğiniz öğrenciyi soldan seçin.
          </div>
        )}
      </div>
    </div>
  );
}
