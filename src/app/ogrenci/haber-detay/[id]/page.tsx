"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface HaberDetay {
  id: string;
  title: string;
  description: string;
  colorHex?: string;
  imageUrl?: string;
  type?: string;
}

export default function HaberDetayPage() {
  const { id } = useParams();
  const router = useRouter();
  const [haber, setHaber] = useState<HaberDetay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "admin_contents", id as string)).then((snap) => {
      if (snap.exists()) setHaber({ id: snap.id, ...snap.data() } as HaberDetay);
      setLoading(false);
    });
  }, [id]);

  if (loading)
    return <div className="p-10 text-center text-gray-400">Yükleniyor...</div>;

  if (!haber)
    return (
      <div className="p-10 text-center text-gray-400">
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-bold">İçerik bulunamadı.</p>
        <button onClick={() => router.back()} className="mt-4 text-[#2F6FED] font-bold text-sm hover:underline">
          Geri Dön
        </button>
      </div>
    );

  return (
    <div className="text-black max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#2F6FED] font-bold text-sm mb-6 hover:opacity-70 transition"
      >
        ← Geri
      </button>

      {/* Hero */}
      {haber.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={haber.imageUrl}
          alt={haber.title}
          className="w-full h-56 object-cover rounded-3xl mb-6"
        />
      ) : (
        <div
          className="w-full h-40 rounded-3xl mb-6 flex items-center justify-center text-5xl"
          style={{ backgroundColor: (haber.colorHex || "#2F6FED") + "20" }}
        >
          📰
        </div>
      )}

      {/* Tür etiketi */}
      {haber.type && (
        <span
          className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-xl mb-4 inline-block"
          style={{ backgroundColor: (haber.colorHex || "#2F6FED") + "20", color: haber.colorHex || "#2F6FED" }}
        >
          {haber.type}
        </span>
      )}

      <h1 className="text-3xl font-black text-[#1C3FAA] mb-4 leading-tight">
        {haber.title}
      </h1>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
          {haber.description}
        </p>
      </div>
    </div>
  );
}
