"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";

export default function AkademiDashboard() {
  const [counts, setCounts] = useState({ bekleyen: 0, aktif: 0, tamamlanan: 0 });

  useEffect(() => {
    const qBekleyen = query(
      collection(db, "staj_surecleri"),
      where("durum", "==", "AKADEMIK_BEKLIYOR"),
    );
    const unsubBekleyen = onSnapshot(qBekleyen, (sn) =>
      setCounts((prev) => ({ ...prev, bekleyen: sn.size })),
    );

    const qAktif = query(
      collection(db, "staj_surecleri"),
      where("durum", "in", ["BELGE_OGRENCIYE_GONDERILDI", "BELGE_AKADEMIYE_GONDERILDI"]),
    );
    const unsubAktif = onSnapshot(qAktif, (sn) =>
      setCounts((prev) => ({ ...prev, aktif: sn.size })),
    );

    const qTamamlanan = query(
      collection(db, "staj_surecleri"),
      where("durum", "==", "TAMAMLANDI"),
    );
    const unsubTamamlanan = onSnapshot(qTamamlanan, (sn) =>
      setCounts((prev) => ({ ...prev, tamamlanan: sn.size })),
    );

    return () => {
      unsubBekleyen();
      unsubAktif();
      unsubTamamlanan();
    };
  }, []);

  return (
    <div className="text-black">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gray-400 text-sm font-medium">Akademik Panel 🎓</p>
        <h1 className="text-3xl font-black text-[#1C3FAA]">
          Staj Yönetim Merkezi
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Öğrenci onaylarını ve staj süreçlerini yönetin.
        </p>
      </div>

      {/* Stats */}
      <div className="bg-[#2F6FED] rounded-3xl p-6 mb-8 shadow-lg">
        <p className="text-white/80 text-sm font-medium">Onay Bekleyen</p>
        <p className="text-white text-4xl font-bold mt-1">
          {counts.bekleyen} Süreç
        </p>
        <div className="mt-5">
          <Link
            href="/akademi/onaylar"
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl inline-block transition"
          >
            İncele
          </Link>
        </div>
      </div>

      {/* Stat kartları */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4">
          <p className="text-2xl font-black text-yellow-600">{counts.bekleyen}</p>
          <p className="text-xs text-gray-500 font-bold mt-1">Onay Bekleyen</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-2xl font-black text-[#2F6FED]">{counts.aktif}</p>
          <p className="text-xs text-gray-500 font-bold mt-1">Devam Eden</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-2xl font-black text-green-600">{counts.tamamlanan}</p>
          <p className="text-xs text-gray-500 font-bold mt-1">Tamamlanan</p>
        </div>
      </div>

      {/* Quick Access */}
      <h2 className="text-lg font-bold text-[#1C3FAA] mb-4">Hızlı Erişim</h2>
      <div className="space-y-4">
        <Link
          href="/akademi/onaylar"
          className="bg-white border border-gray-100 rounded-3xl p-4 flex items-center gap-4 hover:shadow-md transition shadow-sm"
        >
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">
            📋
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#1C3FAA]">Staj Onayları</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Onay bekleyen süreçleri inceleyin.
            </p>
          </div>
          {counts.bekleyen > 0 && (
            <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-black">
              {counts.bekleyen}
            </span>
          )}
          <span className="text-gray-300 text-2xl">›</span>
        </Link>

        <Link
          href="/akademi/stajyerler"
          className="bg-white border border-gray-100 rounded-3xl p-4 flex items-center gap-4 hover:shadow-md transition shadow-sm"
        >
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-2xl shrink-0">
            👥
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#1C3FAA]">Aktif Stajyerler</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Devam eden stajları listeleyin.
            </p>
          </div>
          <span className="text-gray-300 text-2xl">›</span>
        </Link>
      </div>
    </div>
  );
}
