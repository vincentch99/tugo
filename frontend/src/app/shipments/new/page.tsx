"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Port } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Package } from "lucide-react";

const COMMODITY_TYPES = [
  "Coal", "Palm Oil", "Cement", "Containers", "Fertilizer", "Sand & Gravel",
  "Timber", "Steel", "Grain", "Petroleum Products", "LPG", "Chemical", "Other"
];

export default function NewShipmentPage() {
  const router = useRouter();
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    commodity_type: "",
    cargo_weight_tons: "",
    origin_port_id: "",
    destination_port_id: "",
    departure_date: "",
    arrival_deadline: "",
    special_requirements: "",
  });

  useEffect(() => {
    api.get<Port[]>("/ports").then((r) => setPorts(r.data));
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { ...form, cargo_weight_tons: parseFloat(form.cargo_weight_tons) };
      const res = await api.post("/shipments", payload);
      router.push(`/shipments/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create shipment");
    } finally {
      setLoading(false);
    }
  };

  const majorPorts = ports.filter((p) => p.is_major);
  const otherPorts = ports.filter((p) => !p.is_major);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Post a Shipment</h1>
          <p className="text-gray-500 text-sm">Get AI-matched with the best vessels</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <CardHeader><h2 className="font-semibold text-navy-900">Cargo Details</h2></CardHeader>
          <CardBody className="space-y-4">
            <Select label="Commodity Type" value={form.commodity_type} onChange={(e) => set("commodity_type", e.target.value)} required>
              <option value="">Select commodity...</option>
              {COMMODITY_TYPES.map((c) => <option key={c} value={c.toLowerCase()}>{c}</option>)}
            </Select>
            <Input label="Cargo Weight (tons)" type="number" value={form.cargo_weight_tons} onChange={(e) => set("cargo_weight_tons", e.target.value)} placeholder="5000" required />
            <div>
              <label className="text-sm font-medium text-gray-700">Special Requirements</label>
              <textarea
                className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-300"
                rows={3}
                value={form.special_requirements}
                onChange={(e) => set("special_requirements", e.target.value)}
                placeholder="e.g., Hazmat class 3, temperature controlled, fragile..."
              />
            </div>
          </CardBody>
        </Card>

        <Card className="mb-4">
          <CardHeader><h2 className="font-semibold text-navy-900">Route</h2></CardHeader>
          <CardBody className="space-y-4">
            <Select label="Origin Port" value={form.origin_port_id} onChange={(e) => set("origin_port_id", e.target.value)} required>
              <option value="">Select origin port...</option>
              <optgroup label="Major Ports">
                {majorPorts.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.city}, {p.province}</option>)}
              </optgroup>
              <optgroup label="Other Ports">
                {otherPorts.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.city}, {p.province}</option>)}
              </optgroup>
            </Select>
            <Select label="Destination Port" value={form.destination_port_id} onChange={(e) => set("destination_port_id", e.target.value)} required>
              <option value="">Select destination port...</option>
              <optgroup label="Major Ports">
                {majorPorts.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.city}, {p.province}</option>)}
              </optgroup>
              <optgroup label="Other Ports">
                {otherPorts.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.city}, {p.province}</option>)}
              </optgroup>
            </Select>
          </CardBody>
        </Card>

        <Card className="mb-6">
          <CardHeader><h2 className="font-semibold text-navy-900">Schedule</h2></CardHeader>
          <CardBody className="grid grid-cols-2 gap-4">
            <Input label="Departure Date" type="date" value={form.departure_date} onChange={(e) => set("departure_date", e.target.value)} required />
            <Input label="Arrival Deadline" type="date" value={form.arrival_deadline} onChange={(e) => set("arrival_deadline", e.target.value)} required />
          </CardBody>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Post Shipment & Find Matches
        </Button>
      </form>
    </div>
  );
}
