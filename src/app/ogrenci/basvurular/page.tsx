"use client";
import { useEffect, useRef, useState } from "react";
import { db, auth, storage } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface Basvuru {
  id: string;
  ilanId: string;
  ilanBaslik: string;
  firmaAdi: string;
  durum: string;
}

interface StajSureci {
  id: string;
  ilanId: string;
  ilanBaslik: string;
  sirketAdi: string;
  durum: string;
  istenenBelgeler?: string[];
  ogrenciBelgeUrl?: string;
  akademikRedSebebi?: string;
}

const STEPS = [
  { label: "Başvuru" },
  { label: "Şirket Onayı" },
  { label: "Akademik Onay" },
  { label: "Belgeler" },
  { label: "Tamamlandı" },
];

const STEP_ORDER = [
  "BEKLIYOR",
  "SIRKET_ONAYLADI",
  "AKADEMIK_BEKLIYOR",
  "BELGE_OGRENCIYE_GONDERILDI",
  "BELGE_AKADEMIYE_GONDERILDI",
  "TAMAMLANDI",
];

function getStepIndex(durum: string) {
  const i = STEP_ORDER.indexOf(durum);
  return i === -1 ? 0 : i;
}

function DurumBadge({ durum }: { durum: string }) {
  const styles: Record<string, string> = {
    BEKLIYOR: "bg-blue-50 text-blue-600",
    SIRKET_ONAYLADI: "bg-green-50 text-green-600",
    REDDEDILDI: "bg-red-50 text-red-500",
    AKADEMIK_BEKLIYOR: "bg-yellow-50 text-yellow-600",
    BELGE_OGRENCIYE_GONDERILDI: "bg-orange-50 text-orange-600",
    BELGE_AKADEMIYE_GONDERILDI: "bg-purple-50 text-purple-600",
    AKADEMIK_REDDETTI: "bg-red-50 text-red-500",
    TAMAMLANDI: "bg-teal-50 text-teal-600",
  };
  const labels: Record<string, string> = {
    BEKLIYOR: "Bekliyor",
    SIRKET_ONAYLADI: "Şirket Onayladı",
    REDDEDILDI: "Reddedildi",
    AKADEMIK_BEKLIYOR: "Akademik Onay Bekliyor",
    BELGE_OGRENCIYE_GONDERILDI: "Belge Bekleniyor",
    BELGE_AKADEMIYE_GONDERILDI: "Belgeler İncelemede",
    AKADEMIK_REDDETTI: "Akademik Reddetti",
    TAMAMLANDI: "Tamamlandı ✓",
  };
  return (
    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${styles[durum] || "bg-gray-50 text-gray-500"}`}>
      {labels[durum] || durum}
    </span>
  );
}

export default function BasvurularimPage() {
  const [basvurular, setBasvurular] = useState<Basvuru[]>([]);
  const [surecler, setSurecler] = useState<StajSureci[]>([]);
  const [loading, setLoading] = useState(true);
  const [akdModal, setAkdModal] = useState<Basvuru | null>(null);
  const [motivasyon, setMotivasyon] = useState("");
  const [sending, setSending] = useState(false);
  const [belgeModal, setBelgeModal] = useState<StajSureci | null>(null);
  const [belgeFile, setBelgeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q1 = query(
      collection(db, "basvurular"),
      where("ogrenciId", "==", user.uid),
    );
    const unsub1 = onSnapshot(q1, (sn) => {
      setBasvurular(sn.docs.map((d) => ({ id: d.id, ...d.data() } as Basvuru)));
      setLoading(false);
    });

    const q2 = query(
      collection(db, "staj_surecleri"),
      where("ogrenciEmail", "==", user.email),
    );
    const unsub2 = onSnapshot(q2, (sn) =>
      setSurecler(sn.docs.map((d) => ({ id: d.id, ...d.data() } as StajSureci))),
    );

    return () => { unsub1(); unsub2(); };
  }, []);

  const getProcess = (b: Basvuru) => surecler.find((s) => s.ilanId === b.ilanId);
  const getActiveDurum = (b: Basvuru) => {
    const s = getProcess(b);
    return s ? s.durum : b.durum;
  };

  const handleAkademikGonder = async () => {
    if (!akdModal || !motivasyon.trim()) return;
    setSending(true);
    try {
      const surec = getProcess(akdModal);
      if (surec) {
        await updateDoc(doc(db, "staj_surecleri", surec.id), {
          durum: "AKADEMIK_BEKLIYOR",
          motivasyonMektubu: motivasyon,
          akademikBasvuruTarihi: serverTimestamp(),
        });
      }
      setAkdModal(null);
      setMotivasyon("");
    } catch {
      alert("Hata oluştu.");
    } finally {
      setSending(false);
    }
  };

  const handleBelgeYukle = async () => {
    if (!belgeModal || !belgeFile) return;
    setUploading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const storageRef = ref(storage, `staj_belgeleri/${user.uid}_${Date.now()}`);
      await uploadBytes(storageRef, belgeFile);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "staj_surecleri", belgeModal.id), {
        ogrenciBelgeUrl: url,
        durum: "BELGE_AKADEMIYE_GONDERILDI",
        belgeTarihi: serverTimestamp(),
      });
      setBelgeModal(null);
      setBelgeFile(null);
    } catch {
      alert("Dosya yüklenemedi.");
    } finally {
      setUploading(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center text-gray-400">Yükleniyor...</div>;

  return (
    <div className="text-black">
      <div className="mb-8">
        <p className="text-gray-400 text-sm font-medium">Öğrenci Paneli</p>
        <h1 className="text-3xl font-black text-[#1C3FAA]">Başvurularım</h1>
        <p className="text-gray-400 text-sm mt-1">Staj başvurularınızın sürecini takip edin.</p>
      </div>

      {basvurular.length === 0 ? (
        <div className="bg-white p-16 rounded-3xl border border-dashed text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-bold text-[#1C3FAA]">Henüz başvuru yok</p>
          <p className="text-gray-400 text-sm mt-1">İlan sayfasından stajlara başvurabilirsiniz.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {basvurular.map((b) => {
            const surec = getProcess(b);
            const activeDurum = getActiveDurum(b);
            const activeStep = getStepIndex(activeDurum);
            const isRejected = activeDurum === "REDDEDILDI" || activeDurum === "AKADEMIK_REDDETTI";

            return (
              <div key={b.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="font-black text-[#1C3FAA] text-lg">{b.ilanBaslik}</h2>
                    <p className="text-gray-500 text-sm font-medium">{b.firmaAdi}</p>
                  </div>
                  <DurumBadge durum={activeDurum} />
                </div>

                {!isRejected && (
                  <div className="flex items-center mb-5 relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 z-0" />
                    {STEPS.map((step, i) => {
                      const done = i < activeStep;
                      const current = i === activeStep;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                            done ? "bg-[#2F6FED] text-white" : current ? "bg-white border-2 border-[#2F6FED] text-[#2F6FED]" : "bg-gray-100 text-gray-400"
                          }`}>
                            {done ? "✓" : i + 1}
                          </div>
                          <span className={`text-[10px] mt-1.5 font-bold text-center leading-tight ${done || current ? "text-[#1C3FAA]" : "text-gray-400"}`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {isRejected && (
                  <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                    <p className="text-red-600 font-bold text-sm">
                      {activeDurum === "AKADEMIK_REDDETTI"
                        ? "❌ Akademik sorumlu başvurunuzu reddetti."
                        : "❌ Şirket başvurunuzu reddetti."}
                    </p>
                    {surec?.akademikRedSebebi && (
                      <p className="text-red-400 text-xs mt-1">{surec.akademikRedSebebi}</p>
                    )}
                  </div>
                )}

                {activeDurum === "SIRKET_ONAYLADI" && surec && (
                  <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                    <p className="text-green-800 font-bold text-sm mb-1">🎉 Şirket başvurunuzu onayladı!</p>
                    <p className="text-green-700 text-xs mb-3">
                      Stajınızı tamamlamak için akademik sorumlunuzdan onay almanız gerekiyor.
                    </p>
                    <button onClick={() => setAkdModal(b)}
                      className="w-full bg-green-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-green-700 transition">
                      Akademik Onaya Gönder 🎓
                    </button>
                  </div>
                )}

                {activeDurum === "BELGE_OGRENCIYE_GONDERILDI" && surec && (
                  <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                    <p className="text-orange-800 font-bold text-sm mb-2">📄 Akademik sorumlu belge istedi</p>
                    {surec.istenenBelgeler && surec.istenenBelgeler.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {surec.istenenBelgeler.map((bel, i) => (
                          <span key={i} className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-lg font-bold">
                            {bel}
                          </span>
                        ))}
                      </div>
                    )}
                    <button onClick={() => setBelgeModal(surec)}
                      className="w-full bg-orange-500 text-white py-3 rounded-2xl font-bold text-sm hover:bg-orange-600 transition">
                      Belge Yükle 📤
                    </button>
                  </div>
                )}

                {activeDurum === "BELGE_AKADEMIYE_GONDERILDI" && (
                  <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
                    <p className="text-purple-700 font-bold text-sm">⏳ Belgeleriniz inceleniyor.</p>
                    {surec?.ogrenciBelgeUrl && (
                      <a href={surec.ogrenciBelgeUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#2F6FED] font-bold hover:underline mt-2 block">
                        📎 Yüklenen Belgeyi Görüntüle
                      </a>
                    )}
                  </div>
                )}

                {activeDurum === "TAMAMLANDI" && (
                  <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100 text-center">
                    <p className="text-teal-700 font-black">🎓 Stajınız başarıyla tamamlandı!</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Akademik başvuru modal */}
      {akdModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={() => setAkdModal(null)}>
          <div className="bg-white w-full max-w-lg rounded-t-[2rem] p-6 pb-10"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-black text-[#1C3FAA] mb-1">Akademik Başvuru</h3>
            <p className="text-gray-400 text-sm mb-4">Stajın akademik uygunluğu hakkında kısa bir not yazın.</p>
            <textarea
              className="w-full p-4 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] h-36 resize-none mb-4"
              placeholder="Hangi derslerle ilişkili? Neler öğreneceksiniz?"
              value={motivasyon}
              onChange={(e) => setMotivasyon(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setAkdModal(null)}
                className="flex-1 py-3.5 border border-gray-200 text-gray-500 font-bold rounded-2xl">
                Vazgeç
              </button>
              <button onClick={handleAkademikGonder} disabled={sending || !motivasyon.trim()}
                className="flex-[2] py-3.5 bg-[#2F6FED] text-white font-bold rounded-2xl disabled:opacity-50">
                {sending ? "Gönderiliyor..." : "Gönder 🎓"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Belge yükleme modal */}
      {belgeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={() => { setBelgeModal(null); setBelgeFile(null); }}>
          <div className="bg-white w-full max-w-lg rounded-t-[2rem] p-6 pb-10"
            onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-black text-[#1C3FAA] mb-1">Belge Yükle</h3>
            {belgeModal.istenenBelgeler && (
              <div className="flex flex-wrap gap-2 mb-4">
                {belgeModal.istenenBelgeler.map((bel, i) => (
                  <span key={i} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-lg font-bold">
                    📄 {bel}
                  </span>
                ))}
              </div>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className={`w-full p-4 rounded-2xl border-2 border-dashed text-sm font-bold mb-4 transition ${
                belgeFile ? "border-green-400 text-green-600 bg-green-50" : "border-gray-200 text-gray-400 hover:border-[#2F6FED]"
              }`}>
              {belgeFile ? `✅ ${belgeFile.name}` : "📎 Dosya Seç (PDF veya Görsel)"}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden"
              onChange={(e) => setBelgeFile(e.target.files?.[0] || null)} />
            <div className="flex gap-3">
              <button onClick={() => { setBelgeModal(null); setBelgeFile(null); }}
                className="flex-1 py-3.5 border border-gray-200 text-gray-500 font-bold rounded-2xl">
                Vazgeç
              </button>
              <button onClick={handleBelgeYukle} disabled={uploading || !belgeFile}
                className="flex-[2] py-3.5 bg-[#2F6FED] text-white font-bold rounded-2xl disabled:opacity-50">
                {uploading ? "Yükleniyor..." : "Yükle 📤"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
