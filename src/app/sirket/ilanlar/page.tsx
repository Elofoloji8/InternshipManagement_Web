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
} from "firebase/firestore";
import Link from "next/link";

export default function SirketIlanlar() {
  const [ilanlar, setIlanlar] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "ilanlar"),
      where("sirketId", "==", auth.currentUser?.uid),
    );
    return onSnapshot(q, (sn) =>
      setIlanlar(sn.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
  }, []);

  const handleSil = async (id: string) => {
    if (confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, "ilanlar", id));
    }
  };

  return (
    <div className="text-black">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900 italic">
          Yayınladığım İlanlar 💼
        </h1>
        <Link
          href="/sirket/ilan-ekle"
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
        >
          + Yeni İlan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ilanlar.map((ilan) => (
          <div
            key={ilan.id}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {ilan.baslik}
                </h3>
                <p className="text-sm text-gray-400 font-medium">
                  {ilan.alan} • {ilan.sehir}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold ${ilan.aktif ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
              >
                {ilan.aktif ? "YAYINDA" : "PASİF"}
              </span>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition">
                Düzenle
              </button>
              <button
                onClick={() => handleSil(ilan.id)}
                className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
