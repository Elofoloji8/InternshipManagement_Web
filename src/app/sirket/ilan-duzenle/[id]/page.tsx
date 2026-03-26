"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

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

export default function IlanDuzenle() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [alan, setAlan] = useState("");
  const [sehir, setSehir] = useState("");
  const [arananYetenekler, setArananYetenekler] = useState("");
  const [minGano, setMinGano] = useState("");
  const [stajTuru, setStajTuru] = useState("Zorunlu");
  const [calismaSekli, setCalismaSekli] = useState("Ofis");

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "ilanlar", id as string)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setBaslik(d.baslik || "");
        setAciklama(d.aciklama || "");
        setAlan(d.alan || "");
        setSehir(d.sehir || "");
        setArananYetenekler(d.arananYetenekler || "");
        setMinGano(d.minGano || "");
        setStajTuru(d.stajTuru || "Zorunlu");
        setCalismaSekli(d.calismaSekli || "Ofis");
      }
      setFetching(false);
    });
  }, [id]);

  const handleGuncelle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baslik.trim()) return alert("Başlık boş bırakılamaz!");
    setLoading(true);
    try {
      await updateDoc(doc(db, "ilanlar", id as string), {
        baslik,
        aciklama,
        alan,
        sehir,
        stajTuru,
        calismaSekli,
        arananYetenekler,
        minGano,
        updatedAt: serverTimestamp(),
      });
      router.push("/sirket/ilanlar");
    } catch (err: unknown) {
      alert(`Hata: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto pt-10 text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#2F6FED] rounded-full animate-spin mx-auto mb-3" />
        İlan yükleniyor...
      </div>
    );
  }

  return (
    <form onSubmit={handleGuncelle} className="max-w-2xl mx-auto text-black">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ←
        </button>
        <div>
          <p className="text-gray-400 text-sm font-medium">İlan Düzenleme</p>
          <h1 className="text-3xl font-black text-[#1C3FAA]">İlanı Düzenle</h1>
        </div>
      </div>

      {/* Genel Bilgiler */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-4 shadow-sm space-y-4">
        <p className="text-sm font-bold text-[#1C3FAA]">Genel Bilgiler</p>
        <ModernInput
          value={baslik}
          onChange={setBaslik}
          label="İlan Başlığı *"
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
          <p className="text-right text-xs text-gray-400 mt-1">
            {aciklama.length} / 500
          </p>
        </div>
        <ModernInput
          value={alan}
          onChange={setAlan}
          label="Alan"
          placeholder="Yazılım, Tasarım vb."
        />
      </div>

      {/* Konum & Şartlar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-4 shadow-sm space-y-4">
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
      </div>

      {/* Aday Kriterleri */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-6 shadow-sm space-y-4">
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
      </div>

      {/* Butonlar */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-4 border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-[2] py-4 bg-[#2F6FED] text-white font-extrabold rounded-2xl hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
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
      </div>
    </form>
  );
}
