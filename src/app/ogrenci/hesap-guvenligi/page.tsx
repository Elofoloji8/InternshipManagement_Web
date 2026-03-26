"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

export default function HesapGuvenligiPage() {
  const [mevcutSifre, setMevcutSifre] = useState("");
  const [yeniSifre, setYeniSifre] = useState("");
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSifreDegistir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (yeniSifre !== yeniSifreTekrar) return alert("Yeni şifreler eşleşmiyor.");
    if (yeniSifre.length < 6) return alert("Şifre en az 6 karakter olmalıdır.");

    const user = auth.currentUser;
    if (!user || !user.email) return;

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, mevcutSifre);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, yeniSifre);
      setSuccess(true);
      setMevcutSifre("");
      setYeniSifre("");
      setYeniSifreTekrar("");
    } catch (err: unknown) {
      const msg = (err as Error).message;
      if (msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        alert("Mevcut şifre hatalı.");
      } else {
        alert(`Hata: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-black">
      <div className="mb-8">
        <p className="text-gray-400 text-sm font-medium">Öğrenci Paneli</p>
        <h1 className="text-3xl font-black text-[#1C3FAA]">Hesap Güvenliği</h1>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <p className="text-green-700 font-bold text-sm">Şifreniz başarıyla güncellendi!</p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-xl">🔒</div>
          <div>
            <p className="font-bold text-[#1C3FAA]">Şifre Değiştir</p>
            <p className="text-gray-400 text-xs">Hesabınızı korumak için güçlü bir şifre kullanın</p>
          </div>
        </div>

        <form onSubmit={handleSifreDegistir} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Mevcut Şifre</label>
            <input
              type="password"
              value={mevcutSifre}
              onChange={(e) => setMevcutSifre(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Yeni Şifre</label>
            <input
              type="password"
              value={yeniSifre}
              onChange={(e) => setYeniSifre(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition"
              placeholder="En az 6 karakter"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              value={yeniSifreTekrar}
              onChange={(e) => setYeniSifreTekrar(e.target.value)}
              className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#2F6FED] transition"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#2F6FED] text-white font-black rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 mt-2"
          >
            {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-xl">📧</div>
          <div className="flex-1">
            <p className="font-bold text-[#1C3FAA] text-sm">E-posta Adresi</p>
            <p className="text-gray-400 text-xs">{auth.currentUser?.email}</p>
          </div>
          <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-xl">Doğrulandı</span>
        </div>
      </div>
    </div>
  );
}
