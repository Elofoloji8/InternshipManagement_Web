"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

const STEPS = 3;

function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs text-gray-500 font-medium mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition border ${
              value === opt
                ? "bg-[#2F6FED] text-white border-[#2F6FED]"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#2F6FED]"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ModernInput({
  value,
  onChange,
  label,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition text-gray-800 bg-white"
      />
    </div>
  );
}

function PreviewModal({
  baslik,
  aciklama,
  alan,
  sehir,
  stajTuru,
  calismaSekli,
  onClose,
}: {
  baslik: string;
  aciklama: string;
  alan: string;
  sehir: string;
  stajTuru: string;
  calismaSekli: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-[#1C3FAA] mb-4">
          İlan Önizlemesi
        </h3>
        <p className="text-xl font-black text-[#1C3FAA]">
          {baslik || "Başlık Yok"}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {alan} • {sehir}
        </p>
        <div className="flex gap-2 mt-3">
          <span className="bg-blue-50 text-[#2F6FED] text-xs font-bold px-2 py-1 rounded-lg">
            {stajTuru}
          </span>
          <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded-lg">
            {calismaSekli}
          </span>
        </div>
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
            {aciklama || "Açıklama boş..."}
          </p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-[#2F6FED] text-white font-bold rounded-2xl hover:bg-blue-700 transition"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}

export default function IlanEkle() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [alan, setAlan] = useState("");
  const [sehir, setSehir] = useState("");
  const [arananYetenekler, setArananYetenekler] = useState("");
  const [minGano, setMinGano] = useState("");
  const [stajTuru, setStajTuru] = useState("Zorunlu");
  const [calismaSekli, setCalismaSekli] = useState("Ofis");

  // Taslak yükleme
  useEffect(() => {
    const loadDraft = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, "ilanlar"),
        where("sirketId", "==", user.uid),
        where("isDraft", "==", true),
        limit(1),
      );
      const sn = await getDocs(q);
      if (!sn.empty) {
        const d = sn.docs[0];
        setDraftId(d.id);
        const data = d.data();
        setBaslik(data.baslik || "");
        setAciklama(data.aciklama || "");
        setAlan(data.alan || "");
        setSehir(data.sehir || "");
        setArananYetenekler(data.arananYetenekler || "");
        setMinGano(data.minGano || "");
        setStajTuru(data.stajTuru || "Zorunlu");
        setCalismaSekli(data.calismaSekli || "Ofis");
      }
    };
    loadDraft();
  }, []);

  const buildData = async (isDraft: boolean) => {
    const user = auth.currentUser;
    if (!user) return null;
    const sirketDoc = await getDoc(doc(db, "sirket_profilleri", user.uid));
    return {
      baslik,
      aciklama,
      alan,
      sehir,
      stajTuru,
      calismaSekli,
      arananYetenekler,
      minGano,
      sirketId: user.uid,
      firmaAdi: sirketDoc.data()?.firmaAdi || "Şirket",
      aktif: !isDraft,
      isDraft,
      createdAt: serverTimestamp(),
    };
  };

  const handleTaslak = async () => {
    setLoading(true);
    try {
      const data = await buildData(true);
      if (!data) return;
      if (draftId) {
        await setDoc(doc(db, "ilanlar", draftId), data);
      } else {
        const ref = await addDoc(collection(db, "ilanlar"), data);
        setDraftId(ref.id);
      }
      alert("Taslak kaydedildi 💾");
    } catch {
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleYayinla = async () => {
    setLoading(true);
    try {
      const data = await buildData(false);
      if (!data) return;
      if (draftId) {
        await deleteDoc(doc(db, "ilanlar", draftId));
      }
      await addDoc(collection(db, "ilanlar"), data);
      router.push("/sirket/ilanlar");
    } catch {
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && (baslik.trim() === "" || aciklama.length < 10)) {
      alert("Lütfen başlık girin ve açıklamayı en az 10 karakter yazın!");
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="max-w-2xl mx-auto text-black">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() =>
              step > 1 ? setStep((s) => s - 1) : router.back()
            }
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#1C3FAA]">
              İlan Oluştur
            </h1>
            <p className="text-xs text-gray-400 font-medium">
              Adım {step} / {STEPS}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-1 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2F6FED] transition-all duration-300"
            style={{ width: `${(step / STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
        {step === 1 && (
          <>
            <p className="text-sm font-bold text-[#1C3FAA]">Genel Bilgiler</p>
            <ModernInput
              value={baslik}
              onChange={setBaslik}
              label="İlan Başlığı"
              placeholder="Örn: Android Developer"
            />
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                İş Tanımı
              </label>
              <textarea
                value={aciklama}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setAciklama(e.target.value);
                }}
                placeholder="Beklentilerinizi detaylandırın..."
                className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition resize-none h-36 text-gray-800"
              />
              <p
                className={`text-right text-xs mt-1 font-medium ${
                  aciklama.length < 50 ? "text-red-400" : "text-gray-400"
                }`}
              >
                {aciklama.length} / 500
              </p>
            </div>
            <ModernInput
              value={alan}
              onChange={setAlan}
              label="Alan"
              placeholder="Yazılım, Tasarım vb."
            />
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-sm font-bold text-[#1C3FAA]">Konum ve Şartlar</p>
            <ModernInput
              value={sehir}
              onChange={setSehir}
              label="Şehir"
              placeholder="İstanbul veya Uzaktan"
            />
            <SegmentedControl
              label="Staj Türü"
              options={["Zorunlu", "Gönüllü"]}
              value={stajTuru}
              onChange={setStajTuru}
            />
            <SegmentedControl
              label="Çalışma Şekli"
              options={["Ofis", "Uzaktan", "Hibrit"]}
              value={calismaSekli}
              onChange={setCalismaSekli}
            />
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm font-bold text-[#1C3FAA]">Aday Kriterleri</p>
            <ModernInput
              value={arananYetenekler}
              onChange={setArananYetenekler}
              label="Aranan Yetenekler"
              placeholder="Kotlin, Firebase, Git"
            />
            <ModernInput
              value={minGano}
              onChange={setMinGano}
              label="Minimum GANO"
              placeholder="2.50"
              type="number"
            />
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="w-full py-3 border-2 border-[#2F6FED] text-[#2F6FED] font-bold rounded-2xl hover:bg-blue-50 transition flex items-center justify-center gap-2"
            >
              <span>👁️</span>
              <span>İlanı Önizle</span>
            </button>
          </>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={handleTaslak}
          disabled={loading}
          className="flex-1 py-4 border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition disabled:opacity-50"
        >
          Taslak
        </button>
        <button
          type="button"
          onClick={step < STEPS ? handleNext : handleYayinla}
          disabled={loading}
          className="flex-[2] py-4 bg-[#2F6FED] text-white font-extrabold rounded-2xl hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              İşleniyor...
            </span>
          ) : step < STEPS ? (
            "Devam Et"
          ) : (
            "Yayınla"
          )}
        </button>
      </div>

      {showPreview && (
        <PreviewModal
          baslik={baslik}
          aciklama={aciklama}
          alan={alan}
          sehir={sehir}
          stajTuru={stajTuru}
          calismaSekli={calismaSekli}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
