"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, auth, storage } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Ilan } from "@/types";

interface OgrenciProfil {
  adSoyad?: string;
  bolum?: string;
  sinif?: string;
  gano?: string;
  telefon?: string;
  email?: string;
}

export default function IlanDetayPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ilan, setIlan] = useState<Ilan | null>(null);
  const [profil, setProfil] = useState<OgrenciProfil>({});
  const [motivasyon, setMotivasyon] = useState("");
  const [uygunlukTarihi, setUygunlukTarihi] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "ilanlar", id as string)).then((snap) => {
      if (snap.exists()) setIlan({ id: snap.id, ...snap.data() } as Ilan);
    });
  }, [id]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !id) return;

    // Profil bilgilerini çek (kullanicilar koleksiyonundan)
    getDoc(doc(db, "kullanicilar", user.uid)).then((snap) => {
      if (snap.exists()) setProfil(snap.data() as OgrenciProfil);
    });

    // Daha önce başvurdu mu?
    const basvuruId = `${id}_${user.uid}`;
    getDoc(doc(db, "basvurular", basvuruId)).then((snap) => {
      setAlreadyApplied(snap.exists());
    });
  }, [id]);

  const handleBasvuru = async () => {
    if (!motivasyon.trim())
      return alert("Lütfen motivasyon notunuzu yazın.");
    if (!uygunlukTarihi.trim())
      return alert("Lütfen uygunluk tarihinizi girin.");

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const basvuruId = `${id}_${user.uid}`;

      // CV yükleme
      let cvUrl: string | null = null;
      if (cvFile) {
        const storageRef = ref(
          storage,
          `basvuru_cvleri/${user.uid}_${Date.now()}.pdf`,
        );
        await uploadBytes(storageRef, cvFile);
        cvUrl = await getDownloadURL(storageRef);
      }

      await setDoc(doc(db, "basvurular", basvuruId), {
        basvuruId,
        ilanId: id,
        ilanBaslik: ilan?.baslik,
        firmaAdi: ilan?.firmaAdi,
        sirketId: ilan?.sirketId,
        ogrenciId: user.uid,
        adSoyad: profil.adSoyad || "",
        email: profil.email || user.email || "",
        telefon: profil.telefon || "",
        bolum: profil.bolum || "",
        sinif: profil.sinif || "",
        gano: profil.gano || "",
        motivasyonNotu: motivasyon,
        uygunlukTarihi,
        cvUrl,
        durum: "BEKLIYOR",
        basvuruTarihi: serverTimestamp(),
      });

      alert("Başvurunuz başarıyla iletildi! 🚀");
      router.push("/ogrenci/basvurular");
    } catch (e) {
      console.error(e);
      alert("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (!ilan)
    return (
      <div className="p-10 text-center text-gray-400">
        İlan detayları yükleniyor...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 text-black">
      {/* Üst Kısım */}
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
        {/* Sol: İş Tanımı */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <span className="mr-3">📝</span> İş Tanımı ve Detaylar
          </h2>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
            {ilan.aciklama}
          </div>
        </div>

        {/* Sağ: Başvuru Formu */}
        <div className="bg-blue-600 p-8 rounded-3xl shadow-xl text-white h-fit sticky top-6">
          <h2 className="text-2xl font-bold mb-4">
            {alreadyApplied ? "Başvurunuz Gönderildi ✅" : "Hemen Başvur"}
          </h2>

          {alreadyApplied ? (
            <p className="text-blue-100 text-sm">
              Bu ilana daha önce başvurdunuz. Başvuru durumunuzu Başvurularım
              sayfasından takip edebilirsiniz.
            </p>
          ) : (
            <>
              <p className="text-blue-100 mb-5 text-sm">
                Profil bilgileriniz otomatik doldurulur. Eksikleri tamamlayarak
                başvurun.
              </p>

              {/* Profil özet */}
              {(profil.adSoyad || profil.bolum) && (
                <div className="bg-white/10 rounded-2xl p-3 mb-4 text-xs space-y-1">
                  {profil.adSoyad && (
                    <p>
                      👤 <span className="font-bold">{profil.adSoyad}</span>
                    </p>
                  )}
                  {profil.bolum && (
                    <p>
                      🎓{" "}
                      <span className="font-bold">
                        {profil.bolum} — {profil.sinif}. Sınıf
                      </span>
                    </p>
                  )}
                  {profil.gano && (
                    <p>
                      📊 <span className="font-bold">GANO: {profil.gano}</span>
                    </p>
                  )}
                </div>
              )}

              <textarea
                className="w-full p-4 rounded-2xl text-black mb-3 h-32 outline-none focus:ring-4 focus:ring-blue-400 transition text-sm resize-none"
                placeholder="Motivasyon notunuz..."
                value={motivasyon}
                onChange={(e) => setMotivasyon(e.target.value)}
              />

              <input
                type="text"
                className="w-full p-3.5 rounded-2xl text-black mb-3 outline-none focus:ring-4 focus:ring-blue-400 transition text-sm"
                placeholder="Uygunluk tarihi (Örn: 01.07 - 31.08)"
                value={uygunlukTarihi}
                onChange={(e) => setUygunlukTarihi(e.target.value)}
              />

              {/* CV Yükleme */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-3 rounded-2xl mb-4 text-sm font-semibold border-2 border-dashed transition ${
                  cvFile
                    ? "border-green-300 bg-green-50/10 text-green-100"
                    : "border-white/30 text-white/70 hover:border-white/60"
                }`}
              >
                {cvFile ? `✅ ${cvFile.name}` : "📎 CV Yükle (PDF)"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              />

              <button
                onClick={handleBasvuru}
                disabled={loading}
                className="w-full bg-white text-blue-600 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition shadow-lg disabled:bg-blue-300"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                    Gönderiliyor...
                  </span>
                ) : (
                  "Başvuruyu Tamamla"
                )}
              </button>
            </>
          )}

          <p className="text-[10px] text-center mt-4 text-blue-200 uppercase tracking-widest font-bold">
            İnteraktif Staj Yönetim Sistemi
          </p>
        </div>
      </div>
    </div>
  );
}
