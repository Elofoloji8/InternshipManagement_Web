"use client";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-4">
          Akademisyen / Yönetici Paneli
        </h1>
        <p className="text-gray-600">
          Hoş geldiniz! Buradan staj başvurularını ve kullanıcıları
          yönetebilirsiniz.
        </p>

        {/* İleride buraya Firestore'dan verileri çekeceğiz */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
            <span className="block text-2xl font-bold text-blue-600">12</span>
            <span className="text-sm text-gray-500">Aktif Stajyer</span>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-center">
            <span className="block text-2xl font-bold text-yellow-600">5</span>
            <span className="text-sm text-gray-500">Bekleyen Onay</span>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
            <span className="block text-2xl font-bold text-green-600">28</span>
            <span className="text-sm text-gray-500">Tamamlanan</span>
          </div>
        </div>
      </div>
    </div>
  );
}
