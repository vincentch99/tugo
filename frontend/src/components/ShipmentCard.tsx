import Link from "next/link";
import { Shipment } from "@/types";
import { Card, CardBody } from "./ui/Card";
import { StatusBadge } from "./ui/Badge";
import { Package, MapPin, Calendar, Weight } from "lucide-react";

export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  return (
    <Link href={`/shipments/${shipment.id}`}>
      <Card hover className="h-full">
        <CardBody>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900 text-sm capitalize">{shipment.commodity_type}</h3>
                <p className="text-xs text-gray-500">{shipment.cargo_weight_tons.toLocaleString()} tons</p>
              </div>
            </div>
            <StatusBadge status={shipment.status} />
          </div>

          <div className="space-y-2 mt-3">
            <div className="flex items-start gap-1.5 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-navy-700">
                  {shipment.origin_port?.city || "Origin"}
                </span>
                <span className="text-gray-400 mx-1">→</span>
                <span className="font-medium text-navy-700">
                  {shipment.destination_port?.city || "Destination"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>Departure: {new Date(shipment.departure_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>

          {shipment.special_requirements && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 truncate">{shipment.special_requirements}</p>
            </div>
          )}
        </CardBody>
      </Card>
    </Link>
  );
}
