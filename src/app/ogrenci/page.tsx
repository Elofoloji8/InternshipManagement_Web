"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { Ilan } from "@/types";
import Link from "next/link";

const SEHIRLER = ["Tümü", "Ankara", "İstanbul", "İzmir", "Bursa"];
const CALISMA_SEKILLERI = ["Tümü", "Ofis", "Uzaktan", "Hibrit"];
const STAJ_TURLERI = ["Tümü", "Zorunlu", "Gönüllü"];

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3">
      <p className="text-xs text-gray-400 font-medium mb-2">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              value === opt
                ? "bg-[#2F6FED] text-white border-[#2F6FED]"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#2F6FED]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OgrenciHome() {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Filtreler
  const [sehir, setSehir] = useState("Tümü");
  const [calismaSekli, setCalismaSekli] = useState("Tümü");
  const [stajTuru, setStajTuru] = useState("Tümü");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "ilanlar"), (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Ilan[];
      setIlanlar(data.filter((i) => i.aktif));
    });
    return () => unsubscribe();
  }, []);

  // Kaydedilen ilanları getir
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsubscribe = onSnapshot(
      doc(db, "kaydedilen_ilanlar", user.uid),
      (snap) => {
        const ids = (snap.data()?.ilanIds as string[]) || [];
        setSavedIds(new Set(ids));
      },
    );
    return () => unsubscribe();
  }, []);

  const handleBookmark = async (ilanId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "kaydedilen_ilanlar", user.uid);
    const isSaved = savedIds.has(ilanId);

    // Optimistic update
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(ilanId);
      else next.add(ilanId);
      return next;
    });

    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, { ilanIds: [ilanId] });
      } else {
        const current: string[] = snap.data().ilanIds || [];
        const updated = isSaved
          ? current.filter((id) => id !== ilanId)
          : [...current, ilanId];
        await updateDoc(docRef, { ilanIds: updated });
      }
    } catch {
      // Rollback
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(ilanId);
        else next.delete(ilanId);
        return next;
      });
    }
  };

  const aktifFiltreSayisi = [
    sehir !== "Tümü",
    calismaSekli !== "Tümü",
    stajTuru !== "Tümü",
  ].filter(Boolean).length;

  const filtrelenmis = ilanlar.filter((ilan) => {
    const aramaUygun =
      ilan.baslik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ilan.alan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ilan.sehir?.toLowerCase().includes(searchTerm.toLowerCase());
    const sehirUygun = sehir === "Tümü" || ilan.sehir === sehir;
    const calismaUygun =
      calismaSekli === "Tümü" || ilan.calismaSekli === calismaSekli;
    const stajUygun = stajTuru === "Tümü" || ilan.stajTuru === stajTuru;
    return aramaUygun && sehirUygun && calismaUygun && stajUygun;
  });

  return (
    <div className="max-w-6xl mx-auto p-4 text-black">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Geleceğini Keşfet 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Senin için en uygun staj ilanlarını listeledik.
        </p>
      </header>

      {/* Arama + Filtre Butonu */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Pozisyon, alan veya şehir ara..."
            className="w-full p-4 pl-12 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-4 top-4 text-lg">🔍</span>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative px-4 py-2 rounded-2xl border font-bold text-sm transition ${
            showFilters || aktifFiltreSayisi > 0
              ? "bg-[#2F6FED] text-white border-[#2F6FED]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#2F6FED]"
          }`}
        >
          🎛 Filtrele
          {aktifFiltreSayisi > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black">
              {aktifFiltreSayisi}
            </span>
          )}
        </button>
      </div>

      {/* Filtre Paneli */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
          <FilterRow
            label="Şehir"
            options={SEHIRLER}
            value={sehir}
            onChange={setSehir}
          />
          <FilterRow
            label="Çalışma Şekli"
            options={CALISMA_SEKILLERI}
            value={calismaSekli}
            onChange={setCalismaSekli}
          />
          <FilterRow
            label="Staj Türü"
            options={STAJ_TURLERI}
            value={stajTuru}
            onChange={setStajTuru}
          />
          {aktifFiltreSayisi > 0 && (
            <button
              onClick={() => {
                setSehir("Tümü");
                setCalismaSekli("Tümü");
                setStajTuru("Tümü");
              }}
              className="mt-2 text-xs text-red-500 font-bold hover:underline"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}

      {/* Sonuç sayısı */}
      <p className="text-xs text-gray-400 font-medium mb-4">
        {filtrelenmis.length} ilan listeleniyor
      </p>

      {/* Boş durum */}
      {filtrelenmis.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <span className="text-5xl mb-4 block">🚀</span>
          <p className="text-gray-500 text-lg font-medium">
            {searchTerm || aktifFiltreSayisi > 0
              ? "Aramanızla eşleşen ilan bulunamadı."
              : "Henüz bir staj ilanı yayınlanmamış."}
          </p>
        </div>
      )}

      {/* İlan Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtrelenmis.map((ilan) => {
          const isSaved = savedIds.has(ilan.id);
          return (
            <div
              key={ilan.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-xl font-bold text-blue-800 truncate">
                    {ilan.baslik}
                  </h3>
                  <p className="text-gray-500 font-medium text-sm">
                    {ilan.alan}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">
                    {ilan.sehir}
                  </span>
                  <button
                    onClick={() => handleBookmark(ilan.id)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition ${
                      isSaved
                        ? "bg-yellow-100 text-yellow-500"
                        : "bg-gray-50 text-gray-300 hover:bg-yellow-50 hover:text-yellow-400"
                    }`}
                    title={isSaved ? "Kaydedilenlerden çıkar" : "Kaydet"}
                  >
                    {isSaved ? "🔖" : "🔖"}
                  </button>
                </div>
              </div>

              {/* Şirket Bilgisi */}
              <div className="flex items-center mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold mr-3 shadow-md">
                  {ilan.firmaAdi ? ilan.firmaAdi.charAt(0).toUpperCase() : "E"}
                </div>
                <div>
                  <p className="text-sm text-gray-800 font-bold leading-none">
                    {ilan.firmaAdi || "İsimsiz Firma"}
                  </p>
                  <div className="flex items-center mt-1 gap-1">
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {ilan.calismaSekli}
                    </span>
                    <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold">
                      {ilan.stajTuru}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/ogrenci/ilanlar/${ilan.id}`}
                className="mt-auto w-full block text-center py-2.5 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-[#2F6FED] hover:text-white transition duration-200"
              >
                Detayları Gör
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
