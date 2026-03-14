"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Booking } from "@/types";
import { Card, CardBody } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BookOpen, DollarSign, Ship, Calendar } from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    api.get<Booking[]>("/bookings").then((r) => setBookings(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await api.put(`/bookings/${id}/status`, { status });
    fetchBookings();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Bookings</h1>
        <p className="text-gray-500 text-sm mt-1">Your active and past bookings</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No bookings yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-navy-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900 text-sm">Booking #{b.id.slice(0, 8)}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          USD {b.agreed_price_usd.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(b.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={b.status} />
                    {b.status === "pending" && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => updateStatus(b.id, "cancelled")}
                      >
                        Cancel
                      </Button>
                    )}
                    {b.status === "confirmed" && (
                      <Button size="sm" variant="secondary" onClick={() => updateStatus(b.id, "in_transit")}>
                        Mark In Transit
                      </Button>
                    )}
                    {b.status === "in_transit" && (
                      <Button size="sm" variant="secondary" onClick={() => updateStatus(b.id, "completed")}>
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
