import Link from "next/link";
import { Anchor, Bot, Navigation, DollarSign, Ship, Package, CheckCircle, ArrowRight, MapPin } from "lucide-react";

function HeroSection() {
  return (
    <section className="bg-navy-900 text-white py-24 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-ocean-500/20 border border-ocean-500/40 text-ocean-300 text-sm px-4 py-1.5 rounded-full mb-6">
          <Bot className="w-4 h-4" />
          Powered by Claude AI Opus
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Indonesia&apos;s Smartest
          <br />
          <span className="text-ocean-400">Maritime Marketplace</span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          TUGO.AI matches shippers with tug and barge owners across the Indonesian archipelago —
          with AI-powered route optimization and dynamic pricing.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-ocean-500 hover:bg-ocean-400 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/vessels"
            className="inline-flex items-center gap-2 border border-gray-600 hover:border-gray-400 text-gray-200 hover:text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
          >
            Browse Vessels
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-md mx-auto">
          {[
            { value: "50+", label: "Indonesian Ports" },
            { value: "AI", label: "Route Optimization" },
            { value: "3", label: "User Roles" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-ocean-400">{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      color: "bg-ocean-500",
      title: "AI Vessel Matching",
      desc: "Claude Opus analyzes your shipment — cargo type, weight, route, timeline — and scores every available vessel to find your perfect match.",
    },
    {
      icon: Navigation,
      color: "bg-navy-700",
      title: "Route Optimization",
      desc: "Get AI-planned routes through Indonesian sea lanes with waypoints, distance estimates, and seasonal risk advisories for Selat Malaka, Selat Makassar, and beyond.",
    },
    {
      icon: DollarSign,
      color: "bg-gold-500",
      title: "Dynamic Pricing",
      desc: "AI-generated freight quotes based on route distance, cargo type, vessel rates, port fees, and Indonesian market conditions — with full cost breakdowns.",
    },
    {
      icon: MapPin,
      color: "bg-green-600",
      title: "50+ Indonesian Ports",
      desc: "Pre-loaded with major ports across Java, Kalimantan, Sulawesi, Sumatera, Papua, and Nusa Tenggara — covering the entire archipelago.",
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-900">Everything You Need</h2>
          <p className="text-gray-500 mt-3">One platform for shippers, tug owners, and barge owners</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="flex gap-4 p-6 bg-gray-50 rounded-2xl">
              <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center shrink-0`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Register & Choose Role", desc: "Sign up as a Shipper, Tug Owner, or Barge Owner" },
    { num: "02", title: "List or Post", desc: "Owners list their vessels. Shippers post cargo shipment requests." },
    { num: "03", title: "AI Matching", desc: "Click "Find Best Vessels" — Claude AI ranks all available vessels and explains each match." },
    { num: "04", title: "Review & Book", desc: "See AI route plans, pricing breakdowns, and risk notes. Book with one click." },
  ];

  return (
    <section className="py-20 px-4 bg-navy-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">How It Works</h2>
          <p className="text-gray-400 mt-3">From posting to booking in minutes</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="w-12 h-12 bg-ocean-500/20 border border-ocean-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-ocean-400 font-bold text-sm">{s.num}</span>
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{s.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  const roles = [
    {
      icon: Package,
      color: "bg-gold-100",
      iconColor: "text-gold-600",
      title: "Shippers",
      benefits: [
        "Post cargo with one commodity per request",
        "AI instantly scores all available vessels",
        "See route plans with Indonesian sea lanes",
        "Get transparent pricing breakdowns",
      ],
    },
    {
      icon: Anchor,
      color: "bg-ocean-100",
      iconColor: "text-ocean-600",
      title: "Tug Owners",
      benefits: [
        "List your tug boats with full specs",
        "Get matched to relevant shipments",
        "View incoming booking requests",
        "Manage availability in real-time",
      ],
    },
    {
      icon: Ship,
      color: "bg-navy-100",
      iconColor: "text-navy-700",
      title: "Barge Owners",
      benefits: [
        "List your barges with capacity details",
        "Matched based on cargo compatibility",
        "Receive booking confirmations",
        "Track shipment status",
      ],
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy-900">Built for All Parties</h2>
          <p className="text-gray-500 mt-3">Whether you ship cargo or own vessels</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r) => (
            <div key={r.title} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className={`w-12 h-12 ${r.color} rounded-xl flex items-center justify-center mb-4`}>
                <r.icon className={`w-6 h-6 ${r.iconColor}`} />
              </div>
              <h3 className="font-bold text-navy-900 text-lg mb-4">{r.title}</h3>
              <ul className="space-y-2">
                {r.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-4 bg-ocean-500">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to ship smarter across Indonesia?
        </h2>
        <p className="text-ocean-100 mb-8 text-lg">
          Join TUGO.AI and let Claude AI find your perfect match today.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-white text-ocean-600 hover:bg-gray-50 font-bold px-10 py-4 rounded-xl transition-colors text-base"
        >
          Start for Free <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RolesSection />
      <CTASection />
      <footer className="bg-navy-900 text-gray-500 text-center py-6 text-sm">
        <p>© 2024 TUGO.AI — Indonesia Maritime Logistics Platform</p>
      </footer>
    </>
  );
}
