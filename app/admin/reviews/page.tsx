"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getReviews, updateReview, deleteReview } from "@/lib/adminStore";
import type { Review } from "@/types/admin";
import { Plus, Star, CheckCircle, XCircle, Trash2, Eye, EyeOff } from "lucide-react";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  function load() {
    setReviews([...getReviews()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }

  useEffect(() => { load(); }, []);

  function handleApprove(id: string, approved: boolean) {
    updateReview(id, { approved });
    load();
  }

  function handleFeature(id: string, featured: boolean) {
    updateReview(id, { featured });
    load();
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    deleteReview(id);
    load();
  }

  const filtered = filter === "approved" ? reviews.filter((r) => r.approved)
    : filter === "pending" ? reviews.filter((r) => !r.approved)
    : reviews;

  const approvedCount = reviews.filter((r) => r.approved).length;
  const pendingCount = reviews.filter((r) => !r.approved).length;
  const avgRating = reviews.length > 0 ? (reviews.filter((r) => r.approved).reduce((a, r) => a + r.rating, 0) / Math.max(approvedCount, 1)).toFixed(1) : "—";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Testimonials</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage client reviews displayed on the public website</p>
        </div>
        <Link href="/admin/reviews/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Review
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Reviews", value: reviews.length, color: "text-gray-900" },
          { label: "Published", value: approvedCount, color: "text-emerald-700" },
          { label: "Avg Rating", value: avgRating, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([["all", "All", reviews.length], ["approved", "Published", approvedCount], ["pending", "Pending", pendingCount]] as const).map(([f, label, count]) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {label} <span className="text-xs opacity-60">({count})</span>
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center text-gray-400 text-sm">
          No reviews found. <Link href="/admin/reviews/new" className="text-amber-600 underline">Add the first one.</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rev) => (
            <div key={rev.id} className={`bg-white rounded-2xl shadow-sm border p-5 ${rev.approved ? "border-gray-100" : "border-amber-200 bg-amber-50/30"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-700 font-bold">{rev.clientName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{rev.clientName}</span>
                      <span className="text-xs text-gray-400">{rev.clientCountry}</span>
                      {rev.featured && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Featured</span>
                      )}
                      {!rev.approved && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
                      )}
                    </div>
                    <Stars rating={rev.rating} />
                    <p className="text-xs text-gray-400 mt-0.5">{rev.tourTitle} · {rev.travelDate}</p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{rev.body}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleApprove(rev.id, !rev.approved)} title={rev.approved ? "Unpublish" : "Approve & Publish"}
                    className={`p-2 rounded-lg transition-colors ${rev.approved ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"}`}>
                    {rev.approved ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleFeature(rev.id, !rev.featured)} title={rev.featured ? "Remove from featured" : "Mark as featured"}
                    className={`p-2 rounded-lg transition-colors ${rev.featured ? "text-amber-500 hover:bg-amber-50" : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"}`}>
                    {rev.featured ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(rev.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
