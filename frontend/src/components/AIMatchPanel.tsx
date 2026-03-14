"use client";

import { useState } from "react";
import { AIMatch } from "@/types";
import { Card, CardBody, CardHeader } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { ChevronDown, ChevronUp, Bot, Ship, Navigation, DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

interface AIMatchPanelProps {
  matches: AIMatch[];
  onBook: (match: AIMatch) => void;
}

function MatchScoreRing({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#0EA5E9" : score >= 60 ? "#F59E0B" : "#ef4444";

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-sm font-bold text-navy-900">{Math.round(score)}</span>
    </div>
  );
}

function RouteDisplay({ route }: { route: AIMatch["estimated_route"] }) {
  if (!route || !route.waypoints?.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Navigation className="w-4 h-4 text-ocean-500" />
        <span className="text-sm font-medium text-navy-900">Route Waypoints</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {route.waypoints.map((wp, i) => (
          <span key={i} className="text-xs bg-navy-50 text-navy-700 px-2 py-1 rounded-md">
            {wp.name}
          </span>
        ))}
      </div>
      {route.sea_lanes && route.sea_lanes.length > 0 && (
        <div className="space-y-1">
          {route.sea_lanes.map((lane, i) => (
            <p key={i} className="text-xs text-gray-600">• {lane}</p>
          ))}
        </div>
      )}
      {route.risk_notes && route.risk_notes.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1 text-yellow-700 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5" />
            Risk Notes
          </div>
          {route.risk_notes.map((note, i) => (
            <p key={i} className="text-xs text-yellow-800">• {note}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function PriceDisplay({ breakdown, total }: { breakdown: AIMatch["price_breakdown"]; total: number | null }) {
  if (!total) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-green-500" />
        <span className="text-sm font-medium text-navy-900">Pricing Estimate</span>
      </div>
      <div className="bg-green-50 rounded-lg p-3 space-y-1.5">
        {breakdown.base_freight && (
          <div className="flex justify-between text-xs text-gray-700">
            <span>Base Freight</span>
            <span>USD {breakdown.base_freight.toLocaleString()}</span>
          </div>
        )}
        {breakdown.fuel_surcharge && (
          <div className="flex justify-between text-xs text-gray-700">
            <span>Fuel Surcharge</span>
            <span>USD {breakdown.fuel_surcharge.toLocaleString()}</span>
          </div>
        )}
        {breakdown.port_fees && (
          <div className="flex justify-between text-xs text-gray-700">
            <span>Port Fees</span>
            <span>USD {breakdown.port_fees.toLocaleString()}</span>
          </div>
        )}
        <div className="pt-1 border-t border-green-200 flex justify-between text-sm font-semibold text-green-800">
          <span>Total Estimate</span>
          <span>USD {total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export function AIMatchPanel({ matches, onBook }: AIMatchPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(matches[0]?.id || null);

  if (!matches.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No AI matches yet. Run matching to find the best vessels.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match, index) => (
        <Card key={match.id} className={index === 0 ? "ring-2 ring-ocean-300" : ""}>
          <button
            className="w-full text-left"
            onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
          >
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MatchScoreRing score={match.match_score} />
                <div>
                  <div className="flex items-center gap-2">
                    <Ship className="w-4 h-4 text-navy-500" />
                    <span className="font-semibold text-navy-900 text-sm">
                      {match.vessel?.name || "Vessel"}
                    </span>
                    {index === 0 && (
                      <Badge variant="blue" className="text-xs">Best Match</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">
                    {match.vessel?.vessel_type} · {match.vessel?.capacity_tons.toLocaleString()} tons capacity
                  </p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-500">
                    {match.estimated_distance_nm && (
                      <span>{Math.round(match.estimated_distance_nm).toLocaleString()} nm</span>
                    )}
                    {match.estimated_duration_days && (
                      <span>~{Math.round(match.estimated_duration_days)} days</span>
                    )}
                    {match.estimated_price_usd && (
                      <span className="text-green-600 font-medium">USD {match.estimated_price_usd.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onBook(match); }}
                >
                  Book
                </Button>
                {expandedId === match.id ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </CardHeader>
          </button>

          {expandedId === match.id && (
            <CardBody className="space-y-4">
              {/* AI Reasoning */}
              <div className="bg-ocean-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-ocean-600" />
                  <span className="text-sm font-medium text-ocean-800">AI Analysis</span>
                </div>
                <p className="text-sm text-ocean-900">{match.ai_reasoning}</p>
              </div>

              {/* Route */}
              <RouteDisplay route={match.estimated_route} />

              {/* Pricing */}
              <PriceDisplay breakdown={match.price_breakdown} total={match.estimated_price_usd} />
            </CardBody>
          )}
        </Card>
      ))}
    </div>
  );
}
