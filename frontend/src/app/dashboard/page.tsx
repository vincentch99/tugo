"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { Vessel, Shipment, Booking } from "@/types";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VesselCard } from "@/components/VesselCard";
import { ShipmentCard } from "@/components/ShipmentCard";
import { StatusBadge } from "@/components/ui/Badge";
import { Ship, Package, BookOpen, Plus, TrendingUp, Anchor } from "lucide-react";

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-navy-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "shipper") {
      api.get<Vessel[]>("/vessels").then((r) => setVessels(r.data));
    }
    if (user.role === "shipper") {
      api.get<Shipment[]>("/shipments/my/shipments").then((r) => setShipments(r.data));
    }
    api.get<Booking[]>("/bookings").then((r) => setBookings(r.data));
  }, [user]);

  if (!user) return null;

  const isOwner = user.role === "tug_owner" || user.role === "barge_owner";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Welcome, {user.full_name.split(" ")[0]}</h1>
          <p className="text-gray-500 text-sm mt-1 capitalize">{user.role.replace("_", " ")} · {user.company_name}</p>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <Link href="/vessels/new">
              <Button size="sm"><Plus className="w-4 h-4 mr-1" />List Vessel</Button>
            </Link>
          )}
          {user.role === "shipper" && (
            <Link href="/shipments/new">
              <Button size="sm"><Plus className="w-4 h-4 mr-1" />Post Shipment</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {isOwner && <StatCard icon={Ship} label="My Vessels" value={vessels.length} color="bg-ocean-500" />}
        {user.role === "shipper" && <StatCard icon={Package} label="My Shipments" value={shipments.length} color="bg-gold-500" />}
        <StatCard icon={BookOpen} label="Bookings" value={bookings.length} color="bg-navy-700" />
        <StatCard
          icon={TrendingUp}
          label={isOwner ? "Available Vessels" : "Active Shipments"}
          value={isOwner ? vessels.filter((v) => v.is_available).length : shipments.filter((s) => s.status === "open" || s.status === "matched").length}
          color="bg-green-500"
        />
      </div>

      {/* Owner: vessels */}
      {isOwner && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy-900">My Vessels</h2>
            <Link href="/vessels" className="text-ocean-500 text-sm hover:underline">View all</Link>
          </div>
          {vessels.length === 0 ? (
            <Card>
              <CardBody className="text-center py-10">
                <Anchor className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No vessels listed yet</p>
                <Link href="/vessels/new"><Button size="sm">List Your First Vessel</Button></Link>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vessels.slice(0, 3).map((v) => <VesselCard key={v.id} vessel={v} />)}
            </div>
          )}
        </section>
      )}

      {/* Shipper: shipments */}
      {user.role === "shipper" && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy-900">My Shipments</h2>
            <Link href="/shipments" className="text-ocean-500 text-sm hover:underline">View all</Link>
          </div>
          {shipments.length === 0 ? (
            <Card>
              <CardBody className="text-center py-10">
                <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No shipments posted yet</p>
                <Link href="/shipments/new"><Button size="sm">Post a Shipment</Button></Link>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shipments.slice(0, 3).map((s) => <ShipmentCard key={s.id} shipment={s} />)}
            </div>
          )}
        </section>
      )}

      {/* Bookings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-navy-900">Recent Bookings</h2>
          <Link href="/bookings" className="text-ocean-500 text-sm hover:underline">View all</Link>
        </div>
        {bookings.length === 0 ? (
          <Card>
            <CardBody className="text-center py-10">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No bookings yet</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-2">
            {bookings.slice(0, 5).map((b) => (
              <Card key={b.id}>
                <CardBody className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4 text-navy-400" />
                    <div>
                      <p className="text-sm font-medium text-navy-900">Booking #{b.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">USD {b.agreed_price_usd.toLocaleString()}</p>
                    </div>
                  </div>
                  <StatusBadge status={b.status} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
