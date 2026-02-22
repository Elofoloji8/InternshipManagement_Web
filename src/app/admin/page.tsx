"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export default function AdminPage() {
  const [talepler, setTalepler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sadece onay bekleyen (onayli: false) yetkilileri getir
    const q = query(
      collection(db, "kullanicilar"),
      where("onayli", "==", false),
      where("role", "in", ["AKADEMI", "SIRKET"]), // Sadece yetkili rolleri
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTalepler(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOnayla = async (id: string) => {
    try {
      await updateDoc(doc(db, "kullanicilar", id), { onayli: true });
      alert("Yetkili erişimi onaylandı! ✅");
    } catch (e) {
      alert("Hata oluştu.");
    }
  };

  const handleReddet = async (id: string) => {
    if (confirm("Bu kayıt talebini silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, "kullanicilar", id));
    }
  };

  return (
    <div className="min-h-screen bg-blue-dark">
      {/* 🔵 MOBİL GRADIENT HEADER */}
      <header className="mobile-gradient-header flex justify-between items-end">
        <div>
          <p className="text-white/60 text-sm font-medium uppercase tracking-widest">
            Yönetim Paneli
          </p>
          <h1 className="text-3xl font-extrabold italic">Onay Bekleyenler</h1>
        </div>

        {/* Bekleyen Sayısı Badge (Kotlin'deki Box size 45.dp karşılığı) */}
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
          <span className="text-xl font-black">{talepler.length}</span>
        </div>
      </header>

      {/* ⚪ MOBİL SURFACE */}
      <main className="mobile-surface">
        {loading ? (
          <div className="text-center py-20 text-gray-400 italic">
            Yükleniyor...
          </div>
        ) : talepler.length === 0 ? (
          /* Kotlin: AdminEmptyState karşılığı */
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <span className="text-6xl">✅</span>
            <p className="text-gray-400 font-bold">
              Onay bekleyen işlem bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {talepler.map((user) => (
              /* Kotlin: ModernUserApprovalCard karşılığı */
              <div
                key={user.id}
                className="modern-card animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
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
                    className="flex-1 py-3.5 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition active:scale-95"
                  >
                    ✕ Reddet
                  </button>
                  <button
                    onClick={() => handleOnayla(user.id)}
                    className="flex-1 py-3.5 bg-green-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-200 hover:bg-green-700 transition active:scale-95"
                  >
                    ✓ Onayla
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
