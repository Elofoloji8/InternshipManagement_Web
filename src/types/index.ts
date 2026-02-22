export interface Ilan {
  id: string;
  baslik: string;
  alan: string;
  sehir: string;
  aciklama: string;
  firmaAdi: string;
  calismaSekli: string;
  stajTuru: string;
  sirketId: string;
  aktif: boolean;
}

export interface Basvuru {
  id: string;
  ilanId: string;
  firmaAdi: string;
  ilanBaslik: string;
  ogrenciId: string;
  motivasyon: string;
  durum:
    | "BEKLIYOR"
    | "SIRKET_ONAYLADI"
    | "AKADEMIK_BEKLIYOR"
    | "AKADEMIK_REDDETTI"
    | "ONAYLANDI";
  tarih: any;
  akademikMotivasyon?: string;
  akademikBasvuruTarihi?: any;
}

export interface StajSureci {
  id: string;
  ogrenciId: string;
  ilanId: string;
  durum: string;
  istenenBelgeler: string[];
}
