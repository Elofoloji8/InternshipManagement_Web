"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ProfilPage() {
  const [formData, setFormData] = useState({
    adSoyad: "",
    bolum: "",
    sinif: "1",
    gano: "",
    email: "",
    telefon: "",
    cinsiyet: "MALE",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      const docSnap = await getDoc(
        doc(db, "kullanicilar", auth.currentUser.uid),
      );
      if (docSnap.exists()) setFormData(docSnap.data() as any);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "kullanicilar", auth.currentUser!.uid), formData, {
        merge: true,
      });
      alert("Profil güncellendi!");
    } catch (e) {
      alert("Hata oluştu");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
        Profil Bilgilerim
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Ad Soyad</label>
          <input
            type="text"
            className="w-full p-3 border rounded-xl text-black"
            value={formData.adSoyad}
            onChange={(e) =>
              setFormData({ ...formData, adSoyad: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Bölüm</label>
          <input
            type="text"
            className="w-full p-3 border rounded-xl text-black"
            value={formData.bolum}
            onChange={(e) =>
              setFormData({ ...formData, bolum: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">
            GANO (0.00 - 4.00)
          </label>
          <input
            type="number"
            step="0.01"
            max="4"
            className="w-full p-3 border rounded-xl text-black"
            value={formData.gano}
            onChange={(e) => setFormData({ ...formData, gano: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Cinsiyet</label>
          <select
            className="w-full p-3 border rounded-xl text-black"
            value={formData.cinsiyet}
            onChange={(e) =>
              setFormData({ ...formData, cinsiyet: e.target.value })
            }
          >
            <option value="MALE">Erkek</option>
            <option value="FEMALE">Kadın</option>
          </select>
        </div>
      </div>
      <button
        onClick={handleSave}
        className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
      >
        Bilgileri Kaydet
      </button>
    </div>
  );
}
