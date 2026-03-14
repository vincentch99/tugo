"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Shipment, AIMatch, Booking } from "@/types";
import { useAuth } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { AIMatchPanel } from "@/components/AIMatchPanel";
import { Package, MapPin, Calendar, Weight, Bot, Loader2 } from "lucide-react";

export default function ShipmentDetailPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [matches, setMatches] = useState<AIMatch[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Shipment>(`/shipments/${id}`).then((r) => setShipment(r.data));
    api.get<AIMatch[]>(`/shipments/${id}/matches`).then((r) => setMatches(r.data));
  }, [id]);

  const runMatching = async () => {
    setMatchLoading(true);
    setError("");
    try {
      const res = await api.post<AIMatch[]>("/ai/match", { shipment_id: id });
      setMatches(res.data);
      setShipment((s) => s ? { ...s, status: "matched" } : s);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Matching failed");
    } finally {
      setMatchLoading(false);
    }
  };

  const handleBook = async (match: AIMatch) => {
    if (!confirm(`Book this vessel for USD ${match.estimated_price_usd?.toLocaleString()}?`)) return;
    setBookLoading(true);
    try {
      await api.post<Booking>("/bookings", {
        match_id: match.id,
        agreed_price_usd: match.estimated_price_usd,
      });
      router.push("/bookings");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Booking failed");
    } finally {
      setBookLoading(false);
    }
  };

  if (!shipment) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="h-64 bg-gray-100 rounded-xl animate-pulse" /></div>;

  const canMatch = user?.role === "shipper" && shipment.shipper_id === user?.id && shipment.status === "open";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 capitalize">{shipment.commodity_type} Shipment</h1>
          <p className="text-gray-500 text-sm mt-1">ID: {shipment.id.slice(0, 8)}...</p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Weight className="w-4 h-4" />Cargo
            </div>
            <p className="font-semibold text-navy-900">{shipment.cargo_weight_tons.toLocaleString()} tons</p>
            <p className="text-xs text-gray-500 capitalize">{shipment.commodity_type}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <MapPin className="w-4 h-4" />Route
            </div>
            <p className="font-semibold text-navy-900 text-sm">
              {shipment.origin_port?.city} → {shipment.destination_port?.city}
            </p>
            <p className="text-xs text-gray-500">
              {shipment.origin_port?.island} → {shipment.destination_port?.island}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Calendar className="w-4 h-4" />Schedule
            </div>
            <p className="font-semibold text-navy-900 text-sm">
              {new Date(shipment.departure_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </p>
            <p className="text-xs text-gray-500">
              Deadline: {new Date(shipment.arrival_deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </CardBody>
        </Card>
      </div>

      {shipment.special_requirements && (
        <Card className="mb-8">
          <CardBody>
            <p className="text-sm font-medium text-gray-700 mb-1">Special Requirements</p>
            <p className="text-sm text-gray-600">{shipment.special_requirements}</p>
          </CardBody>
        </Card>
      )}

      {/* AI Matching Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-ocean-500" />
            <h2 className="text-lg font-semibold text-navy-900">AI Vessel Matches</h2>
            {matches.length > 0 && <span className="text-sm text-gray-500">({matches.length} results)</span>}
          </div>
          {canMatch && (
            <Button onClick={runMatching} loading={matchLoading} disabled={matchLoading}>
              {matchLoading ? "Finding matches..." : matches.length > 0 ? "Re-run Matching" : "Find Best Vessels"}
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        {matchLoading ? (
          <div className="text-center py-12 text-ocean-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Claude AI is analyzing vessels...</p>
            <p className="text-xs text-gray-500 mt-1">This may take a few seconds</p>
          </div>
        ) : (
          <AIMatchPanel matches={matches} onBook={handleBook} />
        )}
      </section>
    </div>
  );
}
