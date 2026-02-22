import { Ilan } from "@/types";
import Link from "next/link";

export default function IlanCard({ ilan }: { ilan: Ilan }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
            {ilan.baslik}
          </h3>
          <p className="text-gray-500 text-sm mt-1">{ilan.alan}</p>
        </div>
        <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
          {ilan.sehir}
        </div>
      </div>
      <Link
        href={`/ogrenci/ilanlar/${ilan.id}`}
        className="mt-4 w-full block text-center py-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition"
      >
        Detayları İncele
      </Link>
    </div>
  );
}
