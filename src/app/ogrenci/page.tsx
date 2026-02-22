"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Ilan } from "@/types";
import Link from "next/link";

export default function OgrenciHome() {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "ilanlar"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Ilan[];

      setIlanlar(data);
    });

    return () => unsubscribe();
  }, []);

  // Arama filtresi: Başlık, Alan veya Şehir içinde arama yapar
  const filtrelenmişIlanlar = ilanlar.filter(
    (ilan) =>
      ilan.baslik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ilan.alan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ilan.sehir?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* HEADER */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Geleceğini Keşfet 👋
        </h1>
        <p className="text-gray-500 mt-2">
          Senin için en uygun staj ilanlarını listeledik.
        </p>
      </header>

      {/* 1. ARAMA VE FİLTRELEME */}
      <div className="relative mt-6 mb-8">
        <input
          type="text"
          placeholder="Pozisyon, alan veya şehir ara..."
          className="w-full p-4 pl-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="absolute left-4 top-4 text-xl">🔍</span>
      </div>

      {/* 3. BOŞ DURUM GÖRÜNÜMÜ (EmptyStateView) */}
      {filtrelenmişIlanlar.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
          <span className="text-6xl mb-4 block">🚀</span>
          <p className="text-gray-500 text-lg font-medium">
            {searchTerm
              ? "Aramanızla eşleşen ilan bulunamadı."
              : "Henüz bir staj ilanı yayınlanmamış."}
          </p>
        </div>
      )}

      {/* İLAN LİSTESİ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtrelenmişIlanlar.map((ilan: Ilan) => (
          <div
            key={ilan.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-blue-800">
                  {ilan.baslik}
                </h3>
                <p className="text-gray-500 font-medium">{ilan.alan}</p>
              </div>
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                {ilan.sehir}
              </span>
            </div>

            {/* ŞİRKET BİLGİSİ - firmaAdi ile güncellendi */}
            <div className="flex items-center mt-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold mr-3 shadow-md">
                {ilan.firmaAdi ? ilan.firmaAdi.charAt(0).toUpperCase() : "E"}
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-gray-800 font-bold leading-none">
                  {ilan.firmaAdi || "İsimsiz Firma"}
                </p>
                <div className="flex items-center mt-1">
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mr-2">
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
              className="w-full block text-center py-2.5 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition duration-200"
            >
              Detayları Gör
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
