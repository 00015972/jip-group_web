"use client";

import { Banknote, Check, CreditCard, Crosshair, MapPin, ShoppingCart, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Segmented } from "@/components/ui/Segmented";
import { STORE_CONTACT } from "@/config/store";
import { toOrderItems, totalsInput } from "@/lib/cart/lines";
import { useCart } from "@/lib/cart/useCart";
import { useCustomer } from "@/lib/customer/useCustomer";
import { fmtNumber, groupTotal, money } from "@/lib/storefront/currency";
import type { CustomerAccountResponse, DeliveryType, OrderPayload } from "@/lib/storefront/types";

import styles from "./CheckoutForm.module.css";
import { MapPicker, reverseGeocode } from "./MapPicker";
import { OrderSuccess } from "./OrderSuccess";

const PAYMENTS = [
  { value: "cash", title: "Naqd pul", Icon: Banknote },
  { value: "card", title: "Karta orqali", Icon: CreditCard },
];

export function CheckoutForm() {
  const router = useRouter();
  const { items, ready, clear } = useCart();
  const { customer } = useCustomer();

  // Null means untouched, so the signed-in customer's profile can prefill
  // the fields without overwriting anything typed.
  const [name, setName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ code: string; name: string; phone: string } | null>(null);
  const [delivery, setDelivery] = useState<DeliveryType>("courier");
  const [payment, setPayment] = useState("cash");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [orderNo, setOrderNo] = useState<string | null>(null);
  const courier = delivery === "courier";
  const total = groupTotal(totalsInput(items));

  const code = customer?.customer_code;
  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    fetch(`/api/customer?code=${encodeURIComponent(code)}`)
      .then((response) => (response.ok ? (response.json() as Promise<CustomerAccountResponse>) : null))
      .then((data) => {
        if (cancelled || !data) return;
        const p = data.customer ?? {};
        setProfile({ code, name: p.name || p.customer_name || "", phone: p.phone || p.phone_number || "" });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [code]);

  const known = profile && profile.code === code ? profile : null;
  const nameValue = name ?? (known?.name || customer?.name || customer?.customer_name || "");
  const phoneValue = phone ?? (known?.phone || customer?.phone || customer?.phone_number || "");

  const locateMe = () => {
    if (!navigator.geolocation) {
      setError("Qurilma joylashuvni aniqlay olmaydi");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
        const found = await reverseGeocode(p.coords.latitude, p.coords.longitude);
        if (found) setAddress(found);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Joylashuvga ruxsat berilmadi");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nameValue.trim() || !phoneValue.trim()) {
      setError("Ism va telefon raqami majburiy");
      return;
    }
    if (courier && !address.trim() && !coords) {
      setError("Manzilni kiriting yoki xaritadan belgilang");
      return;
    }
    setError("");
    setSubmitting(true);

    const payload: OrderPayload = {
      customer_name: nameValue.trim(),
      phone: phoneValue.trim(),
      delivery_type: delivery,
      payment_method: payment,
      ...(courier ? { address: address.trim(), landmark: landmark.trim() } : {}),
      ...(courier && coords ? { latitude: coords.lat, longitude: coords.lng } : {}),
      ...(code ? { customer_code: code } : {}),
      items: toOrderItems(items),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      // Stock moved since the page loaded: a fresh catalog re-caps the cart.
      if (response.status === 409) router.refresh();
      if (!response.ok) throw new Error(data.error || "Xatolik yuz berdi");
      setOrderNo(data.order_no);
      clear();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderNo) return <OrderSuccess orderNo={orderNo} onClose={() => router.push("/")} />;
  if (!ready) return <div className={styles.skeleton} aria-busy="true" />;
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart size={32} aria-hidden />}
        title="Savat bo‘sh"
        text="Buyurtma berish uchun avval kerakli mahsulotni savatga qo‘shing."
        action={<ButtonLink href="/catalog">Katalogga o‘tish</ButtonLink>}
      />
    );
  }

  return (
    <form className={styles.layout} onSubmit={submit} noValidate>
      <div className={styles.form}>
        <h1 className={styles.title}>Buyurtmani rasmiylashtirish</h1>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Qabul qiluvchi</h2>
          <label className={styles.field}>
            <span className={styles.label}>Ismingiz</span>
            <input
              className={styles.input}
              autoComplete="name"
              value={nameValue}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ism Familiya"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Telefon raqam</span>
            <input
              className={styles.input}
              type="tel"
              autoComplete="tel"
              value={phoneValue}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+998 90 000 00 00"
            />
          </label>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Yetkazib berish</h2>
          <Segmented
            label="Yetkazib berish usuli"
            value={delivery}
            onChange={setDelivery}
            options={[
              { value: "courier", label: "Yetkazib berish" },
              { value: "pickup", label: "O‘zim olib ketaman" },
            ]}
          />
          {courier && (
            <>
              <label className={styles.field}>
                <span className={styles.label}>Manzil</span>
                <input
                  className={styles.input}
                  autoComplete="street-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Ko‘cha, uy, xonadon"
                />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Mo‘ljal (ixtiyoriy)</span>
                <input
                  className={styles.input}
                  value={landmark}
                  onChange={(event) => setLandmark(event.target.value)}
                  placeholder="Masalan: maktab yonidagi yangi uy"
                />
              </label>
              <div className={styles.locationButtons}>
                <Button variant="secondary" onClick={locateMe} disabled={locating} icon={<Crosshair size={16} aria-hidden />}>
                  {locating ? "Aniqlanmoqda..." : "Meni topish"}
                </Button>
                <Button variant="secondary" onClick={() => setMapOpen(true)} icon={<MapPin size={16} aria-hidden />}>
                  Xaritadan belgilash
                </Button>
              </div>
              {coords && (
                <p className={styles.located}>
                  <Check size={14} aria-hidden /> Joylashuv belgilandi
                </p>
              )}
            </>
          )}
          {!courier && (
            <p className={styles.pickup}>
              <Store size={18} aria-hidden />
              <span>
                {STORE_CONTACT.address ? (
                  <>
                    Olib ketish manzili: <strong>{STORE_CONTACT.address}</strong>
                    {STORE_CONTACT.landmark && ` (${STORE_CONTACT.landmark})`}
                  </>
                ) : (
                  "Buyurtma tayyor bo‘lganda do‘kon qo‘ng‘iroq qilib, olib ketish manzili va vaqtini aytadi."
                )}
              </span>
            </p>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>To‘lov usuli</h2>
          <p className={styles.paymentNote}>To‘lov naqd yoki karta orqali.</p>
          <div className={styles.payments} role="radiogroup" aria-label="To‘lov usuli">
            {PAYMENTS.map(({ value, title, Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={payment === value}
                className={styles.payment}
                onClick={() => setPayment(value)}
              >
                <Icon size={22} aria-hidden />
                <span className={styles.paymentText}>
                  <span className={styles.paymentTitle}>{title}</span>
                </span>
                <span className={styles.radio} aria-hidden />
              </button>
            ))}
          </div>
        </section>

      </div>

      <aside className={styles.summary}>
        <div className={styles.summaryHead}>
          <h2 className={styles.cardTitle}>Buyurtmangiz</h2>
        </div>
        <ul className={styles.items}>
          {items.map((item) => (
            <li key={item.key} className={styles.item}>
              <span className={styles.itemName}>
                {item.name}
                {item.option_label && <span className={styles.itemOption}> · {item.option_label}</span>}
                <span className={styles.itemAmount}>
                  {fmtNumber(item.qty)} {item.unit} × {money(item.cur_price, item.currency)}
                </span>
              </span>
              <span className={styles.itemTotal}>
                {money(item.cur_price * item.qty, item.currency)}
              </span>
            </li>
          ))}
        </ul>
        <div className={styles.total}>
          <span>Jami</span>
          <strong>{total}</strong>
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" block disabled={submitting} className={styles.submit}>
          {submitting ? (
            "Yuborilmoqda..."
          ) : (
            <>
              <span>Buyurtmani tasdiqlash</span>
              <span className={styles.submitAmount}>{total}</span>
            </>
          )}
        </Button>
      </aside>

      <MapPicker
        open={mapOpen}
        initial={coords}
        onPick={(lat, lng, found) => {
          setCoords({ lat, lng });
          if (found) setAddress(found);
          setMapOpen(false);
        }}
        onClose={() => setMapOpen(false)}
      />
    </form>
  );
}
