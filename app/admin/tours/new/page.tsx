"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addTour, getExchangeRate, setExchangeRate } from "@/lib/adminStore";
import type { ItineraryDay } from "@/types/admin";
import { ArrowLeft, Plus, X, Trash2, ImageIcon, RefreshCw } from "lucide-react";

const DURATIONS = [
  { text: "1 day", days: 1 }, { text: "2 days / 1 night", days: 2 }, { text: "3 days / 2 nights", days: 3 },
  { text: "4 days / 3 nights", days: 4 }, { text: "5 days / 4 nights", days: 5 }, { text: "6 days / 5 nights", days: 6 },
  { text: "7 days / 6 nights", days: 7 }, { text: "8 days / 7 nights", days: 8 }, { text: "9 days / 8 nights", days: 9 },
  { text: "10 days / 9 nights", days: 10 }, { text: "12 days / 11 nights", days: 12 }, { text: "14 days / 13 nights", days: 14 },
];

const GROUP_SIZES = ["Private (1–2 people)", "2–4 people", "2–6 people", "2–8 people", "2–10 people", "2–12 people", "2–15 people", "2–20 people"];

const HIGHLIGHT_OPTIONS = [
  "Masai Mara Game Reserve", "Serengeti National Park", "Ngorongoro Crater", "Amboseli National Park",
  "Tsavo East NP", "Tsavo West NP", "Lake Nakuru", "Samburu National Reserve", "Diani Beach",
  "Zanzibar Beach", "Watamu Beach", "Volcanoes National Park", "Nyungwe Forest", "Akagera NP",
  "Big Five wildlife", "Great Migration", "Hot air balloon safari", "Maasai Cultural Visit",
  "Gorilla Trekking", "Bush dinner", "Sunset dhow cruise", "Snorkeling", "Night game drive",
  "Bush walk", "Rhino tracking", "Elephant herds", "Bird watching", "Photography safari",
  "Mount Kenya views", "Stone Town Zanzibar",
];

const INCLUDES_OPTIONS = [
  "Accommodation", "Luxury lodges", "Mid-range lodges", "Private camp", "Beachfront resort", "Tented camp",
  "All meals", "Full board", "Half board", "Breakfast only", "Game drives", "Private vehicle",
  "Shared 4×4 van", "Private jeep", "Park fees", "Professional guide", "Expert guide", "Safari guide",
  "Airport transfers", "Domestic flights", "Flights within Tanzania", "Snorkeling", "Bush walk",
  "Cultural tour", "Maasai village visit",
];

const BADGE_PRESETS = ["Best Seller", "Luxury", "Adventure", "Special Offer", "Private", "Popular", "Budget Friendly", "Iconic", "Complete Package", "15% Off", "Group Tour", "New Package"];

const BADGE_COLORS = [
  { label: "Gold (Savanna)", value: "bg-savanna" },
  { label: "Dark Green (Forest)", value: "bg-forest" },
  { label: "Brown (Earth)", value: "bg-earth" },
  { label: "Olive (Moss)", value: "bg-moss" },
  { label: "Light Green", value: "bg-forest-light" },
];

function ChipSelect({ options, selected, onToggle, onAdd, onRemove }: {
  options: string[]; selected: string[];
  onToggle: (v: string) => void; onAdd: (v: string) => void; onRemove: (v: string) => void;
}) {
  const [custom, setCustom] = useState("");
  const nonPreset = selected.filter((s) => !options.includes(s));
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => onToggle(opt)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selected.includes(opt) ? "bg-savanna text-white border-savanna" : "bg-white text-gray-600 border-gray-200 hover:border-savanna/50"}`}>
            {selected.includes(opt) && "✓ "}{opt}
          </button>
        ))}
      </div>
      {nonPreset.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {nonPreset.map((opt) => (
            <span key={opt} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full">
              {opt}
              <button type="button" onClick={() => onRemove(opt)} className="hover:text-red-500 ml-1"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <input type="text" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add custom option…"
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          onKeyDown={(e) => { if (e.key === "Enter" && custom.trim()) { e.preventDefault(); onAdd(custom.trim()); setCustom(""); } }} />
        <button type="button" onClick={() => { if (custom.trim()) { onAdd(custom.trim()); setCustom(""); } }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-xl text-sm transition-colors">Add</button>
      </div>
    </div>
  );
}

export default function NewTour() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [rate, setRate] = useState(() => getExchangeRate());
  const [rateSaved, setRateSaved] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const [form, setForm] = useState({
    title: "",
    destination: "Kenya" as "Kenya" | "Tanzania" | "Rwanda",
    duration: "5 days / 4 nights",
    days: 5,
    priceksh: 0,
    priceusd: 0,
    groupSize: "2–8 people",
    image: "",
    badge: "Best Seller",
    badgeColor: "bg-savanna",
    active: true,
    description: "",
  });

  const [highlights, setHighlights] = useState<string[]>([]);
  const [includes, setIncludes] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  function setF<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleDuration(text: string) {
    const found = DURATIONS.find((d) => d.text === text);
    setForm((p) => ({ ...p, duration: text, days: found?.days ?? p.days }));
  }

  function handleKSH(v: number) {
    setForm((p) => ({ ...p, priceksh: v, priceusd: rate > 0 ? Math.round(v / rate) : p.priceusd }));
  }

  function handleUSD(v: number) {
    setForm((p) => ({ ...p, priceusd: v, priceksh: Math.round(v * rate) }));
  }

  function saveRate() {
    setExchangeRate(rate);
    setRateSaved(true);
    setTimeout(() => setRateSaved(false), 2000);
    if (form.priceksh > 0) {
      setForm((p) => ({ ...p, priceusd: rate > 0 ? Math.round(p.priceksh / rate) : p.priceusd }));
    }
  }

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Image too large. Please use an image under 2MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setImagePreview(result);
      setF("image", result);
    };
    reader.readAsDataURL(file);
  }

  function addDay() {
    setItinerary((p) => [...p, { day: p.length + 1, title: "", description: "", meals: "", accommodation: "" }]);
  }

  function updateDay(i: number, field: keyof ItineraryDay, value: string | number) {
    setItinerary((p) => p.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
  }

  function removeDay(i: number) {
    setItinerary((p) => p.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 })));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image) { alert("Please upload a tour image."); return; }
    if (highlights.length === 0) { alert("Please select at least one highlight."); return; }
    if (includes.length === 0) { alert("Please select at least one included item."); return; }
    setSaving(true);
    addTour({ ...form, highlights, includes, itinerary });
    router.push("/admin/tours");
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/tours" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Tour</h1>
          <p className="text-gray-500 text-sm">Create a new safari package</p>
        </div>
      </div>

      {/* Exchange Rate Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-0.5">Exchange Rate</p>
            <p className="text-xs text-amber-700">Set the rate used to auto-convert between KSH and USD. Saved globally.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold text-amber-800">1 USD =</span>
            <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))}
              className="w-24 border border-amber-300 rounded-xl px-3 py-2 text-sm text-center font-bold focus:outline-none focus:border-amber-500 bg-white" />
            <span className="text-sm font-semibold text-amber-800">KSH</span>
            <button type="button" onClick={saveRate}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${rateSaved ? "bg-green-500 text-white" : "bg-amber-500 hover:bg-amber-600 text-white"}`}>
              <RefreshCw className="w-3 h-3" />{rateSaved ? "Saved!" : "Save Rate"}
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <Card title="Basic Info">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Tour Title *</label>
              <input className={inputCls} value={form.title} onChange={(e) => setF("title", e.target.value)} placeholder="e.g. 6-Day Kenyan Wilderness Safari" required />
            </div>
            <div>
              <label className={labelCls}>Short Description</label>
              <textarea rows={2} className={`${inputCls} resize-none`} value={form.description} onChange={(e) => setF("description", e.target.value)} placeholder="A brief overview of this tour…" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Destination *</label>
                <select className={inputCls} value={form.destination} onChange={(e) => setF("destination", e.target.value as "Kenya" | "Tanzania" | "Rwanda")}>
                  <option>Kenya</option><option>Tanzania</option><option>Rwanda</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Duration *</label>
                <select className={inputCls} value={form.duration} onChange={(e) => handleDuration(e.target.value)}>
                  {DURATIONS.map((d) => <option key={d.text}>{d.text}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Group Size *</label>
                <select className={inputCls} value={form.groupSize} onChange={(e) => setF("groupSize", e.target.value)}>
                  {GROUP_SIZES.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card title="Pricing">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (KSH) *</label>
              <input type="number" min={0} className={inputCls} value={form.priceksh || ""} onChange={(e) => handleKSH(Number(e.target.value))} placeholder="e.g. 180000" required />
              <p className="text-xs text-gray-400 mt-1">Changing KSH auto-sets USD</p>
            </div>
            <div>
              <label className={labelCls}>Price (USD) *</label>
              <input type="number" min={0} className={inputCls} value={form.priceusd || ""} onChange={(e) => handleUSD(Number(e.target.value))} placeholder="e.g. 1395" required />
              <p className="text-xs text-gray-400 mt-1">Changing USD auto-sets KSH</p>
            </div>
          </div>
          {form.priceksh > 0 && form.priceusd > 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mt-3">
              Implied rate: {Math.round(form.priceksh / form.priceusd).toLocaleString()} KSH/USD &nbsp;·&nbsp; Saved rate: {rate} KSH/USD
            </p>
          )}
        </Card>

        {/* Image */}
        <Card title="Tour Image">
          <div className="space-y-3">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="h-44 object-cover rounded-xl mx-auto shadow-sm" />
              ) : form.image && form.image.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image} alt="Preview" className="h-44 object-cover rounded-xl mx-auto shadow-sm" />
              ) : (
                <div className="text-gray-400">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium text-gray-600">Click to upload from your device</p>
                  <p className="text-xs mt-1">JPG, PNG, WebP — max 2MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            {(imagePreview || (form.image && form.image.startsWith("http"))) && (
              <button type="button" onClick={() => { setImagePreview(""); setF("image", ""); if (fileRef.current) fileRef.current.value = ""; }} className="text-xs text-red-500 hover:text-red-700 font-medium">✕ Remove image</button>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="flex-1 h-px bg-gray-100" /><span>or paste a URL instead</span><div className="flex-1 h-px bg-gray-100" />
            </div>
            <input className={inputCls} value={form.image.startsWith("data:") ? "" : form.image} onChange={(e) => { setImagePreview(""); setF("image", e.target.value); }} placeholder="https://example.com/image.jpg" />
          </div>
        </Card>

        {/* Highlights */}
        <Card title="Tour Highlights">
          <p className="text-xs text-gray-500 mb-3">Click chips to select. Add custom highlights below.</p>
          <ChipSelect options={HIGHLIGHT_OPTIONS} selected={highlights}
            onToggle={(v) => setHighlights((p) => p.includes(v) ? p.filter((h) => h !== v) : [...p, v])}
            onAdd={(v) => setHighlights((p) => [...p, v])}
            onRemove={(v) => setHighlights((p) => p.filter((h) => h !== v))} />
          {highlights.length > 0 && <p className="text-xs text-savanna font-semibold mt-3">{highlights.length} selected</p>}
        </Card>

        {/* Includes */}
        <Card title="What&apos;s Included">
          <p className="text-xs text-gray-500 mb-3">Select all items included in the tour price.</p>
          <ChipSelect options={INCLUDES_OPTIONS} selected={includes}
            onToggle={(v) => setIncludes((p) => p.includes(v) ? p.filter((i) => i !== v) : [...p, v])}
            onAdd={(v) => setIncludes((p) => [...p, v])}
            onRemove={(v) => setIncludes((p) => p.filter((i) => i !== v))} />
          {includes.length > 0 && <p className="text-xs text-savanna font-semibold mt-3">{includes.length} selected</p>}
        </Card>

        {/* Badge */}
        <Card title="Badge &amp; Visibility">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Badge Label *</label>
                <select className={inputCls} value={form.badge} onChange={(e) => setF("badge", e.target.value)}>
                  {BADGE_PRESETS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Badge Color *</label>
                <select className={inputCls} value={form.badgeColor} onChange={(e) => setF("badgeColor", e.target.value)}>
                  {BADGE_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setF("active", !form.active)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${form.active ? "bg-green-500" : "bg-gray-300"}`}>
                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm text-gray-700">{form.active ? "Active — visible on site" : "Inactive — hidden from site"}</span>
            </div>
          </div>
        </Card>

        {/* Itinerary */}
        <Card title="Day-by-Day Itinerary">
          <p className="text-xs text-gray-500 mb-4">Build the itinerary day by day. Displayed on the public tour detail page under the Itinerary tab.</p>
          <div className="space-y-4">
            {itinerary.map((day, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 bg-savanna rounded-full flex items-center justify-center text-white text-xs font-bold">{day.day}</span>
                  <button type="button" onClick={() => removeDay(i)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <input className={inputCls} placeholder={`Day ${day.day} title e.g. Arrival & Nairobi NP`} value={day.title} onChange={(e) => updateDay(i, "title", e.target.value)} />
                  <textarea rows={2} className={`${inputCls} resize-none`} placeholder="What happens this day…" value={day.description} onChange={(e) => updateDay(i, "description", e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inputCls} placeholder="Meals (e.g. Breakfast, Lunch)" value={day.meals ?? ""} onChange={(e) => updateDay(i, "meals", e.target.value)} />
                    <input className={inputCls} placeholder="Accommodation (e.g. Safari Lodge)" value={day.accommodation ?? ""} onChange={(e) => updateDay(i, "accommodation", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addDay}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:border-savanna hover:text-savanna transition-colors">
              <Plus className="w-4 h-4" /> Add Day {itinerary.length + 1}
            </button>
          </div>
        </Card>

        <div className="flex gap-3 pt-2 pb-8">
          <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Tour"}
          </button>
          <Link href="/admin/tours" className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">{title}</h2>
      {children}
    </div>
  );
}
