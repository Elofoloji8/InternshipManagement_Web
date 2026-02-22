"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";

export default function AkademiDashboard() {
  const [onayBekleyenSayisi, setOnayBekleyenSayisi] = useState(0);

  useEffect(() => {
    // Sadece akademik onay bekleyenleri filtrele
    const q = query(
      collection(db, "basvurular"),
      where("durum", "==", "AKADEMIK_BEKLIYOR"),
    );
    return onSnapshot(q, (snapshot) => setOnayBekleyenSayisi(snapshot.size));
  }, []);

  return (
    <div className="p-8 text-black">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-blue-900 italic">
          Akademik Panel 🎓
        </h1>
        <p className="text-gray-500">
          Öğrenci onaylarını ve staj süreçlerini yönetin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Onay Bekleyenler Kartı */}
        <Link
          href="/akademi/onaylar"
          className="bg-white p-6 rounded-3xl shadow-sm border hover:shadow-md transition group"
        >
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-4">
            📋
          </div>
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-bold">Staj Onayları</h3>
            {onayBekleyenSayisi > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                {onayBekleyenSayisi} Yeni
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Onay bekleyen süreçleri inceleyin.
          </p>
        </Link>

        {/* Diğer Kartlar (Mobil kodundaki Group, BarChart, Settings karşılığı) */}
        <div className="bg-white p-6 rounded-3xl border opacity-60 cursor-not-allowed">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-4">
            👥
          </div>
          <h3 className="font-bold">Aktif Stajyerler</h3>
          <p className="text-xs text-gray-400">
            Devam eden stajları listeleyin.
          </p>
        </div>
      </div>
    </div>
  );
}
