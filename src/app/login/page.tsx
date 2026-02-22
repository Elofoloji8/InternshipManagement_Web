"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      // 1. Firebase Auth Girişi
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. Firestore'dan Rol Kontrolü (Kotlin'deki AuthState.Success içindeki yönlendirme mantığı)
      const userDoc = await getDoc(doc(db, "kullanicilar", user.uid));

      if (userDoc.exists()) {
        const rol = userDoc.data().rol;
        alert("Giriş başarılı! Yönlendiriliyorsunuz...");

        // Role göre yönlendirme (Kotlin kodundaki navigate mantığı)
        switch (rol) {
          case "Admin":
            router.push("/admin");
            break;
          case "Şirket Sorumlusu":
            router.push("/sirket");
            break;
          case "Akademi Sorumlusu":
            router.push("/akademi");
            break;
          default:
            router.push("/ogrenci");
        }
      }
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#2F6FED] to-[#1C3FAA]">
      {/* 🔵 MODERN HEADER (Kotlin: Box weight 0.8f) */}
      <div className="flex-none h-[25vh] flex flex-col justify-end p-8 md:px-20">
        <p className="text-white/70 text-lg">Welcome Back,</p>
        <h1 className="text-white text-4xl md:text-5xl font-black tracking-tighter">
          Log In!
        </h1>
      </div>

      {/* ⚪ CONTENT AREA (Kotlin: Surface weight 2.2f) */}
      <div className="flex-1 bg-[#F8F9FF] rounded-t-[40px] shadow-2xl p-8 md:px-20 overflow-y-auto">
        <div className="max-w-md mx-auto py-10">
          <h2 className="text-22 font-bold text-[#1C3FAA] mb-8">Giriş Yap</h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field (Kotlin: CustomStyledTextField) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1C3FAA]/50 ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full p-4 bg-[#F0F2F5] border-none rounded-[14px] text-black focus:ring-2 focus:ring-[#2F6FED] transition outline-none shadow-sm"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1C3FAA]/50 ml-1">
                Password
              </label>
              <input
                type="password"
                placeholder="*****"
                className="w-full p-4 bg-[#F0F2F5] border-none rounded-[14px] text-black focus:ring-2 focus:ring-[#2F6FED] transition outline-none shadow-sm"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-[13px] text-[#2F6FED] font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button (Kotlin: Button elevation 6.dp) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[58px] bg-[#2F6FED] text-white rounded-[18px] font-bold text-lg shadow-xl hover:bg-[#1C3FAA] transition-all transform active:scale-95 disabled:bg-gray-400"
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Sign Up Redirect */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-[#2F6FED] font-bold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Social Login (Kotlin: SocialLoginSection) */}
          <div className="mt-10 text-center">
            <p className="text-gray-400 text-[13px] mb-6 font-medium italic">
              or log in with
            </p>
            <div className="flex justify-center gap-4">
              {["G", "F", "A"].map((label) => (
                <div
                  key={label}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-[#1C3FAA] shadow-md border border-gray-100 cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
