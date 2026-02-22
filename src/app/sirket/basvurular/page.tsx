"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function SirketBasvurular() {
  const [basvurular, setBasvurular] = useState<any[]>([]);
  const [tab, setTab] = useState("BEKLIYOR");

  useEffect(() => {
    const q = query(
      collection(db, "basvurular"),
      where("sirketId", "==", auth.currentUser?.uid),
    );
    return onSnapshot(q, (sn) =>
      setBasvurular(sn.docs.map((d) => ({ id: d.id, ...d.data() }))),
    );
  }, []);

  const handleKarar = async (id: string, karar: string) => {
    await updateDoc(doc(db, "basvurular", id), { durum: karar });
    alert("İşlem tamamlandı.");
  };

  const filtrelenmis = basvurular.filter((b) => b.durum === tab);

  return (
    <div className="text-black">
      <h1 className="text-3xl font-bold mb-8 italic text-blue-900">
        Başvuru Yönetimi 📥
      </h1>

      {/* Tablar */}
      <div className="flex space-x-4 mb-8 border-b pb-4">
        {["BEKLIYOR", "SIRKET_ONAYLADI", "REDDEDILDI"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-bold transition ${tab === t ? "text-blue-600 border-b-4 border-blue-600" : "text-gray-400"}`}
          >
            {t.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtrelenmis.map((b) => (
          <div
            key={b.id}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {b.ogrenciEmail}
                </h3>
                <p className="text-blue-600 text-sm font-semibold">
                  {b.ilanBaslik}
                </p>
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-6 italic">
              "{b.motivasyon}"
            </p>

            {tab === "BEKLIYOR" && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleKarar(b.id, "REDDEDILDI")}
                  className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl font-bold"
                >
                  Reddet
                </button>
                <button
                  onClick={() => handleKarar(b.id, "SIRKET_ONAYLADI")}
                  className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold shadow-md"
                >
                  Onayla
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
