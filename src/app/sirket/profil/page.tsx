"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function SirketProfil() {
  const [formData, setFormData] = useState({
    firmaAdi: "",
    yetkiliAdSoyad: "",
    telefon: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSirket = async () => {
      const docSnap = await getDoc(
        doc(db, "sirket_profilleri", auth.currentUser?.uid || ""),
      );
      if (docSnap.exists()) setFormData(docSnap.data() as any);
    };
    fetchSirket();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(
        doc(db, "sirket_profilleri", auth.currentUser!.uid),
        formData,
      );
      alert("Profil güncellendi! ✅");
    } catch (e) {
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-6 text-blue-900 italic">
        Şirket Profili 👤
      </h1>
      <form
        onSubmit={handleUpdate}
        className="bg-white p-8 rounded-3xl shadow-sm border space-y-6"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-2 border-4 border-white shadow-md">
            🏢
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase italic">
            Şirket Logosu
          </p>
        </div>

        <div className="space-y-4">
          <input
            value={formData.firmaAdi}
            placeholder="Firma Adı"
            className="w-full p-4 border rounded-2xl"
            onChange={(e) =>
              setFormData({ ...formData, firmaAdi: e.target.value })
            }
          />
          <input
            value={formData.yetkiliAdSoyad}
            placeholder="Yetkili Ad Soyad"
            className="w-full p-4 border rounded-2xl"
            onChange={(e) =>
              setFormData({ ...formData, yetkiliAdSoyad: e.target.value })
            }
          />
          <input
            value={formData.telefon}
            placeholder="Telefon"
            className="w-full p-4 border rounded-2xl"
            onChange={(e) =>
              setFormData({ ...formData, telefon: e.target.value })
            }
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition"
        >
          {loading ? "Kaydediliyor..." : "Bilgileri Güncelle"}
        </button>
      </form>
    </div>
  );
}
