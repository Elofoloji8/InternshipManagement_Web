"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { Ilan } from "@/types";

export default function KaydedilenIlanlarPage() {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(doc(db, "kaydedilen_ilanlar", user.uid), async (snap) => {
      const ids: string[] = snap.data()?.ilanIds || [];
      setSavedIds(ids);
      if (ids.length === 0) {
        setIlanlar([]);
        setLoading(false);
        return;
      }
      // Batch fetch ilanlar
      const fetched: Ilan[] = [];
      for (const id of ids) {
        const ilanSnap = await getDoc(doc(db, "ilanlar", id));
        if (ilanSnap.exists()) {
          fetched.push({ id: ilanSnap.id, ...ilanSnap.data() } as Ilan);
        }
      }
      setIlanlar(fetched);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleRemove = async (ilanId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    const updated = savedIds.filter((id) => id !== ilanId);
    setSavedIds(updated);
    setIlanlar((prev) => prev.filter((i) => i.id !== ilanId));
    await updateDoc(doc(db, "kaydedilen_ilanlar", user.uid), { ilanIds: updated });
  };

  if (loading)
    return <div className="p-10 text-center text-gray-400">Yükleniyor...</div>;

  return (
    <div className="text-black">
      <div className="mb-8">
        <p className="text-gray-400 text-sm font-medium">Öğrenci Paneli</p>
        <h1 className="text-3xl font-black text-[#1C3FAA]">Kaydedilenler</h1>
        <p className="text-gray-400 text-sm mt-1">Kaydettiğiniz staj ilanları</p>
      </div>

      {ilanlar.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-dashed text-center">
          <p className="text-4xl mb-3">🔖</p>
          <p className="font-bold text-[#1C3FAA]">Henüz kayıt yok</p>
          <p className="text-gray-400 text-sm mt-1">
            İlan kartlarındaki 🔖 ikonuna tıklayarak ilanları kaydedebilirsiniz.
          </p>
          <Link href="/ogrenci"
            className="inline-block mt-4 bg-[#2F6FED] text-white px-6 py-3 rounded-2xl font-bold text-sm">
            İlanları Keşfet
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ilanlar.map((ilan) => (
            <div key={ilan.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2F6FED] to-[#1C3FAA] rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0">
                {ilan.firmaAdi?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[#1C3FAA] truncate">{ilan.baslik}</p>
                <p className="text-gray-500 text-xs font-medium mt-0.5">{ilan.firmaAdi}</p>
                <div className="flex gap-1.5 mt-1.5">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    {ilan.sehir}
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    {ilan.calismaSekli}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Link href={`/ogrenci/ilanlar/${ilan.id}`}
                  className="bg-[#2F6FED] text-white text-xs font-bold px-3 py-2 rounded-xl text-center">
                  Başvur
                </Link>
                <button onClick={() => handleRemove(ilan.id)}
                  className="bg-red-50 text-red-500 text-xs font-bold px-3 py-2 rounded-xl">
                  Kaldır
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
