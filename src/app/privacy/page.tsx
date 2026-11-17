import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { BRAND, PRIVACY_CONTACT, telHref } from "@/config/store";

import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati",
  description: `${BRAND} veb-sayti foydalanuvchilarining ma’lumotlari qanday to‘planishi, ishlatilishi va o‘chirilishi.`,
};

/** Change whenever the policy text changes; shown under the title. */
const UPDATED = "2026-yil 17-noyabr";

/* Keep this in step with what the checkout actually sends (CheckoutForm, /api/orders). */
export default function PrivacyPage() {
  const { phones, email } = PRIVACY_CONTACT;
  return (
    <Container className={styles.page}>
      <Breadcrumbs items={[{ label: "Bosh sahifa", href: "/" }, { label: "Maxfiylik siyosati" }]} />
      <article className={styles.body}>
        <h1>Maxfiylik siyosati</h1>
        <p className={styles.updated}>Oxirgi yangilanish: {UPDATED}</p>

        <p>
          Ushbu siyosat {BRAND} veb-saytida ma’lumotlaringiz qanday to‘planishi, ishlatilishi va o‘chirilishini
          tushuntiradi. Reklama va kuzatuv xizmatlari ishlatilmaydi, ma’lumotlaringiz sotilmaydi.
        </p>

        <h2>1. Buyurtma berganda nima yuboriladi</h2>
        <ul>
          <li>Ismingiz va telefon raqamingiz.</li>
          <li>Yetkazib berish usuli, manzil va mo‘ljal (yetkazib berish tanlansa).</li>
          <li>Xaritadagi nuqta: faqat «Meni topish» tugmasini bossangiz yoki manzilni xaritada belgilasangiz.</li>
          <li>To‘lov usuli va savatdagi mahsulotlar.</li>
          <li>Mijoz ID raqamingiz: agar ID bilan kirgan bo‘lsangiz.</li>
        </ul>
        <p>
          Bu ma’lumotlar faqat buyurtmani bajarish va siz bilan bog‘lanish uchun ishlatiladi. Do‘kon buyurtmalarni
          dukonline.uz do‘kon tizimida yuritadi.
        </p>

        <h2>2. Joylashuv</h2>
        <p>
          Biz joylashuvingizni kuzatmaymiz. U siz tugmani bosganingizda bir marta aniqlanadi va faqat yetkazib berish
          manzili uchun ishlatiladi. Manzil matnini topish uchun koordinatalar OpenStreetMap (Nominatim) xizmatiga
          yuboriladi; xarita ochilganda uning tasvirlari ham OpenStreetMap serverlaridan yuklanadi. Manzilni qo‘lda
          yozishingiz ham mumkin.
        </p>

        <h2>3. Mijoz ID bilan kirish</h2>
        <p>
          Do‘kon bergan ID qurilmangizda saqlanadi, shunda shaxsiy narxlar, qarz, xaridlar va to‘lovlaringiz
          ko‘rsatiladi. Saytda hisob ochilmaydi: ID faqat do‘kondan beriladi. «Chiqish» bosilsa, ID qurilmadan
          o‘chiriladi.
        </p>

        <h2>4. Qurilmada saqlanadigan ma’lumotlar</h2>
        <p>
          Savat va mijoz ID’si (kirgan bo‘lsangiz) brauzeringiz xotirasida va cookie faylida saqlanadi. Brauzer
          ma’lumotlari tozalansa, ular ham o‘chadi.
        </p>

        <h2>5. Kimlarga beriladi</h2>
        <ul>
          <li>dukonline.uz do‘kon tizimi: buyurtma va mijoz hisobini yuritish uchun.</li>
          <li>OpenStreetMap: xarita va manzilni aniqlash uchun (faqat koordinatalar).</li>
          <li>Qonun talab qilgan hollarda: vakolatli davlat organlarining rasmiy so‘roviga binoan.</li>
        </ul>
        <p>Saytning serverlari ishlash uchun umumiy texnik ma’lumotlarni (masalan, so‘rov vaqti) qayd etishi mumkin.</p>

        <h2>6. Ma’lumotlarni o‘chirish</h2>
        <p>
          Buyurtmalaringiz va hisobingizga oid ma’lumotlarni o‘chirish uchun quyidagi raqamlarga murojaat qiling. So‘rov qabul
          qilingach, ma’lumotlar oqilona muddatda o‘chiriladi (qonun bo‘yicha saqlanishi shart bo‘lganlaridan
          tashqari).
        </p>

        <h2>7. Bolalar</h2>
        <p>Xizmat bolalarga mo‘ljallanmagan va biz 13 yoshgacha bo‘lgan bolalardan bilib turib ma’lumot to‘plamaymiz.</p>

        <h2>8. O‘zgarishlar</h2>
        <p>O‘zgarishlar shu sahifada e’lon qilinadi va yuqoridagi sana yangilanadi.</p>

        {(phones.length > 0 || email) && (
          <>
            <h2>9. Bog‘lanish</h2>
            <p>Maxfiylik bo‘yicha savollar uchun:</p>
            <ul>
              {phones.map((phone) => (
                <li key={phone}>
                  <a href={telHref(phone)}>{phone}</a>
                </li>
              ))}
              {email && (
                <li>
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              )}
            </ul>
          </>
        )}
      </article>
    </Container>
  );
}
