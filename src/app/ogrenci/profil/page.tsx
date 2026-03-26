"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface ProfilData {
  adSoyad: string;
  bolum: string;
  gano: string;
  tel: string;
  cinsiyet: string;
  sinif: string;
  okul: string;
  ogrenciNo: string;
  adres: string;
  yetenekler: string[];
}

const YETENEK_ONERILERI = [
  "Python", "JavaScript", "React", "Java", "C++", "SQL",
  "AutoCAD", "Excel", "Tasarım", "İletişim", "Takım Çalışması",
];

export default function ProfilPage() {
  const [formData, setFormData] = useState<ProfilData>({
    adSoyad: "",
    bolum: "",
    gano: "",
    tel: "",
    cinsiyet: "MALE",
    sinif: "1",
    okul: "",
    ogrenciNo: "",
    adres: "",
    yetenekler: [],
  });
  const [yeniYetenek, setYeniYetenek] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        const snap = await getDoc(doc(db, "kullanicilar", auth.currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            adSoyad: data.adSoyad || "",
            bolum: data.bolum || "",
            gano: data.gano || "",
            tel: data.tel || "",
            cinsiyet: data.cinsiyet || "MALE",
            sinif: data.sinif || "1",
            okul: data.okul || "",
            ogrenciNo: data.ogrenciNo || "",
            adres: data.adres || "",
            yetenekler: data.yetenekler || [],
          });
        }
      } finally {
        setInitialLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const addYetenek = (yetenek: string) => {
    const trimmed = yetenek.trim();
    if (!trimmed || formData.yetenekler.includes(trimmed)) return;
    setFormData((prev) => ({ ...prev, yetenekler: [...prev.yetenekler, trimmed] }));
    setYeniYetenek("");
  };

  const removeYetenek = (y: string) =>
    setFormData((prev) => ({ ...prev, yetenekler: prev.yetenekler.filter((x) => x !== y) }));

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(formData.gano) > 4 || parseFloat(formData.gano) < 0)
      return alert("GANO 0.00 ile 4.00 arasında olmalıdır.");
    if (formData.tel.length > 0 && formData.tel.length < 10)
      return alert("Geçerli bir telefon numarası giriniz.");

    setLoading(true);
    try {
      await updateDoc(doc(db, "kullanicilar", auth.currentUser!.uid), { ...formData });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      alert("Güncelleme sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading)
    return <div className="p-10 text-center text-gray-400">Profil yükleniyor...</div>;

  return (
    <div className="text-black">
      <div className="mb-8">
        <p className="text-gray-400 text-sm font-medium">Öğrenci Paneli</p>
        <h1 className="text-3xl font-black text-[#1C3FAA]">Profilim</h1>
        <p className="text-gray-400 text-sm mt-1">Staj başvurularında görünecek bilgilerini düzenle.</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-xl">✅</span>
          <p className="text-green-700 font-bold text-sm">Profil güncellendi!</p>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-5">
        {/* Kişisel Bilgiler */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-[#1C3FAA] mb-4">Kişisel Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Ad Soyad</label>
              <input type="text" value={formData.adSoyad} required
                onChange={(e) => setFormData({ ...formData, adSoyad: e.target.value })}
                className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Telefon</label>
              <input type="tel" value={formData.tel} placeholder="05xxxxxxxxx"
                onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Cinsiyet</label>
              <select value={formData.cinsiyet}
                onChange={(e) => setFormData({ ...formData, cinsiyet: e.target.value })}
                className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] bg-white transition">
                <option value="MALE">Erkek</option>
                <option value="FEMALE">Kadın</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Adres</label>
              <input type="text" value={formData.adres} placeholder="Şehir, İlçe"
                onChange={(e) => setFormData({ ...formData, adres: e.target.value })}
                className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition" />
            </div>
          </div>
        </div>

        {/* Akademik Bilgiler */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-[#1C3FAA] mb-4">Akademik Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Okul</label>
              <input type="text" value={formData.okul} placeholder="Üniversite adı"
                onChange={(e) => setFormData({ ...formData, okul: e.target.value })}
                className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Bölüm</label>
              <input type="text" value={formData.bolum} required
                onChange={(e) => setFormData({ ...formData, bolum: e.target.value })}
                className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Öğrenci No</label>
              <input type="text" value={formData.ogrenciNo} placeholder="2021xxxxxx"
                onChange={(e) => setFormData({ ...formData, ogrenciNo: e.target.value })}
                className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">GANO</label>
              <input type="number" step="0.01" max="4" min="0" value={formData.gano}
                onChange={(e) => setFormData({ ...formData, gano: e.target.value })}
                className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Sınıf</label>
              <select value={formData.sinif}
                onChange={(e) => setFormData({ ...formData, sinif: e.target.value })}
                className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] bg-white transition">
                <option value="1">1. Sınıf</option>
                <option value="2">2. Sınıf</option>
                <option value="3">3. Sınıf</option>
                <option value="4">4. Sınıf</option>
                <option value="Mezun">Mezun</option>
              </select>
            </div>
          </div>
        </div>

        {/* Yetenekler */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-black text-[#1C3FAA] mb-3">Yetenekler</h2>
          {formData.yetenekler.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.yetenekler.map((y) => (
                <span key={y}
                  className="bg-blue-50 text-[#2F6FED] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  {y}
                  <button type="button" onClick={() => removeYetenek(y)} className="text-blue-300 hover:text-red-400 transition">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={yeniYetenek}
              onChange={(e) => setYeniYetenek(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addYetenek(yeniYetenek); } }}
              placeholder="Yetenek ekle..."
              className="flex-1 p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#2F6FED] transition"
            />
            <button type="button" onClick={() => addYetenek(yeniYetenek)}
              className="px-4 bg-[#2F6FED] text-white font-bold rounded-xl text-sm">
              Ekle
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {YETENEK_ONERILERI.filter((y) => !formData.yetenekler.includes(y)).map((y) => (
              <button key={y} type="button" onClick={() => addYetenek(y)}
                className="bg-gray-50 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#2F6FED] hover:text-[#2F6FED] transition">
                + {y}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#2F6FED] text-white font-black rounded-3xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </form>
    </div>
  );
}
