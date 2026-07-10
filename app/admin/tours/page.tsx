"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTours, updateTour, deleteTour } from "@/lib/adminStore";
import type { AdminTour } from "@/types/admin";
import { Plus, Pencil, Trash2, Search, Eye, EyeOff } from "lucide-react";

export default function AdminTours() {
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTours(getTours());
  }, []);

  if (!mounted) return <div className="p-6 text-gray-400">Loading…</div>;

  function toggleActive(id: number, current: boolean) {
    updateTour(id, { active: !current });
    setTours(getTours());
  }

  function handleDelete(id: number) {
    deleteTour(id);
    setTours(getTours());
    setConfirmDelete(null);
  }

  const filtered = tours.filter((t) =>
    !query || t.title.toLowerCase().includes(query.toLowerCase()) || t.destination.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tours</h1>
          <p className="text-gray-500 text-sm">{tours.length} packages · {tours.filter((t) => t.active).length} active</p>
        </div>
        <Link href="/admin/tours/new" className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Tour
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tours…"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-green-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tour</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Destination</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Duration</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Price (KSH)</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((tour) => (
                <tr key={tour.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tour.image} alt={tour.title} className="w-12 h-10 rounded-lg object-cover flex-shrink-0 hidden sm:block" />
                      <div>
                        <p className="font-medium text-gray-800 leading-snug line-clamp-2 max-w-xs">{tour.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 md:hidden">{tour.destination} · {tour.duration}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      tour.destination === "Kenya" ? "bg-green-100 text-green-700" :
                      tour.destination === "Tanzania" ? "bg-amber-100 text-amber-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>{tour.destination}</span>
                  </td>
                  <td className="px-4 py-4 text-gray-600 hidden lg:table-cell">{tour.duration}</td>
                  <td className="px-4 py-4 font-medium text-gray-800 hidden md:table-cell">
                    KSH {tour.priceksh.toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => toggleActive(tour.id, tour.active)}
                      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                        tour.active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {tour.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {tour.active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/tours/${tour.id}/edit`}
                        className="p-2 rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      {confirmDelete === tour.id ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleDelete(tour.id)} className="text-xs bg-red-500 text-white px-2.5 py-1 rounded-lg hover:bg-red-600 transition-colors">Delete</button>
                          <button onClick={() => setConfirmDelete(null)} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(tour.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400">No tours found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
