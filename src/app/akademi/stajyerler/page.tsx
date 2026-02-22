"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Basvuru } from "@/types";

export default function AktifStajyerlerPage() {
  const [stajyerler, setStajyerler] = useState<Basvuru[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "basvurular"),
      where("durum", "==", "ONAYLANDI"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Basvuru[];
      setStajyerler(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-black italic">
        Veriler yükleniyor...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-4 text-black">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 italic">
          Aktif Stajyer Listesi 👥
        </h1>
        <p className="text-gray-500 mt-2">
          Şu an staj süreci devam eden öğrenciler ve beklenen belgeler.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stajyerler.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed text-center text-gray-400">
            Henüz aktif stajı onaylanmış bir öğrenci bulunmuyor.
          </div>
        ) : (
          stajyerler.map((stajyer) => (
            <div
              key={stajyer.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {stajyer.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {stajyer.email}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium">
                    {stajyer.ilanBaslik} @ {stajyer.firmaAdi}
                  </p>
                </div>
              </div>

              <div className="mt-4 md:mt-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">
                  Beklenen Belgeler
                </p>
                <div className="flex flex-wrap gap-2">
                  {stajyer.istenenBelgeler?.map((belge, idx) => (
                    <span
                      key={idx}
                      className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-bold border border-green-100"
                    >
                      ✓ {belge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 md:mt-0">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter">
                  Staj Devam Ediyor
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
