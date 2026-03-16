"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "./ui/Button";
import { Anchor, Ship, Package, BookOpen, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-navy-900 border-b border-navy-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-ocean-500 rounded-lg flex items-center justify-center group-hover:bg-ocean-400 transition-colors">
              <Anchor className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              TUGO<span className="text-ocean-400">.AI</span>
            </span>
          </Link>

          {/* Nav Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-navy-800 text-sm transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                href="/vessels"
                className="flex items-center gap-1.5 text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-navy-800 text-sm transition-colors"
              >
                <Ship className="w-4 h-4" />
                Vessels
              </Link>
              <Link
                href="/shipments"
                className="flex items-center gap-1.5 text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-navy-800 text-sm transition-colors"
              >
                <Package className="w-4 h-4" />
                Shipments
              </Link>
              <Link
                href="/bookings"
                className="flex items-center gap-1.5 text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-navy-800 text-sm transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Bookings
              </Link>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-ocean-400 hover:text-ocean-300 px-3 py-2 rounded-lg hover:bg-navy-800 text-sm transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-white text-sm font-medium">{user?.full_name}</p>
                  <p className="text-ocean-400 text-xs capitalize">{user?.role.replace("_", " ")}</p>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 px-2 py-2 rounded-lg hover:bg-navy-800 text-sm transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-navy-800">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
