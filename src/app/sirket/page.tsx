"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";

function QuickCard({
  title,
  desc,
  icon,
  bg,
  href,
}: {
  title: string;
  desc: string;
  icon: string;
  bg: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-gray-100 rounded-3xl p-4 flex items-center gap-4 hover:shadow-md transition shadow-sm"
    >
      <div
        className={`w-14 h-14 ${bg} rounded-2xl flex items-center justify-center text-2xl shrink-0`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#1C3FAA] text-base">{title}</p>
        <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <span className="text-gray-300 text-2xl shrink-0">›</span>
    </Link>
  );
}

export default function SirketDashboard() {
  const [counts, setCounts] = useState({
    aktifIlanlar: 0,
    toplamBasvuru: 0,
    bekleyen: 0,
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const qAktif = query(
      collection(db, "ilanlar"),
      where("sirketId", "==", user.uid),
      where("aktif", "==", true),
    );
    const unsubAktif = onSnapshot(qAktif, (sn) =>
      setCounts((prev) => ({ ...prev, aktifIlanlar: sn.size })),
    );

    const qToplam = query(
      collection(db, "basvurular"),
      where("sirketId", "==", user.uid),
    );
    const unsubToplam = onSnapshot(qToplam, (sn) =>
      setCounts((prev) => ({ ...prev, toplamBasvuru: sn.size })),
    );

    const qBekleyen = query(
      collection(db, "basvurular"),
      where("sirketId", "==", user.uid),
      where("durum", "==", "BEKLIYOR"),
    );
    const unsubBekleyen = onSnapshot(qBekleyen, (sn) =>
      setCounts((prev) => ({ ...prev, bekleyen: sn.size })),
    );

    return () => {
      unsubAktif();
      unsubToplam();
      unsubBekleyen();
    };
  }, []);

  return (
    <div className="text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-gray-400 text-sm font-medium">Yönetim Paneli 👋</p>
          <h1 className="text-3xl font-black text-[#1C3FAA]">Şirket Merkezi</h1>
        </div>
        <div className="w-11 h-11 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-xl">
          🏢
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-[#2F6FED] rounded-3xl p-6 mb-8 shadow-lg">
        <p className="text-white/80 text-sm font-medium">Aktif Başvurular</p>
        <p className="text-white text-4xl font-bold mt-1">
          {counts.bekleyen} Yeni Aday
        </p>
        <div className="mt-5">
          <Link
            href="/sirket/basvurular"
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl inline-block transition"
          >
            Hemen İncele
          </Link>
        </div>
      </div>

      {/* Pending Actions */}
      <h2 className="text-lg font-bold text-[#1C3FAA] mb-3">
        Bekleyen Aksiyonlar
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 mb-8 -mx-1 px-1">
        <div className="shrink-0 w-64 bg-orange-50 border border-orange-100 rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg shrink-0">
            ⏳
          </div>
          <div>
            <p className="text-orange-500 font-black text-sm">
              {counts.bekleyen} Yeni İşlem
            </p>
            <p className="text-gray-500 text-xs font-medium">
              Değerlendirme Bekleyen
            </p>
          </div>
        </div>
        <div className="shrink-0 w-64 bg-blue-50 border border-blue-100 rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg shrink-0">
            📊
          </div>
          <div>
            <p className="text-[#2F6FED] font-black text-sm">
              {counts.aktifIlanlar} Aktif İlan
            </p>
            <p className="text-gray-500 text-xs font-medium">
              Yayındaki İlanlar
            </p>
          </div>
        </div>
        <div className="shrink-0 w-64 bg-green-50 border border-green-100 rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg shrink-0">
            📥
          </div>
          <div>
            <p className="text-green-600 font-black text-sm">
              {counts.toplamBasvuru} Toplam
            </p>
            <p className="text-gray-500 text-xs font-medium">
              Tüm Başvurular
            </p>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <h2 className="text-lg font-bold text-[#1C3FAA] mb-4">Hızlı Erişim</h2>
      <div className="space-y-4">
        <QuickCard
          title="İlanlarımı Yönet"
          desc="İlanlarını düzenle, aktif/pasif yap veya sil."
          icon="💼"
          bg="bg-blue-50"
          href="/sirket/ilanlar"
        />
        <QuickCard
          title="Yeni İlan Yayınla"
          desc="Yeni yeteneklere ulaşmak için ilan oluştur."
          icon="➕"
          bg="bg-green-50"
          href="/sirket/ilan-ekle"
        />
        <QuickCard
          title="Başvuruları İncele"
          desc="Gelen adayları değerlendir ve karar ver."
          icon="📋"
          bg="bg-orange-50"
          href="/sirket/basvurular"
        />
      </div>

      {/* Info card */}
      <div className="mt-8 bg-gray-50/80 border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-gray-400 text-lg shrink-0">ℹ️</span>
        <p className="text-gray-500 text-xs leading-relaxed">
          Yardıma mı ihtiyacınız var? Destek ekibiyle iletişime geçin.
        </p>
      </div>
    </div>
  );
}
