"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Shipment } from "@/types";
import { ShipmentCard } from "@/components/ShipmentCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { Plus, Package } from "lucide-react";

export default function ShipmentsPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = user?.role === "shipper" ? "/shipments/my/shipments" : "/shipments";
    api.get<Shipment[]>(endpoint).then((r) => setShipments(r.data)).finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Shipments</h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.role === "shipper" ? "Your shipment requests" : "Open shipment requests across Indonesia"}
          </p>
        </div>
        {user?.role === "shipper" && (
          <Link href="/shipments/new">
            <Button><Plus className="w-4 h-4 mr-1.5" />Post Shipment</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No shipments found</p>
          {user?.role === "shipper" && (
            <Link href="/shipments/new" className="inline-block mt-4">
              <Button>Post Your First Shipment</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shipments.map((s) => <ShipmentCard key={s.id} shipment={s} />)}
        </div>
      )}
    </div>
  );
}
