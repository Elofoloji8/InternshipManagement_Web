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
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

interface Basvuru {
  id: string;
  ogrenciEmail: string;
  ilanBaslik: string;
  firmaAdi: string;
  motivasyon: string;
  durum: string;
  tarih: unknown;
  sirketId: string;
  ilanId: string;
  adSoyad?: string;
  bolum?: string;
  gano?: string;
}

const TAB_LABELS = ["Bekleyen", "Onaylanan", "Reddedilen"];
const TAB_DURUMS = ["BEKLIYOR", "SIRKET_ONAYLADI", "REDDEDILDI"];

const MATCH_SCORES: Record<string, number> = {};
function getMatchScore(id: string) {
  if (!MATCH_SCORES[id]) MATCH_SCORES[id] = 75 + Math.floor(Math.random() * 24);
  return MATCH_SCORES[id];
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "w-14 h-14 text-xl" : size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-sm";
  return (
    <div className={`${s} bg-blue-100 rounded-full flex items-center justify-center font-black text-[#2F6FED] shrink-0`}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

function DetayModal({
  basvuru,
  onClose,
  onKarar,
}: {
  basvuru: Basvuru;
  onClose: () => void;
  onKarar: (id: string, karar: string) => void;
}) {
  const [showRedSebepler, setShowRedSebepler] = useState(false);
  const redSebepler = [
    "Yetenek Uyumsuzluğu",
    "GANO Yetersizliği",
    "Kontenjan Dolu",
    "Diğer",
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-t-[2rem] p-6 pb-10 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

        {/* Üst profil alanı */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar name={basvuru.adSoyad || basvuru.ogrenciEmail} size="lg" />
          <div>
            <p className="text-lg font-bold text-[#1C3FAA]">
              {basvuru.adSoyad || basvuru.ogrenciEmail}
            </p>
            <p className="text-gray-400 text-sm">{basvuru.ogrenciEmail}</p>
          </div>
        </div>

        {/* Aday Bilgileri */}
        <div className="bg-[#F8F9FD] rounded-2xl p-4 space-y-3 mb-4">
          {basvuru.bolum && (
            <div>
              <p className="text-xs text-gray-400">Bölüm</p>
              <p className="text-sm font-semibold text-[#1C3FAA]">{basvuru.bolum}</p>
            </div>
          )}
          {basvuru.gano && (
            <div>
              <p className="text-xs text-gray-400">GANO</p>
              <p className="text-sm font-semibold text-[#1C3FAA]">{basvuru.gano}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400">Başvurulan İlan</p>
            <p className="text-sm font-semibold text-[#1C3FAA]">{basvuru.ilanBaslik}</p>
          </div>
        </div>

        {/* Motivasyon */}
        <div className="mb-6">
          <p className="font-bold text-[#1C3FAA] text-sm mb-2">Motivasyon Mektubu</p>
          <div className="bg-[#F8F9FD] border border-gray-100 rounded-2xl p-4">
            <p className="text-gray-600 text-sm leading-relaxed italic">
              &ldquo;{basvuru.motivasyon || "Motivasyon mektubu bulunamadı."}&rdquo;
            </p>
          </div>
        </div>

        {/* Aksiyon butonları */}
        {basvuru.durum === "BEKLIYOR" && (
          <div className="space-y-3">
            {showRedSebepler ? (
              <div className="bg-red-50 rounded-2xl overflow-hidden">
                <p className="text-xs font-bold text-red-500 p-3 pb-1">Red Nedeni Seçin</p>
                {redSebepler.map((sebep) => (
                  <button
                    key={sebep}
                    onClick={() => {
                      onKarar(basvuru.id, "REDDEDILDI", sebep);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-red-100 transition border-t border-red-100/50"
                  >
                    {sebep}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRedSebepler(true)}
                  className="flex-1 py-3.5 border border-red-300 text-red-500 font-bold rounded-2xl hover:bg-red-50 transition"
                >
                  Reddet
                </button>
                <button
                  onClick={() => {
                    onKarar(basvuru.id, "SIRKET_ONAYLADI");
                    onClose();
                  }}
                  className="flex-1 py-3.5 bg-[#2F6FED] text-white font-bold rounded-2xl hover:bg-blue-700 transition"
                >
                  Onayla
                </button>
              </div>
            )}
          </div>
        )}

        {basvuru.durum !== "BEKLIYOR" && (
          <div
            className={`p-3 rounded-2xl text-center text-sm font-bold ${
              basvuru.durum === "SIRKET_ONAYLADI"
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {basvuru.durum === "SIRKET_ONAYLADI" ? "✅ Onaylandı" : "❌ Reddedildi"}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SirketBasvurular() {
  const [basvurular, setBasvurular] = useState<Basvuru[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [ganoFilter, setGanoFilter] = useState(false);
  const [selectedBasvuru, setSelectedBasvuru] = useState<Basvuru | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(
      collection(db, "basvurular"),
      where("sirketId", "==", user.uid),
    );
    return onSnapshot(q, (sn) =>
      setBasvurular(sn.docs.map((d) => ({ id: d.id, ...d.data() } as Basvuru))),
    );
  }, []);

  const handleKarar = async (id: string, karar: string) => {
    const user = auth.currentUser;
    await updateDoc(doc(db, "basvurular", id), { durum: karar });

    // Onaylandığında staj_surecleri'ne kayıt oluştur
    if (karar === "SIRKET_ONAYLADI" && user) {
      const basvuru = basvurular.find((b) => b.id === id);
      if (basvuru) {
        const surecId = `${basvuru.ilanId}_${basvuru.ogrenciEmail}`;
        await setDoc(doc(db, "staj_surecleri", surecId), {
          surecId,
          ilanId: basvuru.ilanId,
          ilanBaslik: basvuru.ilanBaslik,
          sirketId: user.uid,
          sirketAdi: basvuru.firmaAdi || "",
          ogrenciId: basvuru.ogrenciEmail,
          ogrenciAdSoyad: basvuru.adSoyad || "",
          ogrenciEmail: basvuru.ogrenciEmail,
          durum: "SIRKET_ONAYLADI",
          baslangicTarihi: serverTimestamp(),
        });
      }
    }
  };

  const filtrelenmis = basvurular.filter((b) => {
    const tabUygun = b.durum === TAB_DURUMS[activeTab];
    const aramaUygun = (b.adSoyad || b.ogrenciEmail || "")
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const ganoUygun = ganoFilter
      ? (parseFloat(b.gano || "0") >= 3.0)
      : true;
    return tabUygun && aramaUygun && ganoUygun;
  });

  return (
    <div className="text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-400 text-sm font-medium">Yönetim Paneli 🎯</p>
          <h1 className="text-3xl font-black text-[#1C3FAA]">Başvuru Havuzu</h1>
        </div>
        <div className="w-11 h-11 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-xl">
          👥
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-4">
        {TAB_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-3 text-sm font-bold transition relative ${
              activeTab === i ? "text-[#2F6FED]" : "text-gray-400"
            }`}
          >
            {label}
            {activeTab === i && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2F6FED] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-white border border-gray-100 rounded-2xl flex items-center gap-3 px-4 py-3 mb-4 shadow-sm">
        <span className="text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Aday ismi ile ara..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-300"
        />
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          onClick={() => setGanoFilter(!ganoFilter)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
            ganoFilter
              ? "bg-[#2F6FED] text-white border-[#2F6FED]"
              : "bg-white text-gray-500 border-gray-200"
          }`}
        >
          3.0+
        </button>
      </div>

      {/* Liste */}
      {filtrelenmis.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 mt-4">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-bold text-[#1C3FAA]">Başvuru bulunamadı</p>
          <p className="text-gray-400 text-sm mt-1">
            Bu sekme için henüz başvuru yok.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrelenmis.map((b) => {
            const score = getMatchScore(b.id);
            const displayName = b.adSoyad || b.ogrenciEmail;
            return (
              <div
                key={b.id}
                onClick={() => setSelectedBasvuru(b)}
                className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition"
              >
                <Avatar name={displayName} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#1C3FAA] text-sm truncate">
                    {displayName}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5 truncate">
                    {b.bolum || b.ilanBaslik}
                  </p>
                  <p className="text-gray-300 text-xs mt-0.5">2 gün önce</p>
                </div>
                <div
                  className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold ${
                    score > 90
                      ? "bg-green-50 text-green-700"
                      : "bg-blue-50 text-[#2F6FED]"
                  }`}
                >
                  %{score} Uyum
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedBasvuru && (
        <DetayModal
          basvuru={selectedBasvuru}
          onClose={() => setSelectedBasvuru(null)}
          onKarar={handleKarar}
        />
      )}
    </div>
  );
}
