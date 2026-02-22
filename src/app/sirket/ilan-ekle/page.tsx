"use client";
import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function IlanEkle() {
  const [form, setForm] = useState({
    baslik: "",
    aciklama: "",
    alan: "",
    sehir: "",
    stajTuru: "Zorunlu",
    calismaSekli: "Ofis",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleYayinla = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Şirket profil bilgilerini al (Firma adı vb. için)
      const sirketDoc = await getDoc(doc(db, "sirket_profilleri", user.uid));
      const sirketData = sirketDoc.data();

      await addDoc(collection(db, "ilanlar"), {
        ...form,
        sirketId: user.uid,
        firmaAdi: sirketData?.firmaAdi || "İsimsiz Firma",
        sirketEmail: user.email,
        aktif: true,
        createdAt: serverTimestamp(),
      });

      alert("İlan başarıyla yayınlandı! 🚀");
      router.push("/sirket/ilanlar");
    } catch (e) {
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-6 text-blue-900 italic">
        Yeni İlan Oluştur ➕
      </h1>
      <form
        onSubmit={handleYayinla}
        className="bg-white p-8 rounded-3xl shadow-sm border space-y-6"
      >
        <input
          placeholder="İlan Başlığı"
          className="w-full p-4 border rounded-2xl"
          onChange={(e) => setForm({ ...form, baslik: e.target.value })}
          required
        />
        <textarea
          placeholder="İş Tanımı ve Detaylar"
          className="w-full p-4 border rounded-2xl h-40"
          onChange={(e) => setForm({ ...form, aciklama: e.target.value })}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Alan (Yazılım vb.)"
            className="p-4 border rounded-2xl"
            onChange={(e) => setForm({ ...form, alan: e.target.value })}
            required
          />
          <input
            placeholder="Şehir"
            className="p-4 border rounded-2xl"
            onChange={(e) => setForm({ ...form, sehir: e.target.value })}
            required
          />
        </div>

        <div className="space-y-3">
          <label className="font-bold text-gray-700">Staj Türü</label>
          <div className="flex gap-3">
            {["Zorunlu", "Gönüllü"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, stajTuru: t })}
                className={`px-6 py-2 rounded-full border transition ${form.stajTuru === t ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg"
        >
          {loading ? "Yayınlanıyor..." : "İlanı Yayınla"}
        </button>
      </form>
    </div>
  );
}
