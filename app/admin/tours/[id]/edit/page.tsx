"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTours, updateTour } from "@/lib/adminStore";
import type { AdminTour } from "@/types/admin";
import { Plus, X, ArrowLeft } from "lucide-react";

const BADGE_COLORS = [
  { label: "Gold", value: "bg-savanna" },
  { label: "Forest", value: "bg-forest" },
  { label: "Earth", value: "bg-earth" },
  { label: "Moss", value: "bg-moss" },
  { label: "Forest Light", value: "bg-forest-light" },
];

export default function EditTour({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tour, setTour] = useState<AdminTour | null>(null);
  const [saving, setSaving] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [includes, setIncludes] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "", destination: "Kenya" as "Kenya" | "Tanzania" | "Rwanda",
    duration: "", days: 1, priceksh: 0, priceusd: 0,
    groupSize: "", image: "", badge: "", badgeColor: "bg-savanna", active: true,
  });

  useEffect(() => {
    const tours = getTours();
    const found = tours.find((t) => t.id === Number(id));
    if (found) {
      setTour(found);
      setForm({
        title: found.title, destination: found.destination,
        duration: found.duration, days: found.days,
        priceksh: found.priceksh, priceusd: found.priceusd,
        groupSize: found.groupSize, image: found.image,
        badge: found.badge, badgeColor: found.badgeColor, active: found.active,
      });
      setHighlights(found.highlights.length ? found.highlights : [""]);
      setIncludes(found.includes.length ? found.includes : [""]);
    }
  }, [id]);

  if (!tour) return <div className="p-6 text-gray-400">Tour not found.</div>;

  function set(field: string, value: string | number | boolean) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function updateArr(arr: string[], setArr: (v: string[]) => void, idx: number, val: string) {
    setArr(arr.map((item, i) => (i === idx ? val : item)));
  }

  function addItem(arr: string[], setArr: (v: string[]) => void) { setArr([...arr, ""]); }
  function removeItem(arr: string[], setArr: (v: string[]) => void, idx: number) { setArr(arr.filter((_, i) => i !== idx)); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    updateTour(Number(id), {
      ...form,
      highlights: highlights.filter((h) => h.trim()),
      includes: includes.filter((i) => i.trim()),
    });
    router.push("/admin/tours");
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors";
  const labelCls = "block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/tours" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Tour</h1>
          <p className="text-gray-500 text-sm truncate max-w-sm">{tour.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card title="Basic Info">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Title *</label>
              <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Destination *</label>
                <select className={inputCls} value={form.destination} onChange={(e) => set("destination", e.target.value)}>
                  <option>Kenya</option><option>Tanzania</option><option>Rwanda</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Group Size</label>
                <input className={inputCls} value={form.groupSize} onChange={(e) => set("groupSize", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Duration (text) *</label>
                <input className={inputCls} value={form.duration} onChange={(e) => set("duration", e.target.value)} required />
              </div>
              <div>
                <label className={labelCls}>Days (number) *</label>
                <input type="number" min={1} className={inputCls} value={form.days} onChange={(e) => set("days", Number(e.target.value))} required />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Pricing">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price KSH *</label>
              <input type="number" min={0} className={inputCls} value={form.priceksh} onChange={(e) => set("priceksh", Number(e.target.value))} required />
            </div>
            <div>
              <label className={labelCls}>Price USD *</label>
              <input type="number" min={0} className={inputCls} value={form.priceusd} onChange={(e) => set("priceusd", Number(e.target.value))} required />
            </div>
          </div>
        </Card>

        <Card title="Image & Badge">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Image URL *</label>
              <input className={inputCls} value={form.image} onChange={(e) => set("image", e.target.value)} required />
            </div>
            {form.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Badge Text</label>
                <input className={inputCls} value={form.badge} onChange={(e) => set("badge", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Badge Color</label>
                <select className={inputCls} value={form.badgeColor} onChange={(e) => set("badgeColor", e.target.value)}>
                  {BADGE_COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Highlights">
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputCls} flex-1`} value={h} onChange={(e) => updateArr(highlights, setHighlights, i, e.target.value)} placeholder={`Highlight ${i + 1}`} />
                {highlights.length > 1 && <button type="button" onClick={() => removeItem(highlights, setHighlights, i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>}
              </div>
            ))}
            <button type="button" onClick={() => addItem(highlights, setHighlights)} className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 font-semibold mt-1 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add highlight
            </button>
          </div>
        </Card>

        <Card title="What's Included">
          <div className="space-y-2">
            {includes.map((inc, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputCls} flex-1`} value={inc} onChange={(e) => updateArr(includes, setIncludes, i, e.target.value)} placeholder={`Included item ${i + 1}`} />
                {includes.length > 1 && <button type="button" onClick={() => removeItem(includes, setIncludes, i)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>}
              </div>
            ))}
            <button type="button" onClick={() => addItem(includes, setIncludes)} className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 font-semibold mt-1 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add item
            </button>
          </div>
        </Card>

        <Card title="Visibility">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`relative w-11 h-6 rounded-full transition-colors ${form.active ? "bg-green-500" : "bg-gray-300"}`} onClick={() => set("active", !form.active)}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? "translate-x-5" : ""}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">{form.active ? "Active (visible on website)" : "Hidden (draft)"}</span>
          </label>
        </Card>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Changes"}
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
