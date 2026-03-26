"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import Link from "next/link";
import { Ilan } from "@/types";

interface IlanWithId extends Ilan {
  basvuruSayisi?: number;
}

function StatusBadge({ aktif }: { aktif: boolean }) {
  return (
    <span
      className={`px-2 py-1 rounded-lg text-xs font-bold ${
        aktif
          ? "bg-green-50 text-green-600"
          : "bg-red-50 text-red-500"
      }`}
    >
      {aktif ? "Yayında" : "Pasif"}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-[#2F6FED]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function IlanDetayModal({
  ilan,
  onClose,
}: {
  ilan: IlanWithId;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-t-[2rem] p-6 pb-10 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

        <h2 className="text-2xl font-black text-[#1C3FAA] leading-tight mb-3">
          {ilan.baslik}
        </h2>

        <div className="flex items-center gap-3 mb-6">
          <StatusBadge aktif={ilan.aktif} />
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="text-gray-500 text-sm font-medium">
            {ilan.alan} • {ilan.sehir}
          </span>
        </div>

        <div className="border-t border-gray-100 my-4" />

        <p className="font-bold text-[#1C3FAA] mb-3">İş Tanımı ve Detaylar</p>
        <div className="bg-[#F8F9FD] border border-gray-100 rounded-2xl p-5">
          <p className="text-gray-600 text-sm leading-relaxed">{ilan.aciklama}</p>
        </div>

        <div className="flex gap-3 mt-8">
          <Link
            href={`/sirket/ilan-duzenle/${ilan.id}`}
            onClick={onClose}
            className="flex-1 py-3.5 border border-[#2F6FED] text-[#2F6FED] font-bold rounded-2xl text-center hover:bg-blue-50 transition"
          >
            İlanı Düzenle
          </Link>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-[#2F6FED] text-white font-bold rounded-2xl hover:bg-blue-700 transition"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SirketIlanlar() {
  const [ilanlar, setIlanlar] = useState<IlanWithId[]>([]);
  const [basvuruCounts, setBasvuruCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tümü");
  const [selectedIlan, setSelectedIlan] = useState<IlanWithId | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "ilanlar"),
      where("sirketId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (sn) => {
      setIlanlar(sn.docs.map((d) => ({ id: d.id, ...d.data() } as IlanWithId)));
      setLoading(false);
    });

    // Başvuru sayılarını çek
    const qBasvuru = query(
      collection(db, "basvurular"),
      where("sirketId", "==", user.uid),
    );
    const unsubBasvuru = onSnapshot(qBasvuru, (sn) => {
      const counts: Record<string, number> = {};
      sn.docs.forEach((d) => {
        const ilanId = d.data().ilanId;
        if (ilanId) counts[ilanId] = (counts[ilanId] || 0) + 1;
      });
      setBasvuruCounts(counts);
    });

    return () => { unsub(); unsubBasvuru(); };
  }, []);

  const handleSil = async (id: string) => {
    if (confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, "ilanlar", id));
    }
  };

  const handleToggle = async (ilan: IlanWithId) => {
    await updateDoc(doc(db, "ilanlar", ilan.id), { aktif: !ilan.aktif });
  };

  const aktifSayisi = ilanlar.filter((i) => i.aktif).length;

  const filtrelenmis = ilanlar.filter((ilan) => {
    const aramaUygun = ilan.baslik
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const filtreUygun =
      selectedFilter === "Tümü"
        ? true
        : selectedFilter === "Aktif"
          ? ilan.aktif
          : !ilan.aktif;
    return aramaUygun && filtreUygun;
  });

  return (
    <div className="text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-400 text-sm font-medium">Yönetim Paneli</p>
          <h1 className="text-3xl font-black text-[#1C3FAA]">İlanlarım</h1>
        </div>
        <Link
          href="/sirket/ilan-ekle"
          className="bg-[#2F6FED] text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-blue-700 transition shadow-md flex items-center gap-2"
        >
          <span>+</span>
          <span>Yeni İlan</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
        <StatCard label="Toplam" count={ilanlar.length} color="#2F6FED" />
        <StatCard label="Yayında" count={aktifSayisi} color="#4CAF50" />
        <StatCard
          label="Pasif"
          count={ilanlar.length - aktifSayisi}
          color="#FF9800"
        />
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-gray-100 rounded-2xl flex items-center gap-3 px-4 py-3 mb-4 shadow-sm">
        <span className="text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="İlanlarda ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-300"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-6">
        {["Tümü", "Aktif", "Pasif"].map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedFilter === f
                ? "bg-[#1C3FAA] text-white"
                : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-white/60 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      ) : filtrelenmis.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-5xl mb-4">
            {searchQuery ? "🔍" : "📋"}
          </p>
          <p className="font-bold text-[#1C3FAA] text-lg">
            {searchQuery ? "Eşleşen ilan bulunamadı" : "Henüz ilanınız yok"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchQuery
              ? "Farklı anahtar kelimeler deneyin."
              : "İlk ilanınızı yayınlayarak başlayın!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtrelenmis.map((ilan) => (
            <div
              key={ilan.id}
              onClick={() => setSelectedIlan(ilan)}
              className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-3">
                  <StatusBadge aktif={ilan.aktif} />
                  <h3 className="text-base font-bold text-[#1C3FAA] mt-2">
                    {ilan.baslik}
                  </h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {ilan.alan} • {ilan.sehir}
                  </p>
                </div>
                <Toggle
                  checked={ilan.aktif}
                  onChange={() => handleToggle(ilan)}
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="bg-blue-50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl">
                  <span className="text-xs">👥</span>
                  <span className="text-xs font-bold text-[#2F6FED]">
                    {basvuruCounts[ilan.id] || 0} Başvuru
                  </span>
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/sirket/ilan-duzenle/${ilan.id}`}
                    className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-[#2F6FED] hover:bg-blue-100 transition text-sm"
                  >
                    ✏️
                  </Link>
                  <button
                    onClick={() => handleSil(ilan.id)}
                    className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 transition text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedIlan && (
        <IlanDetayModal
          ilan={selectedIlan}
          onClose={() => setSelectedIlan(null)}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div
      className="shrink-0 w-28 rounded-2xl p-3 border"
      style={{
        backgroundColor: `${color}14`,
        borderColor: `${color}26`,
      }}
    >
      <p className="text-lg font-black" style={{ color }}>
        {count}
      </p>
      <p className="text-xs text-gray-500 font-bold mt-0.5">{label}</p>
    </div>
  );
}
