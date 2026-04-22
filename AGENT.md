# SahaApp — Mobile Agent

---

## Uygulama Kimliği

Tek kullanıcılı, Android odaklı, offline-first çalışan bir müşteri / aktivite / termin takip uygulamasıdır.

- Her kullanıcı uygulamayı kendi Android cihazında kullanır
- Veriler yalnızca cihaz içinde saklanır (SQLite)
- Hesap sistemi yoktur, giriş ekranı yoktur, sunucu yoktur
- İnternet bağlantısı gerekmez
- JSON export/import ile manuel yedekleme yapılır

**Bu uygulama:**

- ERP değil
- Muhasebe değil
- Stok uygulaması değil
- Çok kullanıcılı CRM değil
- Ekip yönetimi değil

---

## Tech Stack

| Katman           | Teknoloji                                |
| ---------------- | ---------------------------------------- |
| Framework        | React Native CLI                         |
| Dil              | TypeScript (strict)                      |
| Stil             | NativeWind                               |
| Navigation       | React Navigation v6 (Stack + Bottom Tab) |
| Veritabanı       | SQLite (`react-native-quick-sqlite`)     |
| State Management | Zustand                                  |
| Form             | React Hook Form + Zod                    |
| İkonlar          | react-native-vector-icons                |
| Yedekleme        | JSON export/import (Share API)           |

> Expo kullanılmaz. Firebase yoktur. Supabase yoktur. Backend yoktur. Auth yoktur. Cloud sync yoktur.

---

## TODO Sonra Bakılacaklar

- Push notification sistemi eklenecek ama şimdi yapılmayacak.
- Bildirim akışı onaylanırsa ilk aday senaryolar:
  - Bugün termin var
  - Yarın termin var
  - Uzun süredir ziyaret edilmeyen müşteri var
- Uygulama Türkiye'de sahada çalışan küçük işletmeler için genişletilecek ama şimdi yapılmayacak.
- Play Store odağı için ürün kapsamı sonra netleştirilecek.
- Uygulama boyut küçültme çalışması yapılacak ama şimdi yapılmayacak.
- Release boyut analizi, kütüphane etkisi ve shrink/minify adımları sonra ele alınacak.

---

## Veri Modeli

### `customers`

```sql
id            INTEGER PRIMARY KEY AUTOINCREMENT
customerName  TEXT NOT NULL
companyName   TEXT NOT NULL
phone         TEXT
email         TEXT
createdAt     TEXT DEFAULT (datetime('now'))
updatedAt     TEXT DEFAULT (datetime('now'))
```

### `activities`

```sql
id            INTEGER PRIMARY KEY AUTOINCREMENT
customerId    INTEGER NOT NULL REFERENCES customers(id)
date          TEXT NOT NULL
type          TEXT NOT NULL
note          TEXT
relatedTermId INTEGER REFERENCES terms(id)
createdAt     TEXT DEFAULT (datetime('now'))
```

**Aktivite `type` sabit seçenekleri — başkası kullanılmaz:**

```
Görüşme
Ziyaret
Teklif gönderildi
Teklif kabul edildi
Teklif reddedildi
Sipariş oluşturuldu
Termin eklendi
Ürün geldi
Not
```

### `terms`

```sql
id            INTEGER PRIMARY KEY AUTOINCREMENT
customerId    INTEGER NOT NULL REFERENCES customers(id)
productName   TEXT NOT NULL
orderDate     TEXT NOT NULL
termDuration  TEXT NOT NULL
expectedDate  TEXT NOT NULL
status        TEXT NOT NULL DEFAULT 'Bekleniyor'  -- 'Bekleniyor' | 'Geldi'
arrivedAt     TEXT
createdAt     TEXT DEFAULT (datetime('now'))
```

**Kurallar:**

- Termin müşterisiz olamaz
- `status` → `'Geldi'` seçilince `arrivedAt` otomatik bugünün tarihi olur
- Termin `'Geldi'` yapılınca müşteri aktivite geçmişine otomatik `"Ürün geldi"` aktivitesi eklenir

**"Son işlem" kuralı:**

- Müşteri listesindeki `son işlem` ve `son işlem tarihi`, müşteriye ait en son aktiviteden türetilir
- Ayrı bir `lastActivity` alanı tutulmaz, manuel güncellenmez
- `SELECT * FROM activities WHERE customerId = ? ORDER BY date DESC LIMIT 1` ile elde edilir

---

## Klasör Yapısı

```
src/
├── db/
│   ├── client.ts                    → SQLite Singleton bağlantısı
│   └── migrations/
│       └── 001_initial.sql          → Tablo oluşturma
├── repositories/
│   ├── customer.repository.ts       → Müşteri CRUD
│   ├── activity.repository.ts       → Aktivite CRUD + son aktivite sorgusu
│   └── term.repository.ts           → Termin CRUD + durum güncelleme
├── store/
│   ├── customer.store.ts
│   ├── activity.store.ts
│   └── term.store.ts
├── screens/
│   ├── HomeScreen.tsx               → Özet + Takvim + Günlük aktiviteler
│   ├── CustomerListScreen.tsx       → Arama + Liste
│   ├── CustomerDetailScreen.tsx     → Müşteri detay + aktivite geçmişi
│   ├── CustomerEditScreen.tsx       → Müşteri düzenleme (silme yok)
│   └── TermListScreen.tsx           → Termin listesi
├── modals/
│   ├── NewCustomerModal.tsx
│   ├── NewActivityModal.tsx
│   └── NewTermModal.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Spinner.tsx
│   │   └── SummaryCard.tsx          → Ana sayfa özet kartı
│   ├── customer/
│   │   ├── CustomerCard.tsx         → Liste satırı
│   │   └── CustomerSearchBar.tsx
│   ├── activity/
│   │   └── ActivityItem.tsx         → Tarih + tür + not
│   ├── term/
│   │   └── TermCard.tsx             → Termin kartı + "Geldi" aksiyonu
│   └── calendar/
│       └── MonthCalendar.tsx        → Aylık takvim + işaretli günler
├── navigation/
│   ├── RootNavigator.tsx
│   ├── BottomTabNavigator.tsx
│   └── stacks/
│       ├── HomeStack.tsx
│       ├── CustomerStack.tsx
│       └── TermStack.tsx
├── hooks/
│   ├── useCustomers.ts
│   ├── useActivities.ts
│   └── useTerms.ts
├── utils/
│   ├── dateUtils.ts                 → Formatlama, isToday, isBefore
│   └── backupUtils.ts               → JSON export/import
├── constants/
│   ├── activityTypes.ts             → Sabit aktivite türleri listesi
│   └── termStatus.ts                → 'Bekleniyor' | 'Geldi'
└── types/
    ├── customer.types.ts
    ├── activity.types.ts
    └── term.types.ts
```

---

## Ekranlar

### 1. Ana Sayfa — `HomeScreen`

**Üst Özet Kartları:**

- Toplam müşteri sayısı
- Aktif termin sayısı (`status = 'Bekleniyor'`)
- Bugünkü aktivite sayısı

**Aylık Takvim:**

- Aylar arası geçiş (ileri / geri ok)
- Aktivite olan günlerde küçük nokta işareti
- Seçilen gün belirgin gösterilir
- Seçilen güne ait aktiviteler takvimin altında listelenir

**Aktivite Ekleme:**

- Ana sayfadan "Aktivite Ekle" butonuna basılır
- `NewActivityModal` açılır
- Tarih seçili günden otomatik gelir
- Müşteri seçimi zorunludur
- Aktivite türü seçilir
- Not girilir
- İsteğe bağlı: bir termin ile ilişkilendirilebilir

---

### 2. Müşteriler — `CustomerListScreen`

- Üstte arama alanı
- `FlatList` ile müşteri listesi

**Her `CustomerCard` satırında:**

- Müşteri adı
- Şirket adı
- Son işlem tarihi
- Son işlem türü (son aktiviteden türetilir)

---

## UI Notu

- Buton rengi sayfa arka planından veya bulunduğu yüzeyden belirgin şekilde ayrışıyorsa border kullanma.
- Buton rengi sayfa arka planı veya bulunduğu yüzey ile aynıya çok yakınsa, ancak o zaman border kullan.
- Bu kural varsayılan görsel karar olarak kabul edilir.

**Sağ üst:**

- "Yeni Müşteri" butonu → `NewCustomerModal` açar

---

### 3. Yeni Müşteri Modalı — `NewCustomerModal`

**Alanlar:**

- Müşteri adı (zorunlu)
- Şirket adı (zorunlu)
- Telefon (optional)
- Email (optional)

---

### 4. Müşteri Detay — `CustomerDetailScreen`

**Üst bilgi:**

- Müşteri adı
- Şirket adı
- Telefon (varsa)
- Email (varsa)
- Son işlem tarihi
- Son işlem türü
- Aktif termin sayısı

**Aksiyon butonları:**

- "Aktivite Ekle" → `NewActivityModal` açar (müşteri önceden seçili gelir)
- "Müşteriyi Düzenle" → `CustomerEditScreen` açar

**Aktivite Geçmişi:**

- Tüm aktiviteler tarih sırasıyla (en yeni üstte)
- Her `ActivityItem` satırında: tarih + aktivite türü + not (varsa)

> Silme butonu yoktur. Swipe-to-delete yoktur.

---

### 5. Müşteri Düzenle — `CustomerEditScreen`

**Alanlar:**

- Müşteri adı
- Şirket adı
- Telefon
- Email

> Silme seçeneği yoktur. Yalnızca düzenleme yapılır.

---

### 6. Yeni Aktivite Modalı — `NewActivityModal`

**Alanlar:**

- Tarih (zorunlu)
- Müşteri seç (zorunlu)
- Aktivite türü — sabit liste (zorunlu)
- Not
- İlgili termin (optional — o müşterinin açık terminleri listelenir)

**Bağlam kuralı:**

- Müşteri detaydan açıldıysa → müşteri alanı kilitli, önceden dolu gelir
- Ana sayfadan açıldıysa → müşteri seçimi boş ve zorunludur

---

### 7. Terminler — `TermListScreen`

**Her `TermCard` kartında:**

- Müşteri adı
- Ürün adı
- Sipariş tarihi
- Termin süresi
- Beklenen tarih
- Durum (`Bekleniyor` / `Geldi`)
- Geldiyse: geldi tarihi

**Aksiyon:**

- `"Geldi Olarak İşaretle"` butonu → status `'Geldi'` yapılır, `arrivedAt` bugünün tarihi olur, müşteriye otomatik `"Ürün geldi"` aktivitesi eklenir

**Sağ üst:**

- "Yeni Termin" butonu → `NewTermModal` açar

---

### 8. Yeni Termin Modalı — `NewTermModal`

**Alanlar:**

- Müşteri seç (zorunlu)
- Ürün adı (zorunlu)
- Sipariş tarihi (zorunlu)
- Termin süresi (zorunlu)
- Beklenen tarih (zorunlu)
- Durum (default: `Bekleniyor`)

---

## Layout Felsefesi — Spacing Kuralları

### Temel Kural: flex + gap

`marginTop`, `marginBottom`, `marginRight`, `marginLeft` ile elementler arası boşluk **verilmez.** Parent container'da `flexDirection` + `gap` kullanılır.

```tsx
// ❌ YANLIŞ
<View>
  <Button style={{ marginBottom: 12 }}>İptal</Button>
  <Button>Kaydet</Button>
</View>

// ✅ DOĞRU
<View className="flex-col gap-3">
  <Button>İptal</Button>
  <Button>Kaydet</Button>
</View>

// ✅ YANYANA
<View className="flex-row items-center gap-3">
  <Button>İptal</Button>
  <Button>Kaydet</Button>
</View>
```

### Sık Kullanılan Pattern'ler

```tsx
// İkon + metin
<View className="flex-row items-center gap-2">
  <Icon size={16} />
  <Text>Metin</Text>
</View>

// İki uca yay
<View className="flex-row items-center justify-between">
  <Text className="text-lg font-semibold">Başlık</Text>
  <TouchableOpacity><Text className="text-sm text-primary">Tümü</Text></TouchableOpacity>
</View>

// Kart içi
<View className="flex-col gap-3 p-4">
  <Text className="font-semibold">{customer.customerName}</Text>
  <Text className="text-sm text-gray-500">{customer.companyName}</Text>
</View>

// Buton grubu
<View className="flex-row gap-2 pt-4">
  <Button variant="secondary" className="flex-1">İptal</Button>
  <Button variant="primary" className="flex-1">Kaydet</Button>
</View>
```

### Gap Referans Tablosu

```
gap-1  → 4px   ikon + metin arası
gap-2  → 8px   küçük bileşen arası
gap-3  → 12px  form alanları arası
gap-4  → 16px  section içi bloklar
gap-6  → 24px  section'lar arası

p-3    → 12px  küçük kart
p-4    → 16px  standart kart
p-5    → 20px  büyük form
```

> `mt-`, `mb-`, `mr-`, `ml-` yasaktır. Tek istisna: SafeAreaView kenar boşluğu için `pt-` / `pb-` kullanılabilir.

---

## Teknik Kurallar

### SQLite — Singleton

```typescript
// db/client.ts
import { open, QuickSQLiteConnection } from 'react-native-quick-sqlite';

let db: QuickSQLiteConnection | null = null;

export function getDB(): QuickSQLiteConnection {
  if (!db) {
    db = open({ name: 'sahaapp.db' });
  }
  return db;
}
```

### Repository Pattern

SQL sorguları component veya store içine yazılmaz. Tüm veritabanı işlemleri `repositories/` altında toplanır.

```typescript
// repositories/customer.repository.ts
import { getDB } from '../db/client';
import type { Customer } from '../types/customer.types';

export function getAllCustomers(): Customer[] {
  const db = getDB();
  const result = db.execute(
    'SELECT * FROM customers ORDER BY customerName ASC',
  );
  return result.rows?._array ?? [];
}

export function getLastActivity(customerId: number) {
  const db = getDB();
  const result = db.execute(
    'SELECT * FROM activities WHERE customerId = ? ORDER BY date DESC LIMIT 1',
    [customerId],
  );
  return result.rows?._array?.[0] ?? null;
}

export function insertCustomer(
  data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
): void {
  const db = getDB();
  db.execute(
    'INSERT INTO customers (customerName, companyName, phone, email) VALUES (?, ?, ?, ?)',
    [
      data.customerName,
      data.companyName,
      data.phone ?? null,
      data.email ?? null,
    ],
  );
}
```

### Zustand Store — Sade

```typescript
// store/customer.store.ts
import { create } from 'zustand';
import {
  getAllCustomers,
  insertCustomer,
} from '../repositories/customer.repository';
import type { Customer } from '../types/customer.types';

interface CustomerStore {
  customers: Customer[];
  isLoading: boolean;
  load: () => void;
  add: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const useCustomerStore = create<CustomerStore>(set => ({
  customers: [],
  isLoading: false,
  load: () => {
    set({ isLoading: true });
    const data = getAllCustomers();
    set({ customers: data, isLoading: false });
  },
  add: data => {
    insertCustomer(data);
    set({ customers: getAllCustomers() });
  },
}));
```

### Constants — Aktivite Türleri

```typescript
// constants/activityTypes.ts
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
```

```typescript
// constants/termStatus.ts
export const TERM_STATUS = {
  PENDING: 'Bekleniyor',
  ARRIVED: 'Geldi',
} as const;

export type TermStatus = (typeof TERM_STATUS)[keyof typeof TERM_STATUS];
```

### Tarih Yönetimi

```typescript
// utils/dateUtils.ts
export function isToday(dateStr: string): boolean {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}
```

### FlatList — Liste İçin Her Zaman

```tsx
// ❌ YANLIŞ
<ScrollView>
  {customers.map(c => <CustomerCard key={c.id} customer={c} />)}
</ScrollView>

// ✅ DOĞRU
<FlatList
  data={customers}
  keyExtractor={item => item.id.toString()}
  renderItem={({ item }) => <CustomerCard customer={item} />}
  ItemSeparatorComponent={() => <View className="h-2" />}
  ListEmptyComponent={<EmptyState message="Henüz müşteri eklenmedi" />}
/>
```

### SQL — Parametreli Sorgu Zorunlu

```typescript
// ❌ YANLIŞ — SQL Injection açığı
db.execute(`SELECT * FROM customers WHERE customerName = '${name}'`);

// ✅ DOĞRU
db.execute('SELECT * FROM customers WHERE customerName = ?', [name]);
```

### Termin "Geldi" Akışı

```typescript
// repositories/term.repository.ts
import { getDB } from '../db/client';
import { todayISO } from '../utils/dateUtils';
import { insertActivity } from './activity.repository';

export function markTermAsArrived(termId: number, customerId: number): void {
  const db = getDB();
  const today = todayISO();
  db.execute("UPDATE terms SET status = 'Geldi', arrivedAt = ? WHERE id = ?", [
    today,
    termId,
  ]);
  insertActivity({
    customerId,
    date: today,
    type: 'Ürün geldi',
    note: null,
    relatedTermId: termId,
  });
}
```

### Yedekleme

```typescript
// utils/backupUtils.ts
import { getAllCustomers } from '../repositories/customer.repository';
import { getAllActivities } from '../repositories/activity.repository';
import { getAllTerms } from '../repositories/term.repository';
import Share from 'react-native-share';

export async function exportBackup(): Promise<void> {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    customers: getAllCustomers(),
    activities: getAllActivities(),
    terms: getAllTerms(),
  };
  await Share.open({
    title: 'SahaApp Yedek',
    message: JSON.stringify(payload, null, 2),
    filename: `sahaapp_backup_${todayISO()}.json`,
  });
}
```

---

## Tasarım Beklentisi

- Temiz, minimal, modern
- Büyük dokunma alanları (minimum 48px yükseklik)
- Büyük ve okunaklı tipografi
- Sade kartlar, az renk
- Yaşça büyük kullanıcı için kolay kullanım
- Kurumsal dashboard hissi değil — gerçek mobil uygulama hissi
- Her ekranda: loading state + empty state + error state

---

## Geliştirme Fazları

Her faz tamamlanmadan bir sonrakine geçilmez.

### FAZ 1 — Proje Kurulumu

- [ ] React Native CLI projesi (TypeScript template)
- [ ] NativeWind kurulumu + config
- [ ] React Navigation kurulumu (Stack + Bottom Tab)
- [ ] `react-native-quick-sqlite` kurulumu
- [ ] Zustand kurulumu
- [ ] React Hook Form + Zod kurulumu
- [ ] Klasör yapısını oluştur
- [ ] SQLite Singleton client
- [ ] `001_initial.sql` migration (3 tablo)
- [ ] Android emülatörde çalışıyor mu kontrol et
- [ ] README.md

### FAZ 2 — Müşteri Modülü

- [ ] `customer.repository.ts` — getAll, getById, insert, update
- [ ] `customer.store.ts`
- [ ] `CustomerListScreen` — FlatList + arama
- [ ] `CustomerCard` — son aktiviteden son işlem türetme
- [ ] `NewCustomerModal` — Zod validasyonu
- [ ] `CustomerDetailScreen` — bilgiler (aktiviteler sonraki fazda)
- [ ] `CustomerEditScreen` — düzenleme, silme yok
- [ ] Loading + empty state

### FAZ 3 — Aktivite Modülü

- [ ] `activity.repository.ts` — insert, getByCustomer, getByDate
- [ ] `activity.store.ts`
- [ ] `NewActivityModal` — bağlam kuralı (detay vs ana sayfa)
- [ ] `ActivityItem` bileşeni
- [ ] `CustomerDetailScreen`'e aktivite geçmişi ekle
- [ ] `CustomerCard`'da son işlem göster

### FAZ 4 — Termin Modülü

- [ ] `term.repository.ts` — insert, getAll, markAsArrived
- [ ] `term.store.ts`
- [ ] `TermListScreen` — kart listesi
- [ ] `TermCard` — "Geldi" aksiyonu
- [ ] `NewTermModal`
- [ ] `markTermAsArrived` → arrivedAt + otomatik aktivite
- [ ] `CustomerDetailScreen`'e aktif termin sayısı ekle

### FAZ 5 — Ana Sayfa

- [ ] Özet kartları (toplam müşteri, aktif termin, bugünkü aktivite)
- [ ] `MonthCalendar` bileşeni — işaretli günler
- [ ] Seçili günün aktiviteleri
- [ ] Ana sayfadan aktivite ekleme

### FAZ 6 — Yedekleme & Ayarlar

- [ ] `backupUtils.ts` — export
- [ ] `backupUtils.ts` — import (mevcut veriyi sil + yükle)
- [ ] İmport öncesi onay dialogu
- [ ] Ayarlar ekranı (export / import butonları + uygulama versiyonu)

### FAZ 7 — Polish

- [ ] Loading skeleton tüm listelerde
- [ ] EmptyState tüm listelerde
- [ ] Error boundary
- [ ] Uygulama ikonu + splash screen
- [ ] Release APK build

---

## Protokoller

### Definition of Done — Her Task Sonunda

```
✅ DEFINITION OF DONE
[ ] Ekran / bileşen çalışıyor
[ ] Android emülatörde test edildi
[ ] Fiziksel cihazda test edildi
[ ] Loading state var
[ ] Empty state var
[ ] Hata durumu handle ediliyor
[ ] flex + gap ile layout yapıldı (margin yok)
[ ] Anlamlı commit mesajı yazıldı
```

### Git Commit Örnekleri

```
chore: init React Native CLI project with TypeScript and NativeWind
feat(db): add SQLite Singleton client and initial migration
feat(customers): add customer list screen with search
feat(customers): add new customer modal with Zod validation
feat(customers): add customer detail and edit screens
feat(activities): add activity modal with context-aware customer field
feat(activities): show last activity on customer card
feat(terms): add term list screen and new term modal
feat(terms): mark term as arrived with auto activity insert
feat(home): add monthly calendar with activity indicators
feat(backup): add JSON export and import via Share API
fix(layout): replace marginBottom with flex-col gap-3
```

### Debugging Protokolü

```
🐛 HATA ALDIN
1. Metro bundler log'unda ne yazıyor?
2. Android Logcat'te hata var mı?
3. Hangi ekranda / hangi satırda patlıyor?
4. En son ne değişti?
```

---

## KURALLAR — ASLA DEĞİŞMEZ

### Kod Kuralları

```
1.  TypeScript strict — any yasak, her tip tanımlanacak
2.  FlatList — liste için ScrollView kullanılmaz
3.  flex + gap — mt-, mb-, mr-, ml- ile boşluk verilmez
4.  Repository Pattern — SQL sorgusu store veya component içine yazılmaz
5.  Parametreli sorgu — SQL'de string interpolation yasak
6.  Singleton DB — getDB() kullanılır, yeni bağlantı açılmaz
7.  constants — magic string yok, activityTypes ve termStatus sabitlerden gelir
8.  Zod — form validasyonu elle yazılmaz
9.  Her ekran: loading state + empty state + error state zorunlu
10. Tarih: tr-TR locale, todayISO() ile üret
```

### Asla Yapılmayacaklar

```
- ScrollView içine liste koymak
- margin ile elementler arası boşluk vermek
- SQL'i doğrudan store veya screen içinde yazmak
- String interpolation ile SQL yazmak
- any tipi kullanmak
- Silme (delete) özelliği eklemek
- Swipe-to-delete eklemek
- Backend, Firebase, Supabase, auth önermek
- Çok kullanıcılı yapı önermek
- Cloud sync önermek
- Aktivite türlerine sabit listeden farklı değer eklemek
- "Son işlem" için ayrı bir alan tutmak, en son aktiviteden türet
```

---

## LESSONS — HATALARDAN ÖĞREN

Bu liste proje boyunca güncellenir. Her faz başında okunur.

### Format

```
[FAZ X - Tarih] Hata: ... → Doğrusu: ... → Kural: ...
```

### Mevcut Lessons

```
Henüz eklenmedi. Proje ilerledikçe buraya eklenecek.
```

### Self-Update Talimatı

```
Bir hata tespit edilince:
1. Hatayı tespit et
2. Doğrusunu göster
3. Lessons listesine ekle:
   "[FAZ X - Tarih] Hata: [ne yapıldı] → Doğrusu: [ne yapılmalıydı] → Kural: [genel kural]"
4. Sonraki benzer durumda "Daha önce bunu yaşadık" de

Aynı hata 2 kez tekrarlanırsa KURALLAR bölümüne de ekle.
```

## UYGULAMA YÜRÜTME PLANI — ADIM ADIM İLERLEME KURALI

Bu bölüm mevcut agent dosyasını bozmaz. Amaç, projeyi bir anda yazmak yerine kontrollü, dosya dosya, faz faz ilerletmektir.

### Ana Kural

- Kod bir anda topluca yazılmaz
- Her adım küçük, test edilebilir ve geri alınabilir olur
- Bir faz tamamen bitmeden sonraki faza geçilmez
- Her adımda önce dosya yapısı kurulur, sonra veri katmanı, sonra ekran, sonra bağlantılar yapılır
- Her adımdan sonra uygulama ayağa kaldırılıp kontrol edilir

### Mevcut Başlangıç Durumu

Projede şu anda mevcut temel yapı vardır:

- `src/assets`
- `src/i18n`
- `src/navigation`
- `src/screens`
- `src/types`

Bu mevcut yapı korunacaktır. `i18n` kaldırılmayacaktır. Uygulama en az Türkçe ve İngilizce destekleyecek şekilde ilerletilir.

### i18n Kararı

- i18n kalır
- İlk diller:
  - Türkçe (`tr`)
  - İngilizce (`en`)
- Ancak geliştirme sürecinde önce Türkçe metinlerle ilerlenebilir
- İngilizce çeviri ana akış oturduktan sonra tamamlanabilir
- Ekran label’ları ve sabit kullanıcı metinleri sonradan merkezi çeviri dosyasına taşınabilir

---

## FAZ 0 — PROJEYİ TEMİZ BAŞLANGIÇ NOKTASINA SABİTLE

### Amaç

Mevcut boilerplate’i bu uygulamaya uygun, temiz başlangıç noktasına getirmek.

### Yapılacaklar

- Mevcut gereksiz demo ekranları belirlenir
- Kullanılmayacak boilerplate içerikleri temizlenir
- App giriş akışı sadeleştirilir
- Navigation geçici olarak minimum çalışır hale getirilir
- Uygulama şu anda sadece boş ama çalışan bir iskelet halinde açılmalıdır

### Bu fazda kodlanacak şeyler

- Navigation sadeleştirme
- Home / Customers / Terms placeholder ekranları
- Uygulama açılıyor mu kontrolü

### Faz bitiş kriteri

- Android emülatörde app açılıyor
- Tab navigation veya root navigation çalışıyor
- Boş ekranlar arasında geçiş var
- Crash yok

---

## FAZ 1 — KLASÖR YAPISINI TAM KUR

### Amaç

Kod yazmadan önce projeyi hedef mimariye uygun klasörlere ayırmak.

### Hedef klasörler

```txt
src/
├── assets/
├── i18n/
├── navigation/
├── screens/
├── types/
├── db/
├── repositories/
├── store/
├── components/
│   ├── ui/
│   ├── customer/
│   ├── activity/
│   ├── term/
│   └── calendar/
├── modals/
├── hooks/
├── utils/
└── constants/
```

---

## FAZLAR — ADIM ADIM GELİŞTİRME PLANI

Bu projede tüm kod bir anda yazılmaz. Küçük, test edilebilir ve geri alınabilir adımlarla ilerlenir. Her faz bitmeden sonraki faza geçilmez. Mevcut agent dosyasındaki mimari korunur. :contentReference[oaicite:0]{index=0}

### Genel Çalışma Kuralı

- Her adım küçük olacak
- Önce dosya yapısı
- Sonra tipler ve sabitler
- Sonra veritabanı
- Sonra repository
- Sonra store
- Sonra ekranlar
- Sonra polish
- Her adımdan sonra uygulama çalıştırılıp kontrol edilecek
- Tüm uygulama tek seferde yazılmayacak

---

## FAZ 0 — Boilerplate’i sabitle

Amaç:
Mevcut React Native CLI + NativeWind boilerplate’ini bu projeye uygun başlangıç noktasına getirmek.

Yapılacaklar:

- Gereksiz demo ekranları belirle
- Mevcut navigation’ı geçici olarak sade tut
- i18n kalsın
- TR + EN destek devam etsin
- App açılıyor mu kontrol et

Bitiş kriteri:

- Uygulama açılıyor
- Crash yok
- Proje temiz başlangıç halinde

---

## FAZ 1 — Klasör yapısı

Amaç:
Hedef mimariye uygun klasörleri oluşturmak.

Oluşturulacak klasörler:

- db
- repositories
- store
- components
- modals
- hooks
- utils
- constants

components altı:

- ui
- customer
- activity
- term
- calendar

Bitiş kriteri:

- Klasör yapısı hazır
- Proje hâlâ çalışıyor

---

## FAZ 2 — Types ve constants

Amaç:
Veri tiplerini ve sabitleri en başta netleştirmek.

Oluşturulacak dosyalar:

- customer.types.ts
- activity.types.ts
- term.types.ts
- activityTypes.ts
- termStatus.ts

Bitiş kriteri:

- Customer, Activity, Term tipleri hazır
- Aktivite türleri sabit
- Termin durumları sabit

---

## FAZ 3 — Database temel kurulum

Amaç:
SQLite bağlantısını kurmak ve tabloları tanımlamak.

Oluşturulacak dosyalar:

- db/client.ts
- db/init.ts
- db/migrations/001_initial.sql

Yapılacaklar:

- SQLite bağlantısı
- customers tablosu
- activities tablosu
- terms tablosu
- app açılışında DB init

Bitiş kriteri:

- App açılınca DB initialize oluyor
- Crash yok

---

## FAZ 4 — Repository katmanı

Amaç:
SQL sorgularını tek yerde toplamak.

Oluşturulacak dosyalar:

- customer.repository.ts
- activity.repository.ts
- term.repository.ts

İlk fonksiyonlar:

- customer: getAll, getById, insert, update
- activity: insert, getByCustomer, getByDate, getLastByCustomer
- term: insert, getAll, getByCustomer, markAsArrived

Bitiş kriteri:

- Repository fonksiyonları çalışıyor
- SQL component içine yazılmıyor

---

## FAZ 5 — Zustand store

Amaç:
UI ile repository arasında sade state yönetimi kurmak.

Oluşturulacak dosyalar:

- customer.store.ts
- activity.store.ts
- term.store.ts

Bitiş kriteri:

- Veri yükleniyor
- Ekleme sonrası state yenileniyor
- Store mantığı sade

---

## FAZ 6 — Navigation final hale getirme

Amaç:
Gerçek ekran akışını kurmak.

Hedef:

- Bottom tabs
  - Home
  - Customers
  - Terms
- Stack navigation
  - Customer detail
  - Customer edit
  - Modals

Bitiş kriteri:

- Tüm ana ekranlara geçiş var
- Detail/edit akışı çalışıyor

---

## FAZ 7 — Müşteri modülü

Amaç:
İlk tam çalışan modülü bitirmek.

Oluşturulacaklar:

- CustomerListScreen
- CustomerDetailScreen
- CustomerEditScreen
- NewCustomerModal
- CustomerCard
- CustomerSearchBar

Sıra:

1. Liste
2. Kart
3. Arama
4. Yeni müşteri ekleme
5. Detay
6. Düzenleme

Bitiş kriteri:

- Müşteri ekleniyor
- Listeleniyor
- Detayı açılıyor
- Düzenleniyor
- Silme yok

---

## FAZ 8 — Aktivite modülü

Amaç:
Müşteri geçmişi ve son işlem mantığını çalıştırmak.

Oluşturulacaklar:

- NewActivityModal
- ActivityItem

Sıra:

1. Aktivite ekleme
2. Müşteri detayda aktivite geçmişi
3. Son işlem = en son aktivite type

Bitiş kriteri:

- Aktivite ekleniyor
- Müşteri detayda görünüyor
- Son işlem otomatik hesaplanıyor

---

## FAZ 9 — Termin modülü

Amaç:
Terminleri takip etmek.

Oluşturulacaklar:

- TermListScreen
- NewTermModal
- TermCard

Sıra:

1. Termin oluştur
2. Listele
3. Geldi olarak işaretle
4. ArrivedAt otomatik yaz
5. İlgili müşteriye “Ürün geldi” aktivitesi ekle

Bitiş kriteri:

- Termin çalışıyor
- Geldi akışı çalışıyor
- Müşteriyle bağlı çalışıyor

---

## FAZ 10 — Ana sayfa ve takvim

Amaç:
Takvim tabanlı genel görünüm kurmak.

Oluşturulacaklar:

- HomeScreen
- SummaryCard
- MonthCalendar

İçerik:

- Toplam müşteri
- Aktif termin
- Bugünkü aktivite
- Aylık takvim
- Seçilen gün aktiviteleri
- Ana sayfadan aktivite ekleme

Bitiş kriteri:

- Gün seçilebiliyor
- O günün aktiviteleri listeleniyor
- Yeni aktivite eklenebiliyor

---

## FAZ 11 — Yedekleme

Amaç:
Veri kaybını önlemek.

Oluşturulacaklar:

- backupUtils.ts
- gerekirse SettingsScreen güncellemesi

İçerik:

- JSON export
- JSON import
- Uyarı: mevcut veri silinecek

Bitiş kriteri:

- Yedek alınabiliyor
- Yedek yüklenebiliyor

---

## FAZ 12 — i18n entegrasyonu

Amaç:
TR + EN metinleri düzenlemek.

Yapılacaklar:

- Hardcoded metinleri translation dosyalarına taşı
- Buton, başlık, empty state metinlerini çevir
- UI label’larını i18n ile yönet

Bitiş kriteri:

- Türkçe ve İngilizce geçiş düzgün
- Ana ekranlar çevrilmiş

---

## FAZ 13 — Polish

Amaç:
Uygulamayı son hale getirmek.

Yapılacaklar:

- Loading state
- Empty state
- Error state
- UI düzeltmeleri
- Icon
- Splash
- Release APK

Bitiş kriteri:

- Kullanılabilir temiz sürüm hazır

---

## ÇALIŞMA KURALI

Bu proje şu sırayla ilerler:

1. Hangi fazdayız belirlenir
2. O faz için sadece gerekli dosyalar açılır
3. Sadece o adımın kodu yazılır
4. Uygulama test edilir
5. Kullanıcı onayı alınır
6. Sonraki adıma geçilir

## YASAKLAR

- Tüm app’i bir cevapta yazmak
- Gelecekteki fazların kodunu erkenden yazmak
- Agent dosyasındaki mimariyi sessizce değiştirmek
- Delete özelliği eklemek
- Cloud/backend/auth önermek
