export const ACTIVITY_TYPES = [
  'Görüşme',
  'Ziyaret',
  'Teklif gönderildi',
  'Teklif kabul edildi',
  'Teklif reddedildi',
  'Sipariş oluşturuldu',
  'Termin eklendi',
  'Ürün geldi',
  'Not',
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
