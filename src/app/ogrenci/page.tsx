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
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { Ilan } from "@/types";
import Link from "next/link";

interface AdminContent {
  id: string;
  title: string;
  description: string;
  colorHex?: string;
  imageUrl?: string;
}

const SEHIRLER = ["Tümü", "Ankara", "İstanbul", "İzmir", "Bursa"];
const CALISMA_SEKILLERI = ["Tümü", "Ofis", "Uzaktan", "Hibrit"];
const STAJ_TURLERI = ["Tümü", "Zorunlu", "Gönüllü"];

function FilterRow({
  label, options, value, onChange,
}: {
  label: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3">
      <p className="text-xs text-gray-400 font-medium mb-2">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {options.map((opt) => (
          <button key={opt} onClick={() => onChange(opt)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              value === opt
                ? "bg-[#2F6FED] text-white border-[#2F6FED]"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#2F6FED]"
            }`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function OgrenciHome() {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [sehir, setSehir] = useState("Tümü");
  const [calismaSekli, setCalismaSekli] = useState("Tümü");
  const [stajTuru, setStajTuru] = useState("Tümü");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      getDoc(doc(db, "kullanicilar", user.uid)).then((snap) => {
        if (snap.exists()) setUserName(snap.data().adSoyad || "");
      });
    }

    const unsub1 = onSnapshot(collection(db, "ilanlar"), (sn) => {
      setIlanlar(
        (sn.docs.map((d) => ({ id: d.id, ...d.data() })) as Ilan[]).filter((i) => i.aktif),
      );
    });

    const q2 = query(collection(db, "admin_contents"), orderBy("timestamp", "desc"), limit(5));
    const unsub2 = onSnapshot(q2, (sn) =>
      setContents(sn.docs.map((d) => ({ id: d.id, ...d.data() } as AdminContent))),
    );

    return () => { unsub1(); unsub2(); };
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    return onSnapshot(doc(db, "kaydedilen_ilanlar", user.uid), (snap) => {
      setSavedIds(new Set((snap.data()?.ilanIds as string[]) || []));
    });
  }, []);

  const handleBookmark = async (ilanId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const docRef = doc(db, "kaydedilen_ilanlar", user.uid);
    const isSaved = savedIds.has(ilanId);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (isSaved) next.delete(ilanId); else next.add(ilanId);
      return next;
    });
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, { ilanIds: [ilanId] });
      } else {
        const current: string[] = snap.data().ilanIds || [];
        await updateDoc(docRef, {
          ilanIds: isSaved ? current.filter((id) => id !== ilanId) : [...current, ilanId],
        });
      }
    } catch {
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (isSaved) next.add(ilanId); else next.delete(ilanId);
        return next;
      });
    }
  };

  const aktifFiltreSayisi = [sehir !== "Tümü", calismaSekli !== "Tümü", stajTuru !== "Tümü"].filter(Boolean).length;

  const filtrelenmis = ilanlar.filter((ilan) => {
    const aramaUygun =
      ilan.baslik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ilan.alan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ilan.sehir?.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      aramaUygun &&
      (sehir === "Tümü" || ilan.sehir === sehir) &&
      (calismaSekli === "Tümü" || ilan.calismaSekli === calismaSekli) &&
      (stajTuru === "Tümü" || ilan.stajTuru === stajTuru)
    );
  });

  return (
    <div className="text-black">
      {/* Kişiselleştirilmiş Karşılama */}
      <div className="mb-6">
        <p className="text-gray-400 text-sm font-medium">Hoş Geldiniz 👋</p>
        <h1 className="text-3xl font-black text-[#1C3FAA]">
          {userName ? `Merhaba, ${userName.split(" ")[0]}!` : "Stajları Keşfet"}
        </h1>
        <p className="text-gray-400 text-sm mt-1">Sana en uygun staj ilanları seni bekliyor.</p>
      </div>

      {/* Admin içerik kartları (yatay kaydırma) */}
      {contents.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-black text-[#1C3FAA] text-sm uppercase tracking-wide">Duyurular & Rehber</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {contents.map((c) => (
              <Link key={c.id} href={`/ogrenci/haber-detay/${c.id}`}
                className="shrink-0 w-64 rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition">
                {c.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageUrl} alt={c.title} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 flex items-center justify-center text-3xl"
                    style={{ backgroundColor: (c.colorHex || "#2F6FED") + "20" }}>
                    📰
                  </div>
                )}
                <div className="bg-white p-3">
                  <p className="font-black text-[#1C3FAA] text-xs truncate">{c.title}</p>
                  <p className="text-gray-400 text-[11px] truncate mt-0.5">{c.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hızlı Erişim */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Link href="/ogrenci/basvurular"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition">
          <span className="text-2xl">📄</span>
          <p className="text-xs font-black text-[#1C3FAA] text-center">Başvurularım</p>
        </Link>
        <Link href="/ogrenci/kaydedilenler"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition">
          <span className="text-2xl">🔖</span>
          <p className="text-xs font-black text-[#1C3FAA] text-center">Kaydedilenler</p>
        </Link>
        <Link href="/ogrenci/profil"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:shadow-md transition">
          <span className="text-2xl">👤</span>
          <p className="text-xs font-black text-[#1C3FAA] text-center">Profilim</p>
        </Link>
      </div>

      {/* Arama + Filtre */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <input type="text" placeholder="Pozisyon, alan veya şehir ara..."
            className="w-full p-4 pl-11 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white shadow-sm text-sm"
            onChange={(e) => setSearchTerm(e.target.value)} />
          <span className="absolute left-3.5 top-4 text-base">🔍</span>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`relative px-4 py-2 rounded-2xl border font-bold text-sm transition ${
            showFilters || aktifFiltreSayisi > 0
              ? "bg-[#2F6FED] text-white border-[#2F6FED]"
              : "bg-white text-gray-600 border-gray-200 hover:border-[#2F6FED]"
          }`}>
          🎛
          {aktifFiltreSayisi > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-black">
              {aktifFiltreSayisi}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm">
          <FilterRow label="Şehir" options={SEHIRLER} value={sehir} onChange={setSehir} />
          <FilterRow label="Çalışma Şekli" options={CALISMA_SEKILLERI} value={calismaSekli} onChange={setCalismaSekli} />
          <FilterRow label="Staj Türü" options={STAJ_TURLERI} value={stajTuru} onChange={setStajTuru} />
          {aktifFiltreSayisi > 0 && (
            <button onClick={() => { setSehir("Tümü"); setCalismaSekli("Tümü"); setStajTuru("Tümü"); }}
              className="mt-2 text-xs text-red-500 font-bold hover:underline">
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 font-medium mb-4">{filtrelenmis.length} ilan listeleniyor</p>

      {filtrelenmis.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <span className="text-5xl mb-4 block">🚀</span>
          <p className="text-gray-500 font-medium">
            {searchTerm || aktifFiltreSayisi > 0 ? "Aramanızla eşleşen ilan bulunamadı." : "Henüz bir staj ilanı yayınlanmamış."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtrelenmis.map((ilan) => {
            const isSaved = savedIds.has(ilan.id);
            return (
              <div key={ilan.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-black text-[#1C3FAA] truncate">{ilan.baslik}</h3>
                    <p className="text-gray-500 text-sm font-medium mt-0.5">{ilan.alan}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold">{ilan.sehir}</span>
                    <button onClick={() => handleBookmark(ilan.id)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition ${
                        isSaved ? "bg-yellow-100 text-yellow-500" : "bg-gray-50 text-gray-300 hover:bg-yellow-50 hover:text-yellow-400"
                      }`}>
                      🔖
                    </button>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  <div className="w-9 h-9 bg-gradient-to-br from-[#2F6FED] to-[#1C3FAA] rounded-xl flex items-center justify-center text-white font-black text-sm mr-3 shadow">
                    {ilan.firmaAdi?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 font-bold leading-none">{ilan.firmaAdi || "İsimsiz Firma"}</p>
                    <div className="flex items-center mt-1 gap-1">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{ilan.calismaSekli}</span>
                      <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold">{ilan.stajTuru}</span>
                    </div>
                  </div>
                </div>

                <Link href={`/ogrenci/ilanlar/${ilan.id}`}
                  className="mt-auto w-full block text-center py-2.5 bg-gray-50 text-gray-700 rounded-2xl font-bold text-sm hover:bg-[#2F6FED] hover:text-white transition">
                  Detayları Gör →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
