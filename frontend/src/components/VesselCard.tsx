import Link from "next/link";
import { Vessel } from "@/types";
import { Card, CardBody } from "./ui/Card";
import { Badge, StatusBadge } from "./ui/Badge";
import { Anchor, Ruler, Weight, Zap, MapPin, DollarSign } from "lucide-react";

export function VesselCard({ vessel }: { vessel: Vessel }) {
  return (
    <Link href={`/vessels/${vessel.id}`}>
      <Card hover className="h-full">
        <CardBody>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${vessel.vessel_type === "tug" ? "bg-ocean-100" : "bg-navy-100"}`}>
                <Anchor className={`w-5 h-5 ${vessel.vessel_type === "tug" ? "text-ocean-600" : "text-navy-600"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900 text-sm">{vessel.name}</h3>
                <p className="text-xs text-gray-500">{vessel.registration_number}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={vessel.vessel_type === "tug" ? "blue" : "navy"} className="capitalize">
                {vessel.vessel_type}
              </Badge>
              <StatusBadge status={vessel.is_available ? "available" : "booked"} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Weight className="w-3.5 h-3.5 text-gray-400" />
              <span>{vessel.capacity_tons.toLocaleString()} tons</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Ruler className="w-3.5 h-3.5 text-gray-400" />
              <span>{vessel.length_m}m × {vessel.beam_m}m</span>
            </div>
            {vessel.horsepower && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Zap className="w-3.5 h-3.5 text-gray-400" />
                <span>{vessel.horsepower.toLocaleString()} HP</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate">{vessel.current_location}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1 text-ocean-600 font-semibold text-sm">
            <DollarSign className="w-4 h-4" />
            <span>USD {vessel.daily_rate_usd.toLocaleString()}/day</span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
