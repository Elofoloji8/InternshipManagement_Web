"use client";
import { useEffect, useRef, useState } from "react";
import { db, auth, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function ProfileInput({
  value,
  onChange,
  label,
  placeholder,
  icon,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder: string;
  icon: string;
  type?: string;
}) {
  return (
    <div className="mb-4">
      <label className="text-xs font-medium text-gray-500 mb-1 block">
        {label}
      </label>
      <div className="flex items-center border border-gray-200 rounded-2xl bg-white focus-within:border-[#2F6FED] transition overflow-hidden">
        <span className="px-3 text-base text-[#2F6FED]">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 py-3.5 pr-4 text-sm outline-none bg-transparent text-gray-800"
        />
      </div>
    </div>
  );
}

export default function SirketProfil() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firmaAdi, setFirmaAdi] = useState("");
  const [sektor, setSektor] = useState("");
  const [yetkiliAdSoyad, setYetkiliAdSoyad] = useState("");
  const [sirketEmail, setSirketEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [webSitesi, setWebSitesi] = useState("");
  const [hakkinda, setHakkinda] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Profil tamamlama hesabı
  const fields = [firmaAdi, yetkiliAdSoyad, sirketEmail, telefon, webSitesi, sektor, hakkinda];
  const filledCount = fields.filter((f) => f.trim() !== "").length;
  const hasLogo = !!logoUrl || !!previewUrl;
  const totalFields = fields.length + 1;
  const score = hasLogo ? filledCount + 1 : filledCount;
  const completion = Math.round((score / totalFields) * 100);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    getDoc(doc(db, "sirket_profilleri", user.uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setFirmaAdi(d.firmaAdi || "");
        setSektor(d.sektor || "");
        setYetkiliAdSoyad(d.yetkiliAdSoyad || "");
        setSirketEmail(d.email || user.email || "");
        setTelefon(d.telefon || "");
        setWebSitesi(d.webSitesi || "");
        setHakkinda(d.hakkinda || "");
        setLogoUrl(d.logoUrl || null);
      } else {
        setSirketEmail(user.email || "");
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmaAdi.trim()) return alert("Firma adı boş bırakılamaz!");
    if (telefon && telefon.replace(/\D/g, "").length < 10)
      return alert("Telefon numarası en az 10 hane olmalıdır!");
    if (hakkinda && hakkinda.length < 20)
      return alert("Hakkımızda yazısı çok kısa!");

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      let finalLogoUrl = logoUrl;
      if (selectedFile) {
        const storageRef = ref(storage, `sirket_logolari/${user.uid}.jpg`);
        await uploadBytes(storageRef, selectedFile);
        finalLogoUrl = await getDownloadURL(storageRef);
      }

      await setDoc(
        doc(db, "sirket_profilleri", user.uid),
        {
          firmaAdi,
          sektor,
          yetkiliAdSoyad,
          email: sirketEmail,
          telefon,
          webSitesi,
          hakkinda,
          logoUrl: finalLogoUrl,
          profilTamamlama: completion,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setLogoUrl(finalLogoUrl);
      setPreviewUrl(null);
      setSelectedFile(null);
      alert("Profil Güncellendi! ✨");
    } catch (err: unknown) {
      alert(`Hata: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const displayLogo = previewUrl || logoUrl;

  return (
    <form onSubmit={handleSave} className="max-w-2xl mx-auto text-black">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-gray-400 text-sm font-medium">Kurumsal Kimlik ⚙️</p>
          <h1 className="text-3xl font-black text-[#1C3FAA]">Profil Yönetimi</h1>
        </div>
        <div className="w-11 h-11 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-xl">
          ⚙️
        </div>
      </div>

      {/* Tamamlama Kartı */}
      <div className="bg-[#2F6FED] rounded-3xl p-6 mb-6 shadow-lg">
        <p className="text-white/80 text-sm font-medium">
          Profil Tamamlama Yüzdesi
        </p>
        <p className="text-white text-4xl font-bold mt-1">%{completion}</p>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-300 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Logo Yükleme */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-4 shadow-sm flex flex-col items-center">
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-28 h-28 rounded-full bg-blue-50 border-2 border-[#2F6FED]/30 flex items-center justify-center overflow-hidden hover:border-[#2F6FED] transition"
          >
            {displayLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayLogo}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl">📷</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-9 h-9 bg-[#2F6FED] rounded-full flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition text-sm"
          >
            ✏️
          </button>
        </div>
        <p className="text-sm font-bold text-[#1C3FAA]">Şirket Logosu</p>
        <p className="text-xs text-gray-400 mt-1">Tıklayarak değiştir</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Form Alanları */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-4 shadow-sm">
        <ProfileInput
          value={firmaAdi}
          onChange={setFirmaAdi}
          label="Firma Adı *"
          placeholder="Şirket adınız"
          icon="🏢"
        />
        <ProfileInput
          value={sektor}
          onChange={setSektor}
          label="Sektör"
          placeholder="Yazılım, Finans, Sağlık..."
          icon="🏷️"
        />
        <ProfileInput
          value={yetkiliAdSoyad}
          onChange={setYetkiliAdSoyad}
          label="Yetkili Ad Soyad"
          placeholder="Adınız ve soyadınız"
          icon="👤"
        />
        <ProfileInput
          value={sirketEmail}
          onChange={setSirketEmail}
          label="Şirket E-posta"
          placeholder="sirket@ornek.com"
          icon="✉️"
          type="email"
        />
        <ProfileInput
          value={telefon}
          onChange={setTelefon}
          label="Telefon"
          placeholder="0212 000 00 00"
          icon="📞"
          type="tel"
        />
        <ProfileInput
          value={webSitesi}
          onChange={setWebSitesi}
          label="Web Sitesi"
          placeholder="https://sirketiniz.com"
          icon="🌐"
          type="url"
        />

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Şirket Hakkında
          </label>
          <textarea
            value={hakkinda}
            onChange={(e) => setHakkinda(e.target.value)}
            placeholder="Şirketinizi tanıtın, öğrenciler bu metni görecek..."
            className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition resize-none h-32 text-gray-800"
          />
        </div>
      </div>

      {/* Kaydet Butonu */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-[#2F6FED] text-white font-extrabold text-base rounded-2xl hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Kaydediliyor...
          </span>
        ) : (
          "Değişiklikleri Kaydet"
        )}
      </button>
    </form>
  );
}
