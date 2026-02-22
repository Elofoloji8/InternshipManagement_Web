"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
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

export default function BasvurularimPage() {
  const [basvurular, setBasvurular] = useState<Basvuru[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [motivasyon, setMotivasyon] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "basvurular"),
      where("ogrenciId", "==", auth.currentUser.uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Basvuru[];
      setBasvurular(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAkademikBasvuru = async (basvuruId: string) => {
    if (!motivasyon.trim())
      return alert("Lütfen akademik sorumlu için motivasyon notunuzu giriniz.");

    try {
      const basvuruRef = doc(db, "basvurular", basvuruId);
      await updateDoc(basvuruRef, {
        durum: "AKADEMIK_BEKLIYOR",
        akademikMotivasyon: motivasyon,
        akademikBasvuruTarihi: serverTimestamp(),
      });
      alert("Akademik onay süreci başlatıldı! 🎓");
      setSelectedId(null);
      setMotivasyon("");
    } catch (error) {
      alert("Hata oluştu.");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-black">
        Başvurular yükleniyor...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 text-black">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">
        Başvurularım ve Süreç Takibi
      </h1>

      {basvurular.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-dashed text-center">
          <p className="text-gray-500">Henüz bir başvurunuz bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {basvurular.map((basvuru) => (
            <div
              key={basvuru.id}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-blue-900">
                    {basvuru.ilanBaslik}
                  </h2>
                  <p className="text-gray-500 font-semibold">
                    {basvuru.firmaAdi}
                  </p>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusStyle(basvuru.durum)}`}
                >
                  {basvuru.durum}
                </span>
              </div>

              {/* TIMELINE (Süreç Çizelgesi) */}
              <div className="flex justify-between items-center relative mb-10 px-4">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10"></div>
                <TimelineStep label="Başvuru" completed={true} />
                <TimelineStep
                  label="Şirket Onayı"
                  active={
                    basvuru.durum === "SIRKET_ONAYLADI" ||
                    basvuru.durum === "AKADEMIK_BEKLIYOR" ||
                    basvuru.durum === "ONAYLANDI"
                  }
                  completed={basvuru.durum !== "BEKLIYOR"}
                />
                <TimelineStep
                  label="Akademik Onay"
                  active={basvuru.durum === "AKADEMIK_BEKLIYOR"}
                  completed={basvuru.durum === "ONAYLANDI"}
                />
              </div>

              {/* AKADEMİK BAŞVURU BUTONU */}
              {basvuru.durum === "SIRKET_ONAYLADI" && (
                <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-100">
                  <p className="text-green-800 text-sm mb-4 font-medium">
                    Tebrikler! Şirket başvurunuzu onayladı. Şimdi akademik
                    sorumlunuzdan onay almanız gerekiyor.
                  </p>
                  <button
                    onClick={() => setSelectedId(basvuru.id)}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
                  >
                    Akademik Onaya Gönder 🎓
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AKADEMİK BAŞVURU MODALI */}
      {selectedId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold mb-2">Akademik Başvuru</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Bu stajın akademik uygunluğu için kısa bir açıklama yazınız.
            </p>
            <textarea
              className="w-full p-4 border rounded-2xl h-40 mb-6 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hangi derslerle ilişkili? Neler öğreneceksiniz?"
              value={motivasyon}
              onChange={(e) => setMotivasyon(e.target.value)}
            />
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedId(null)}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-bold"
              >
                Vazgeç
              </button>
              <button
                onClick={() => handleAkademikBasvuru(selectedId)}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold"
              >
                Başvuruyu Tamamla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineStep({
  label,
  active,
  completed,
}: {
  label: string;
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <div className="flex flex-col items-center bg-white px-2">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
          completed
            ? "bg-green-500 text-white shadow-lg shadow-green-100"
            : active
              ? "bg-blue-600 text-white shadow-lg shadow-blue-100 animate-pulse"
              : "bg-gray-100 text-gray-400"
        }`}
      >
        {completed ? "✓" : "!"}
      </div>
      <span
        className={`text-[11px] mt-2 font-bold ${active || completed ? "text-gray-900" : "text-gray-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case "BEKLIYOR":
      return "bg-blue-50 text-blue-600";
    case "SIRKET_ONAYLADI":
      return "bg-green-50 text-green-600";
    case "AKADEMIK_BEKLIYOR":
      return "bg-yellow-50 text-yellow-600";
    case "ONAYLANDI":
      return "bg-purple-50 text-purple-600";
    default:
      return "bg-gray-50 text-gray-600";
  }
}
