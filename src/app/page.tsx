"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link"; // Kayıt sayfasına yönlendirme için

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const userDoc = await getDoc(
        doc(db, "kullanicilar", userCredential.user.uid),
      );

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Mobildeki rol isimleriyle tam eşleşme kontrolü
        if (userData.rol === "Öğrenci") {
          router.push("/ogrenci");
        } else if (userData.rol === "Akademi Sorumlusu") {
          router.push("/akademi");
        } else if (userData.rol === "Şirket Sorumlusu") {
          router.push("/sirket");
        } else {
          router.push("/admin");
        }
      }
    } catch (error: any) {
      alert("Giriş Hatası: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-blue-dark flex flex-col">
      {/* 🔵 MOBİL GRADIENT HEADER */}
      <div className="mobile-gradient-header h-[30vh] flex flex-col justify-end">
        <p className="text-white/70 text-lg">Welcome Back,</p>
        <h1 className="text-white text-4xl font-black tracking-tighter uppercase italic">
          Log In!
        </h1>
      </div>

      {/* ⚪ MOBİL SURFACE (Beyaz Alan) */}
      <div className="mobile-surface -mt-10 flex-1">
        <div className="max-w-md mx-auto space-y-8 py-6">
          <div className="text-left">
            <h2 className="text-2xl font-bold text-blue-dark">Giriş Yap</h2>
            <p className="text-gray-text text-sm mt-1">
              Staj sürecinizi yönetmeye devam edin.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-blue-dark/50 ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full p-4 bg-surface-gray border-none rounded-[14px] text-black focus:ring-2 focus:ring-blue-primary transition outline-none"
                placeholder="example@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-blue-dark/50 ml-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full p-4 bg-surface-gray border-none rounded-[14px] text-black focus:ring-2 focus:ring-blue-primary transition outline-none"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[58px] bg-blue-primary text-white rounded-[18px] font-bold text-lg shadow-xl hover:bg-blue-dark transition-all transform active:scale-95 disabled:bg-gray-300"
            >
              {loading ? "Bağlanıyor..." : "Log In"}
            </button>
          </form>

          {/* Kayıt Ol Yönlendirmesi */}
          <div className="text-center pt-4">
            <p className="text-gray-text text-sm">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-blue-primary font-bold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
