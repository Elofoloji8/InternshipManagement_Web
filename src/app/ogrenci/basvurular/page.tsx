"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function BasvuruDurumPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "basvurular"),
      where("ogrenciId", "==", auth.currentUser.uid),
    );
    return onSnapshot(q, (sn) =>
      setList(sn.docs.map((d) => ({ id: d.id, ...d.data() })) as any),
    );
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 text-gray-700">İlan</th>
            <th className="p-4 text-gray-700">Durum</th>
            <th className="p-4 text-gray-700">Tarih</th>
          </tr>
        </thead>
        <tbody>
          {list.map((b: any) => (
            <tr key={b.id} className="border-b text-black">
              <td className="p-4 font-medium">{b.ilanBaslik}</td>
              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    b.durum === "SIRKET_ONAYLADI"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {b.durum}
                </span>
              </td>
              <td className="p-4 text-gray-500 text-sm">{b.tarih}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
