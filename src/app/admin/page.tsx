"use client";
import { useEffect, useRef, useState } from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface PendingUser {
  id: string;
  email: string;
  role: string;
}

interface AdminContent {
  id: string;
  title: string;
  description: string;
  colorHex?: string;
  imageUrl?: string;
  type?: string;
}

const TABS = ["Onay Bekleyenler", "İçerik Yönetimi"];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [talepler, setTalepler] = useState<PendingUser[]>([]);
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [loading, setLoading] = useState(true);

  // İçerik formu
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState("#2F6FED");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const qTalepler = query(
      collection(db, "kullanicilar"),
      where("onayli", "==", false),
      where("role", "in", ["AKADEMI", "SIRKET"]),
    );
    const unsub1 = onSnapshot(qTalepler, (sn) => {
      setTalepler(sn.docs.map((d) => ({ id: d.id, ...d.data() } as PendingUser)));
      setLoading(false);
    });

    const qContents = query(
      collection(db, "admin_contents"),
      orderBy("timestamp", "desc"),
    );
    const unsub2 = onSnapshot(qContents, (sn) =>
      setContents(sn.docs.map((d) => ({ id: d.id, ...d.data() } as AdminContent))),
    );

    return () => { unsub1(); unsub2(); };
  }, []);

  const handleOnayla = async (id: string) => {
    await updateDoc(doc(db, "kullanicilar", id), { onayli: true });
  };

  const handleReddet = async (id: string) => {
    if (confirm("Bu kayıt talebini silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, "kullanicilar", id));
    }
  };

  const resetForm = () => {
    setTitle(""); setDesc(""); setColor("#2F6FED");
    setImageFile(null); setEditId(null);
  };

  const handleKaydet = async () => {
    if (!title.trim() || !desc.trim()) return alert("Başlık ve açıklama zorunludur.");
    setSaving(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const storageRef = ref(storage, `admin_contents/${Date.now()}.jpg`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      if (editId) {
        await updateDoc(doc(db, "admin_contents", editId), {
          title, description: desc, colorHex: color,
          ...(imageUrl && { imageUrl }),
        });
      } else {
        await addDoc(collection(db, "admin_contents"), {
          title, description: desc, colorHex: color,
          imageUrl, type: "REHBER",
          timestamp: serverTimestamp(),
        });
      }
      resetForm();
    } catch (e: unknown) {
      alert(`Hata: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDuzenle = (c: AdminContent) => {
    setEditId(c.id);
    setTitle(c.title);
    setDesc(c.description);
    setColor(c.colorHex || "#2F6FED");
    setActiveTab(1);
  };

  const handleSil = async (id: string) => {
    if (confirm("Bu içeriği silmek istediğinize emin misiniz?"))
      await deleteDoc(doc(db, "admin_contents", id));
  };

  return (
    <div className="min-h-screen bg-[#1C3FAA]">
      {/* Header */}
      <header className="mobile-gradient-header flex justify-between items-end">
        <div>
          <p className="text-white/60 text-sm font-medium uppercase tracking-widest">
            Yönetim Paneli
          </p>
          <h1 className="text-3xl font-extrabold italic">Admin Merkezi</h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
          <span className="text-xl font-black">{talepler.length}</span>
        </div>
      </header>

      <main className="mobile-surface">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-6">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              className={`flex-1 py-3 text-sm font-bold transition relative ${
                activeTab === i ? "text-[#2F6FED]" : "text-gray-400"
              }`}
            >
              {t}
              {i === 0 && talepler.length > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {talepler.length}
                </span>
              )}
              {activeTab === i && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2F6FED] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: Onay Bekleyenler */}
        {activeTab === 0 && (
          <>
            {loading ? (
              <div className="text-center py-20 text-gray-400">Yükleniyor...</div>
            ) : talepler.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <span className="text-6xl">✅</span>
                <p className="text-gray-400 font-bold">
                  Onay bekleyen işlem bulunmuyor.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {talepler.map((user) => (
                  <div key={user.id} className="modern-card">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-14 h-14 bg-gray-surface rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                        👤
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-blue-dark leading-tight">
                          {user.email}
                        </h3>
                        <p className="text-xs font-black text-blue-primary uppercase tracking-tighter mt-1">
                          Talep Edilen Rol: {user.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReddet(user.id)}
                        className="flex-1 py-3.5 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition"
                      >
                        ✕ Reddet
                      </button>
                      <button
                        onClick={() => handleOnayla(user.id)}
                        className="flex-1 py-3.5 bg-green-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-green-700 transition"
                      >
                        ✓ Onayla
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* TAB 2: İçerik Yönetimi */}
        {activeTab === 1 && (
          <div className="space-y-6">
            {/* Form */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[#1C3FAA] text-lg mb-4">
                {editId ? "İçeriği Düzenle" : "Yeni İçerik Ekle"}
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Başlık"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition text-gray-800"
                />
                <textarea
                  placeholder="Açıklama"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition resize-none h-28 text-gray-800"
                />
                <div className="flex gap-3 items-center">
                  <label className="text-xs text-gray-500 font-medium">Renk:</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2.5 border border-dashed border-gray-300 rounded-2xl text-xs text-gray-500 hover:border-[#2F6FED] transition"
                  >
                    {imageFile ? `✅ ${imageFile.name}` : "📷 Görsel Yükle"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex gap-3">
                  {editId && (
                    <button
                      onClick={resetForm}
                      className="flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition text-sm"
                    >
                      İptal
                    </button>
                  )}
                  <button
                    onClick={handleKaydet}
                    disabled={saving}
                    className="flex-[2] py-3 bg-[#2F6FED] text-white font-bold rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 text-sm"
                  >
                    {saving ? "Kaydediliyor..." : editId ? "Güncelle" : "İçerik Ekle"}
                  </button>
                </div>
              </div>
            </div>

            {/* İçerik Listesi */}
            {contents.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                Henüz içerik eklenmemiş.
              </div>
            ) : (
              <div className="space-y-3">
                {contents.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm"
                  >
                    {c.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.imageUrl}
                        alt={c.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                    )}
                    <div
                      className="w-3 h-12 rounded-full shrink-0"
                      style={{ backgroundColor: c.colorHex || "#2F6FED" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1C3FAA] text-sm truncate">
                        {c.title}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {c.description}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleDuzenle(c)}
                        className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-[#2F6FED] hover:bg-blue-100 transition text-xs"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleSil(c.id)}
                        className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-100 transition text-xs"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
