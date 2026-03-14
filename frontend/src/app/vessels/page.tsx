"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Vessel, VesselType } from "@/types";
import { VesselCard } from "@/components/VesselCard";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { Plus, Ship } from "lucide-react";

export default function VesselsPage() {
  const { user } = useAuth();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<VesselType | "">("");
  const [availableOnly, setAvailableOnly] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("vessel_type", typeFilter);
    params.set("available_only", String(availableOnly));
    api
      .get<Vessel[]>(`/vessels?${params}`)
      .then((r) => setVessels(r.data))
      .finally(() => setLoading(false));
  }, [typeFilter, availableOnly]);

  const isOwner = user && (user.role === "tug_owner" || user.role === "barge_owner");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Available Vessels</h1>
          <p className="text-gray-500 text-sm mt-1">Tugs and barges across Indonesia</p>
        </div>
        {isOwner && (
          <Link href="/vessels/new">
            <Button><Plus className="w-4 h-4 mr-1.5" />List Vessel</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as VesselType | "")}
          className="w-40"
        >
          <option value="">All Types</option>
          <option value="tug">Tugs</option>
          <option value="barge">Barges</option>
        </Select>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(e) => setAvailableOnly(e.target.checked)}
            className="rounded border-gray-300 text-ocean-500"
          />
          <span className="text-sm text-gray-600">Available only</span>
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : vessels.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Ship className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No vessels found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vessels.map((v) => <VesselCard key={v.id} vessel={v} />)}
        </div>
      )}
    </div>
  );
}
