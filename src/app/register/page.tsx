"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("Öğrenci"); // Mobildeki varsayılan rol
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const roller = [
    { label: "Öğrenci", value: "OGRENCI" },
    { label: "Şirket Sorumlusu", value: "SIRKET" },
    { label: "Akademi Sorumlusu", value: "AKADEMI" },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Firestore'a seçilen role göre kaydet
      const selectedRoleValue =
        roller.find((r) => r.label === rol)?.value || "OGRENCI";

      await setDoc(doc(db, "kullanicilar", user.uid), {
        uid: user.uid,
        email: email,
        role: selectedRoleValue,
        createdAt: new Date().toISOString(),
      });

      alert(
        "Hesap başarıyla oluşturuldu! Giriş ekranına yönlendiriliyorsunuz...",
      );
      router.push("/login");
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#2F6FED] to-[#1C3FAA]">
      {/* 🎓 MODERN HEADER (Mobildeki weight(0.7f) kısmı) */}
      <div className="flex-none h-[25vh] flex flex-col justify-end p-8 md:px-20">
        <p className="text-white/70 text-lg">Welcome to</p>
        <h1 className="text-white text-4xl md:text-5xl font-black tracking-tighter">
          Internship Hub
        </h1>
      </div>

      {/* ⚪ CONTENT AREA (Mobildeki Surface/RoundedCornerShape kısmı) */}
      <div className="flex-1 bg-[#F8F9FF] rounded-t-[40px] shadow-2xl p-8 md:px-20 overflow-y-auto">
        <div className="max-w-md mx-auto py-6">
          <h2 className="text-2xl font-bold text-[#1C3FAA] mb-8">
            Create Account
          </h2>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1C3FAA]/50 ml-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full p-4 bg-[#F0F2F5] border-none rounded-[14px] text-black focus:ring-2 focus:ring-[#2F6FED] transition outline-none"
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
                className="w-full p-4 bg-[#F0F2F5] border-none rounded-[14px] text-black focus:ring-2 focus:ring-[#2F6FED] transition outline-none"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* MODERN ROLE SELECTOR (Kotlin'deki ModernRoleSelector karşılığı) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#1C3FAA]/50 ml-1">
                Hesap Türü
              </label>
              <div className="flex bg-[#F0F2F5] p-1 rounded-[14px] h-[52px]">
                {roller.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setRol(item.label)}
                    className={`flex-1 rounded-[10px] text-[13px] font-bold transition-all ${
                      rol === item.label
                        ? "bg-white text-[#2F6FED] shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[58px] bg-[#2F6FED] text-white rounded-[18px] font-bold text-lg shadow-lg hover:bg-[#1C3FAA] transition disabled:bg-gray-400 mt-4"
            >
              {loading ? "Creating..." : "Create My Account"}
            </button>
          </form>

          {/* Social Login Section */}
          <div className="mt-10 text-center">
            <p className="text-gray-400 text-sm mb-6 font-medium">
              or sign up with
            </p>
            <div className="flex justify-center gap-4">
              {["G", "F", "A"].map((label) => (
                <div
                  key={label}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-[#1C3FAA] shadow-md border border-gray-100 cursor-pointer hover:scale-110 transition"
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
