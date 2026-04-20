export const ACTIVITY_TYPE = {
  CALL: 'Görüşme',
  VISIT: 'Ziyaret',
  OFFER_SENT: 'Teklif gönderildi',
  OFFER_ACCEPTED: 'Teklif kabul edildi',
  OFFER_REJECTED: 'Teklif reddedildi',
  ORDER_CREATED: 'Sipariş oluşturuldu',
  TERM_ADDED: 'Termin eklendi',
  PRODUCT_ARRIVED: 'Ürün geldi',
  NOTE: 'Not',
} as const;

export type ActivityType = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];

export const ACTIVITY_TYPES: ActivityType[] = Object.values(ACTIVITY_TYPE);
