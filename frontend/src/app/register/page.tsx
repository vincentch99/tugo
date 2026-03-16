"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Anchor } from "lucide-react";

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "shipper",
    company_name: "",
    phone: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      await login(form.email, form.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-ocean-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Anchor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            TUGO<span className="text-ocean-400">.AI</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-2xl space-y-4">
          <Select
            label="I am a..."
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
          >
            <option value="shipper">Shipper (I need cargo transported)</option>
            <option value="tug_owner">Tug Owner (I own tug boats)</option>
            <option value="barge_owner">Barge Owner (I own barges)</option>
            <option value="admin">Platform Admin</option>
          </Select>

          <Input label="Full Name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Your full name" required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" required />
          <Input label="Password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min 8 characters" required />
          <Input label="Company Name" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="PT. Your Company" />
          <Input label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+62 xxx xxxx xxxx" />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Account
          </Button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-ocean-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
