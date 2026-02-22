"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ProfilPage() {
  const [formData, setFormData] = useState({
    adSoyad: "",
    bolum: "",
    gano: "",
    tel: "",
    cinsiyet: "MALE",
    sinif: "1",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Mevcut verileri çekme
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        const docRef = doc(db, "kullanicilar", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as any);
        }
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Doğrulamalar (Validation)
    if (parseFloat(formData.gano) > 4 || parseFloat(formData.gano) < 0) {
      return alert("Hata: GANO 0.00 ile 4.00 arasında olmalıdır.");
    }
    if (formData.tel.length < 10) {
      return alert("Hata: Geçerli bir telefon numarası giriniz.");
    }

    setLoading(true);
    try {
      const userRef = doc(db, "kullanicilar", auth.currentUser!.uid);
      await updateDoc(userRef, formData);
      alert("Profiliniz başarıyla güncellendi! ✅");
    } catch (error) {
      alert("Güncelleme sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading)
    return (
      <div className="p-10 text-center text-black">Profil yükleniyor...</div>
    );

  return (
    <div className="max-w-3xl mx-auto p-6 text-black">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profil Ayarlarım</h1>
        <p className="text-gray-500 mt-2">
          Staj başvurularında görünecek kişisel bilgilerini buradan
          düzenleyebilirsin.
        </p>
      </header>

      <form
        onSubmit={handleUpdate}
        className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ad Soyad */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Ad Soyad
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.adSoyad}
              onChange={(e) =>
                setFormData({ ...formData, adSoyad: e.target.value })
              }
              required
            />
          </div>

          {/* Bölüm */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Bölüm
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.bolum}
              onChange={(e) =>
                setFormData({ ...formData, bolum: e.target.value })
              }
              required
            />
          </div>

          {/* GANO */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              GANO (Örn: 3.50)
            </label>
            <input
              type="number"
              step="0.01"
              max="4"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.gano}
              onChange={(e) =>
                setFormData({ ...formData, gano: e.target.value })
              }
              required
            />
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Telefon Numarası
            </label>
            <input
              type="tel"
              placeholder="05xxxxxxxxx"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.tel}
              onChange={(e) =>
                setFormData({ ...formData, tel: e.target.value })
              }
              required
            />
          </div>

          {/* Sınıf Seçimi */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Sınıf
            </label>
            <select
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
              value={formData.sinif}
              onChange={(e) =>
                setFormData({ ...formData, sinif: e.target.value })
              }
            >
              <option value="1">1. Sınıf</option>
              <option value="2">2. Sınıf</option>
              <option value="3">3. Sınıf</option>
              <option value="4">4. Sınıf</option>
              <option value="4">Mezun</option>
            </select>
          </div>

          {/* Cinsiyet */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Cinsiyet
            </label>
            <select
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
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

        <div className="pt-4 border-t border-gray-50 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:bg-blue-300"
          >
            {loading ? "Güncelleniyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
