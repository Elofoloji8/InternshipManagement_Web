"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";

export default function SirketDashboard() {
  const [counts, setCounts] = useState({ ilanlar: 0, basvurular: 0 });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // 1. Şirketin ilan sayısını çek
    const qIlan = query(
      collection(db, "ilanlar"),
      where("sirketId", "==", user.uid),
    );
    const unsubIlan = onSnapshot(qIlan, (sn) =>
      setCounts((prev) => ({ ...prev, ilanlar: sn.size })),
    );

    // 2. Şirkete gelen toplam beklemedeki başvuru sayısını çek
    const qBasvuru = query(
      collection(db, "basvurular"),
      where("sirketId", "==", user.uid),
      where("durum", "==", "BEKLIYOR"),
    );
    const unsubBasvuru = onSnapshot(qBasvuru, (sn) =>
      setCounts((prev) => ({ ...prev, basvurular: sn.size })),
    );

    return () => {
      unsubIlan();
      unsubBasvuru();
    };
  }, []);

  return (
    <div className="text-black">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-blue-900 italic uppercase tracking-tighter">
          Şirket Yönetim Paneli 🏢
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Hoş geldiniz, staj operasyonlarını buradan takip edebilirsiniz.
        </p>
      </header>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-bold uppercase mb-2">
            Aktif İlanlarınız
          </p>
          <p className="text-4xl font-black text-blue-600">{counts.ilanlar}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-sm font-bold uppercase mb-2">
            Bekleyen Başvurular
          </p>
          <p className="text-4xl font-black text-red-500">
            {counts.basvurular}
          </p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 text-gray-800">Hızlı Erişim</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/sirket/ilan-ekle"
          className="p-8 bg-blue-600 text-white rounded-3xl shadow-lg hover:bg-blue-700 transition flex flex-col items-center text-center"
        >
          <span className="text-4xl mb-4">➕</span>
          <span className="font-bold text-lg">Yeni İlan Yayınla</span>
          <span className="text-blue-100 text-sm mt-2">
            Potansiyel stajyerlerine hemen ulaş.
          </span>
        </Link>

        <Link
          href="/sirket/basvurular"
          className="p-8 bg-white text-gray-800 border-2 border-dashed border-gray-200 rounded-3xl hover:border-blue-300 transition flex flex-col items-center text-center"
        >
          <span className="text-4xl mb-4">📥</span>
          <span className="font-bold text-lg">Başvuruları İncele</span>
          <span className="text-gray-400 text-sm mt-2">
            Gelen adayların profil ve motivasyon mektuplarına bak.
          </span>
        </Link>
      </div>
    </div>
  );
}
