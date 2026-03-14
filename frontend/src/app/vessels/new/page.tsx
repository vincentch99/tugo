"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Ship } from "lucide-react";

export default function NewVesselPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const defaultType = user?.role === "barge_owner" ? "barge" : "tug";

  const [form, setForm] = useState({
    vessel_type: defaultType,
    name: "",
    registration_number: "",
    capacity_tons: "",
    length_m: "",
    beam_m: "",
    draft_m: "",
    horsepower: "",
    home_port: "",
    current_location: "",
    daily_rate_usd: "",
    description: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload: any = { ...form };
      ["capacity_tons", "length_m", "beam_m", "draft_m", "daily_rate_usd"].forEach((k) => {
        payload[k] = parseFloat(payload[k]);
      });
      if (form.horsepower) payload.horsepower = parseInt(form.horsepower);
      else delete payload.horsepower;

      await api.post("/vessels", payload);
      router.push("/vessels");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create vessel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-ocean-500 rounded-lg flex items-center justify-center">
          <Ship className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">List a Vessel</h1>
          <p className="text-gray-500 text-sm">Add your vessel to the TUGO.AI marketplace</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <CardHeader><h2 className="font-semibold text-navy-900">Vessel Details</h2></CardHeader>
          <CardBody className="space-y-4">
            <Select label="Vessel Type" value={form.vessel_type} onChange={(e) => set("vessel_type", e.target.value)}>
              {user?.role !== "barge_owner" && <option value="tug">Tug Boat</option>}
              {user?.role !== "tug_owner" && <option value="barge">Barge</option>}
            </Select>
            <Input label="Vessel Name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="KM Nusantara Jaya" required />
            <Input label="Registration Number" value={form.registration_number} onChange={(e) => set("registration_number", e.target.value)} placeholder="GT-1234-2020" required />
            <Input label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Additional details..." />
          </CardBody>
        </Card>

        <Card className="mb-4">
          <CardHeader><h2 className="font-semibold text-navy-900">Specifications</h2></CardHeader>
          <CardBody className="grid grid-cols-2 gap-4">
            <Input label="Capacity (tons)" type="number" value={form.capacity_tons} onChange={(e) => set("capacity_tons", e.target.value)} placeholder="5000" required />
            <Input label="Length (m)" type="number" value={form.length_m} onChange={(e) => set("length_m", e.target.value)} placeholder="80" required />
            <Input label="Beam (m)" type="number" value={form.beam_m} onChange={(e) => set("beam_m", e.target.value)} placeholder="18" required />
            <Input label="Draft (m)" type="number" value={form.draft_m} onChange={(e) => set("draft_m", e.target.value)} placeholder="3.5" required />
            {form.vessel_type === "tug" && (
              <Input label="Horsepower" type="number" value={form.horsepower} onChange={(e) => set("horsepower", e.target.value)} placeholder="3200" />
            )}
          </CardBody>
        </Card>

        <Card className="mb-6">
          <CardHeader><h2 className="font-semibold text-navy-900">Location & Pricing</h2></CardHeader>
          <CardBody className="space-y-4">
            <Input label="Home Port" value={form.home_port} onChange={(e) => set("home_port", e.target.value)} placeholder="Tanjung Priok, Jakarta" required />
            <Input label="Current Location" value={form.current_location} onChange={(e) => set("current_location", e.target.value)} placeholder="Tanjung Priok, Jakarta" required />
            <Input label="Daily Rate (USD)" type="number" value={form.daily_rate_usd} onChange={(e) => set("daily_rate_usd", e.target.value)} placeholder="2500" required />
          </CardBody>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          List Vessel
        </Button>
      </form>
    </div>
  );
}
