"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface StajSureci {
  id: string;
  ogrenciAdSoyad?: string;
  ogrenciEmail?: string;
  ilanBaslik?: string;
  sirketAdi?: string;
  durum: string;
  istenenBelgeler?: string[];
  ogrenciBelgeUrl?: string;
}

export default function AktifStajyerlerPage() {
  const [stajyerler, setStajyerler] = useState<StajSureci[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "staj_surecleri"),
      where("durum", "==", "TAMAMLANDI"),
    );
    return onSnapshot(q, (sn) => {
      setStajyerler(
        sn.docs.map((d) => ({ id: d.id, ...d.data() } as StajSureci)),
      );
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-400">Yükleniyor...</div>
    );

  return (
    <div className="text-black">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-400 text-sm font-medium">Akademik Panel</p>
        <h1 className="text-3xl font-black text-[#1C3FAA]">
          Aktif Stajyerler 👥
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Staj süreci tamamlanan ve devam eden öğrenciler.
        </p>
      </div>

      {stajyerler.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-gray-500 font-bold">
            Henüz tamamlanmış staj bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {stajyerler.map((s) => (
            <div
              key={s.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#2F6FED] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {(s.ogrenciAdSoyad || s.ogrenciEmail || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {s.ogrenciAdSoyad || s.ogrenciEmail}
                  </p>
                  <p className="text-sm text-[#2F6FED] font-medium">
                    {s.ilanBaslik} @ {s.sirketAdi}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                  Belgeler
                </p>
                <div className="flex flex-wrap gap-2">
                  {s.istenenBelgeler?.map((belge, i) => (
                    <span
                      key={i}
                      className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-bold border border-green-100"
                    >
                      ✓ {belge}
                    </span>
                  ))}
                </div>
                {s.ogrenciBelgeUrl && (
                  <a
                    href={s.ogrenciBelgeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#2F6FED] font-bold hover:underline mt-2 block"
                  >
                    📄 Yüklenen Belgeyi Görüntüle
                  </a>
                )}
              </div>

              <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter">
                Staj Tamamlandı ✓
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
