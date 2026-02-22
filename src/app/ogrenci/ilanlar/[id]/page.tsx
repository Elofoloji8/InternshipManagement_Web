"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { Ilan } from "@/types";

export default function IlanDetayPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ilan, setIlan] = useState<Ilan | null>(null);
  const [motivasyon, setMotivasyon] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getIlan = async () => {
      if (!id) return;
      const docRef = doc(db, "ilanlar", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setIlan({ id: docSnap.id, ...docSnap.data() } as Ilan);
      }
    };
    getIlan();
  }, [id]);

  const handleBasvuru = async () => {
    if (!motivasyon.trim())
      return alert("Lütfen kendinizi tanıtan kısa bir motivasyon notu yazın.");

    setLoading(true);
    try {
      // Mobildeki basvuruGonder fonksiyonunun web karşılığı
      await addDoc(collection(db, "basvurular"), {
        ilanId: id,
        ilanBaslik: ilan?.baslik,
        firmaAdi: ilan?.firmaAdi, // Veritabanındaki gerçek alan
        ogrenciId: auth.currentUser?.uid,
        ogrenciEmail: auth.currentUser?.email,
        motivasyon: motivasyon,
        durum: "BEKLIYOR", // Başlangıç durumu
        tarih: serverTimestamp(),
      });

      alert("Başvurunuz başarıyla iletildi! 🚀");
      router.push("/ogrenci/basvurular"); // Başvurularım sayfasına yönlendir
    } catch (e) {
      console.error("Başvuru hatası:", e);
      alert("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (!ilan)
    return <div className="p-10 text-center">İlan detayları yükleniyor...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 text-black">
      {/* Üst Kısım: Başlık ve Rozetler */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
            {ilan.stajTuru}
          </span>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
            {ilan.calismaSekli}
          </span>
        </div>

        <h1 className="text-4xl font-extrabold text-blue-900 mb-2">
          {ilan.baslik}
        </h1>
        <p className="text-xl text-gray-500 font-medium">
          {ilan.firmaAdi} • {ilan.sehir}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon: İş Tanımı */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-3">📝</span> İş Tanımı ve Detaylar
          </h2>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
            {ilan.aciklama}
          </div>
        </div>

        {/* Sağ Kolon: Başvuru Formu */}
        <div className="bg-blue-600 p-8 rounded-3xl shadow-xl text-white h-fit sticky top-6">
          <h2 className="text-2xl font-bold mb-4">Hemen Başvur</h2>
          <p className="text-blue-100 mb-6 text-sm">
            Bu staj ilanı için heyecanlı mısın? Şirkete neden seni seçmeleri
            gerektiğini kısaca açıkla.
          </p>

          <textarea
            className="w-full p-4 rounded-2xl text-black mb-4 h-40 outline-none focus:ring-4 focus:ring-blue-400 transition"
            placeholder="Motivasyon mektubunuz..."
            value={motivasyon}
            onChange={(e) => setMotivasyon(e.target.value)}
          />

          <button
            onClick={handleBasvuru}
            disabled={loading}
            className="w-full bg-white text-blue-600 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition shadow-lg disabled:bg-blue-300"
          >
            {loading ? "Gönderiliyor..." : "Başvuruyu Tamamla"}
          </button>

          <p className="text-[10px] text-center mt-4 text-blue-200 uppercase tracking-widest font-bold">
            İnteraktif Staj Yönetim Sistemi
          </p>
        </div>
      </div>
    </div>
  );
}
