"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Ilan } from "@/types";
import Link from "next/link";

export default function OgrenciHome() {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);

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

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Geleceğini Keşfet 👋
        </h1>
        <p className="text-gray-500 mt-2">
          Senin için en uygun staj ilanlarını listeledik.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ilanlar.map((ilan: any) => (
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
              <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-bold">
                {ilan.sehir}
              </span>
            </div>
            <Link
              href={`/ogrenci/ilanlar/${ilan.id}`}
              className="w-full block text-center py-2 bg-gray-50 text-gray-700 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition"
            >
              Detayları Gör
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
