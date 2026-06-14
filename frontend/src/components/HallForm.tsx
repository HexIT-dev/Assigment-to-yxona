import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Input, Select } from "./ui";
import { ImageUpload } from "./ui/ImageUpload";
import { TASHKENT_DISTRICTS } from "../lib/constants";
import type { Hall, HallInput, ServiceInput, ServiceType, User } from "../types";

interface SingerRow { name: string; price: string; imageUrl: string; }
interface MenuRow { name: string; imageUrl: string; }
interface CarRow { name: string; price: string; imageUrl: string; }

interface Props {
  initial?: Hall;
  owners?: User[];          // admin uchun
  showOwnerSelect?: boolean;
  onSubmit: (data: HallInput) => Promise<void> | void;
  submitting?: boolean;
  submitLabel?: string;
}

export function HallForm({ initial, owners = [], showOwnerSelect, onSubmit, submitting, submitLabel = "Saqlash" }: Props) {
  const [name, setName] = useState(initial?.name || "");
  const [district, setDistrict] = useState(initial?.district || "");
  const [address, setAddress] = useState(initial?.address || "");
  const [capacity, setCapacity] = useState(initial?.capacity?.toString() || "");
  const [pricePerSeat, setPricePerSeat] = useState(initial?.pricePerSeat?.toString() || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [ownerId, setOwnerId] = useState(initial?.ownerId || "");
  const [images, setImages] = useState<string[]>(initial?.images?.map((i) => i.url) || []);

  // Xizmatlar (turlar bo'yicha)
  const init = initial?.services || [];
  const [singers, setSingers] = useState<SingerRow[]>(
    init.filter((s) => s.type === "SINGER").map((s) => ({ name: s.name, price: String(s.price), imageUrl: s.imageUrl || "" }))
  );
  const [menus, setMenus] = useState<MenuRow[]>(
    init.filter((s) => s.type === "MENU").map((s) => ({ name: s.name, imageUrl: s.imageUrl || "" }))
  );
  const [cars, setCars] = useState<CarRow[]>(
    init.filter((s) => s.type === "CAR").map((s) => ({ name: s.name, price: String(s.price), imageUrl: s.imageUrl || "" }))
  );
  const karnayInit = init.find((s) => s.type === "KARNAY");
  const [karnay, setKarnay] = useState<boolean>(!!karnayInit);
  const [karnayPrice, setKarnayPrice] = useState(karnayInit ? String(karnayInit.price) : "");

  function buildServices(): ServiceInput[] {
    const list: ServiceInput[] = [];
    singers.filter((s) => s.name.trim()).forEach((s) =>
      list.push({ type: "SINGER", name: s.name, price: Number(s.price) || 0, imageUrl: s.imageUrl || undefined }));
    menus.filter((m) => m.name.trim()).forEach((m) =>
      list.push({ type: "MENU", name: m.name, price: 0, imageUrl: m.imageUrl || undefined }));
    cars.filter((c) => c.name.trim()).forEach((c) =>
      list.push({ type: "CAR", name: c.name, price: Number(c.price) || 0, imageUrl: c.imageUrl || undefined }));
    if (karnay) list.push({ type: "KARNAY", name: "Karnay-surnay", price: Number(karnayPrice) || 0 });
    return list;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name, district, address,
      capacity: Number(capacity), pricePerSeat: Number(pricePerSeat), phone,
      images, services: buildServices(),
      ownerId: showOwnerSelect ? (ownerId || null) : undefined,
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Asosiy ma'lumotlar */}
      <Section title="Asosiy ma'lumotlar">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="To'yxona nomi" required value={name} onChange={(e) => setName(e.target.value)} />
          <Select label="Rayon" required value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">Tanlang...</option>
            {TASHKENT_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Input label="Manzil" required value={address} onChange={(e) => setAddress(e.target.value)} />
          <Input label="Telefon raqam" required value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Sig'im (o'rindiqlar soni)" type="number" min={1} required value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          <Input label="Narx (1 o'rindiq, so'm)" type="number" min={0} required value={pricePerSeat} onChange={(e) => setPricePerSeat(e.target.value)} />
        </div>

        {showOwnerSelect && (
          <div className="mt-4">
            <Select label="To'yxona egasi" value={ownerId || ""} onChange={(e) => setOwnerId(e.target.value)}>
              <option value="">Biriktirilmagan</option>
              {owners.map((o) => <option key={o.id} value={o.id}>{o.firstName} {o.lastName} ({o.username})</option>)}
            </Select>
          </div>
        )}
      </Section>

      {/* Suratlar */}
      <Section title="Suratlar">
        <ImageUpload value={images} onChange={setImages} multiple max={10} />
      </Section>

      {/* Honanda */}
      <Section title="Honanda" action={<AddBtn onClick={() => setSingers([...singers, { name: "", price: "", imageUrl: "" }])} />}>
        {singers.length === 0 && <Empty />}
        <div className="space-y-3">
          {singers.map((s, i) => (
            <RepeatRow key={i} onRemove={() => setSingers(singers.filter((_, x) => x !== i))}>
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Input placeholder="Honanda ismi" value={s.name} onChange={(e) => setSingers(upd(singers, i, { name: e.target.value }))} />
                <Input placeholder="Narxi" type="number" value={s.price} onChange={(e) => setSingers(upd(singers, i, { price: e.target.value }))} />
              </div>
              <ImageUpload value={s.imageUrl ? [s.imageUrl] : []} onChange={(u) => setSingers(upd(singers, i, { imageUrl: u[0] || "" }))} multiple={false} max={1} />
            </RepeatRow>
          ))}
        </div>
      </Section>

      {/* Karnay-surnay */}
      <Section title="Karnay-surnay">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={karnay} onChange={(e) => setKarnay(e.target.checked)} className="h-4 w-4 accent-terracotta-500" />
          <span className="text-sm font-medium text-cobalt-700">Mavjud</span>
        </label>
        {karnay && (
          <div className="mt-3 max-w-xs">
            <Input label="Narxi" type="number" value={karnayPrice} onChange={(e) => setKarnayPrice(e.target.value)} />
          </div>
        )}
      </Section>

      {/* Menu */}
      <Section title="Menu (taomlar)" action={<AddBtn onClick={() => setMenus([...menus, { name: "", imageUrl: "" }])} />}>
        {menus.length === 0 && <Empty />}
        <div className="space-y-3">
          {menus.map((m, i) => (
            <RepeatRow key={i} onRemove={() => setMenus(menus.filter((_, x) => x !== i))}>
              <Input className="flex-1" placeholder="Taom nomi" value={m.name} onChange={(e) => setMenus(upd(menus, i, { name: e.target.value }))} />
              <ImageUpload value={m.imageUrl ? [m.imageUrl] : []} onChange={(u) => setMenus(upd(menus, i, { imageUrl: u[0] || "" }))} multiple={false} max={1} />
            </RepeatRow>
          ))}
        </div>
      </Section>

      {/* Mashina */}
      <Section title="Mashina" action={<AddBtn onClick={() => setCars([...cars, { name: "", price: "", imageUrl: "" }])} />}>
        {cars.length === 0 && <Empty />}
        <div className="space-y-3">
          {cars.map((c, i) => (
            <RepeatRow key={i} onRemove={() => setCars(cars.filter((_, x) => x !== i))}>
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Input placeholder="Brendi (masalan: Mercedes)" value={c.name} onChange={(e) => setCars(upd(cars, i, { name: e.target.value }))} />
                <Input placeholder="Narxi" type="number" value={c.price} onChange={(e) => setCars(upd(cars, i, { price: e.target.value }))} />
              </div>
              <ImageUpload value={c.imageUrl ? [c.imageUrl] : []} onChange={(u) => setCars(upd(cars, i, { imageUrl: u[0] || "" }))} multiple={false} max={1} />
            </RepeatRow>
          ))}
        </div>
      </Section>

      <div className="flex justify-end gap-3 border-t border-cream-300 pt-4">
        <Button type="submit" size="lg" loading={submitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}

/* ---------- helpers ---------- */
function upd<T>(arr: T[], i: number, patch: Partial<T>): T[] {
  return arr.map((item, x) => (x === i ? { ...item, ...patch } : item));
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-cream-300 bg-cream-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-display text-base font-bold text-cobalt-700">{title}</h4>
        {action}
      </div>
      {children}
    </div>
  );
}

function AddBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 rounded-lg bg-cobalt-50 px-2.5 py-1.5 text-xs font-semibold text-cobalt-600 hover:bg-cobalt-100">
      <Plus size={14} /> Qo'shish
    </button>
  );
}

function RepeatRow({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-cream-300 bg-white p-3 sm:flex-row sm:items-start">
      {children}
      <button type="button" onClick={onRemove} className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg text-[var(--color-danger)] hover:bg-terracotta-50">
        <Trash2 size={17} />
      </button>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-ink-soft/70">Hozircha qo'shilmagan.</p>;
}
