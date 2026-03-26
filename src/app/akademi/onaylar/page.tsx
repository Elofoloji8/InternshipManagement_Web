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

interface StajSureci {
  id: string;
  ogrenciId: string;
  ogrenciAdSoyad?: string;
  ogrenciEmail?: string;
  ilanId: string;
  ilanBaslik?: string;
  sirketId?: string;
  sirketAdi?: string;
  durum: string;
  motivasyonMektubu?: string;
  istenenBelgeler?: string[];
  akademikRedSebebi?: string;
}

const DURUM_LABELS: Record<string, string> = {
  AKADEMIK_BEKLIYOR: "Onay Bekliyor",
  BELGE_OGRENCIYE_GONDERILDI: "Belge Bekleniyor",
  BELGE_AKADEMIYE_GONDERILDI: "Belge İncelemede",
  TAMAMLANDI: "Tamamlandı",
  AKADEMIK_REDDETTI: "Reddedildi",
};

const TABS = [
  { label: "Bekleyenler", durum: "AKADEMIK_BEKLIYOR" },
  { label: "Devam Eden", durum: "BELGE_OGRENCIYE_GONDERILDI" },
  { label: "İncelemede", durum: "BELGE_AKADEMIYE_GONDERILDI" },
];

export default function AkademiOnayPage() {
  const [surecler, setSurecler] = useState<StajSureci[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [secili, setSecili] = useState<StajSureci | null>(null);
  const [belgeler, setBelgeler] = useState("");
  const [redSebebi, setRedSebebi] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "staj_surecleri"),
      where("durum", "in", [
        "AKADEMIK_BEKLIYOR",
        "BELGE_OGRENCIYE_GONDERILDI",
        "BELGE_AKADEMIYE_GONDERILDI",
      ]),
    );
    return onSnapshot(q, (sn) =>
      setSurecler(sn.docs.map((d) => ({ id: d.id, ...d.data() } as StajSureci))),
    );
  }, []);

  const filtrelenmis = surecler.filter(
    (s) => s.durum === TABS[activeTab].durum,
  );

  const handleBelgeGonder = async () => {
    if (!secili || !belgeler.trim()) return;
    setLoading(true);
    try {
      const list = belgeler
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      await updateDoc(doc(db, "staj_surecleri", secili.id), {
        istenenBelgeler: list,
        durum: "BELGE_OGRENCIYE_GONDERILDI",
        akademikId: auth.currentUser?.uid,
        onayTarihi: serverTimestamp(),
      });
      setSecili(null);
      setBelgeler("");
    } catch {
      alert("İşlem sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleOnayla = async () => {
    if (!secili) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "staj_surecleri", secili.id), {
        durum: "TAMAMLANDI",
        akademikId: auth.currentUser?.uid,
        onayTarihi: serverTimestamp(),
      });
      setSecili(null);
    } catch {
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleReddet = async () => {
    if (!secili || !redSebebi.trim()) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "staj_surecleri", secili.id), {
        durum: "AKADEMIK_REDDETTI",
        akademikRedSebebi: redSebebi,
        akademikId: auth.currentUser?.uid,
        onayTarihi: serverTimestamp(),
      });
      setSecili(null);
      setRedSebebi("");
    } catch {
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 text-black">
      {/* Sol: Süreç Listesi */}
      <div className="w-80 shrink-0 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-4">
          {TABS.map((t, i) => (
            <button
              key={t.durum}
              onClick={() => { setActiveTab(i); setSecili(null); }}
              className={`flex-1 py-2.5 text-xs font-bold transition relative ${
                activeTab === i ? "text-[#2F6FED]" : "text-gray-400"
              }`}
            >
              {t.label}
              {activeTab === i && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2F6FED] rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtrelenmis.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Bu sekmede süreç yok
            </div>
          ) : (
            filtrelenmis.map((s) => (
              <div
                key={s.id}
                onClick={() => setSecili(s)}
                className={`p-4 rounded-2xl cursor-pointer transition border-2 ${
                  secili?.id === s.id
                    ? "bg-white border-[#2F6FED] shadow-md"
                    : "bg-white border-transparent hover:border-blue-100"
                }`}
              >
                <p className="font-bold text-[#1C3FAA] text-sm">
                  {s.ogrenciAdSoyad || s.ogrenciEmail || "İsimsiz Öğrenci"}
                </p>
                <p className="text-gray-500 text-xs mt-0.5 truncate">
                  {s.ilanBaslik}
                </p>
                <p className="text-gray-400 text-[10px] mt-1 font-bold uppercase">
                  {s.sirketAdi}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sağ: Detay Paneli */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-y-auto">
        {!secili ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <span className="text-6xl">🎓</span>
            <p className="font-medium">
              Değerlendirmek için soldan bir süreç seçin.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-2xl font-black text-[#1C3FAA]">
                  {secili.ogrenciAdSoyad || secili.ogrenciEmail}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {secili.ilanBaslik} @ {secili.sirketAdi}
                </p>
              </div>
              <span className="bg-blue-50 text-[#2F6FED] text-xs font-bold px-3 py-1.5 rounded-xl">
                {DURUM_LABELS[secili.durum] || secili.durum}
              </span>
            </div>

            {/* Motivasyon */}
            {secili.motivasyonMektubu && (
              <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                  Akademik Motivasyon
                </p>
                <p className="text-blue-900 text-sm italic">
                  &ldquo;{secili.motivasyonMektubu}&rdquo;
                </p>
              </div>
            )}

            {/* Bekleyen — Belge tanımla veya reddet */}
            {secili.durum === "AKADEMIK_BEKLIYOR" && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                  <p className="text-sm font-bold text-green-800 mb-2">
                    ✓ Onaylamak için istenen belgeleri tanımlayın
                  </p>
                  <input
                    type="text"
                    placeholder="Örn: SGK Giriş, Onaylı Defter, Sözleşme (virgülle ayır)"
                    className="w-full p-3 border border-green-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                    value={belgeler}
                    onChange={(e) => setBelgeler(e.target.value)}
                  />
                  <button
                    onClick={handleBelgeGonder}
                    disabled={loading || !belgeler.trim()}
                    className="mt-3 w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Belgeleri İste ve Onayla
                  </button>
                </div>

                <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                  <p className="text-sm font-bold text-red-800 mb-2">
                    ✕ Reddetmek için sebep belirtin
                  </p>
                  <input
                    type="text"
                    placeholder="Örn: Staj içeriği bölüme uygun değil..."
                    className="w-full p-3 border border-red-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-400"
                    value={redSebebi}
                    onChange={(e) => setRedSebebi(e.target.value)}
                  />
                  <button
                    onClick={handleReddet}
                    disabled={loading || !redSebebi.trim()}
                    className="mt-3 w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    Başvuruyu Reddet
                  </button>
                </div>
              </div>
            )}

            {/* Belge İnceleme aşamasında */}
            {secili.durum === "BELGE_AKADEMIYE_GONDERILDI" && (
              <div className="space-y-4">
                {secili.istenenBelgeler && secili.istenenBelgeler.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                      İstenen Belgeler
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {secili.istenenBelgeler.map((b, i) => (
                        <span
                          key={i}
                          className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1 rounded-lg font-medium"
                        >
                          📄 {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleReddet}
                    disabled={loading}
                    className="flex-1 py-3.5 border border-red-300 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition"
                  >
                    Reddet
                  </button>
                  <button
                    onClick={handleOnayla}
                    disabled={loading}
                    className="flex-[2] py-3.5 bg-[#2F6FED] text-white font-bold rounded-2xl hover:bg-blue-700 transition"
                  >
                    Stajı Tamamla ✓
                  </button>
                </div>
              </div>
            )}

            {/* Belge bekleniyor */}
            {secili.durum === "BELGE_OGRENCIYE_GONDERILDI" && (
              <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
                <p className="text-yellow-800 font-bold text-sm mb-2">
                  ⏳ Öğrenciden Belge Bekleniyor
                </p>
                {secili.istenenBelgeler && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {secili.istenenBelgeler.map((b, i) => (
                      <span
                        key={i}
                        className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-lg font-bold"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
