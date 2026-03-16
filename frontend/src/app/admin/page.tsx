"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { User, Vessel, Shipment } from "@/types";
import {
  ShieldCheck,
  Users,
  Layers,
  Ship,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Anchor,
} from "lucide-react";

// ── Combined draggable + droppable vessel card ─────────────────────────────────
// The vessel can be dragged onto a shipment, OR a shipment can be dropped onto it.
function VesselCard({ vessel }: { vessel: Vessel }) {
  const draggable = useDraggable({ id: `vessel:${vessel.id}`, data: { type: "vessel", vessel } });
  const droppable = useDroppable({ id: `vessel:${vessel.id}` });

  // Merge the two refs
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      draggable.setNodeRef(node);
      droppable.setNodeRef(node);
    },
    [draggable.setNodeRef, droppable.setNodeRef]
  );

  const style = draggable.transform
    ? { transform: CSS.Translate.toString(draggable.transform) }
    : undefined;

  return (
    <div
      ref={setRef}
      style={style}
      {...draggable.listeners}
      {...draggable.attributes}
      className={`rounded-xl border p-4 cursor-grab active:cursor-grabbing transition-all select-none ${
        draggable.isDragging
          ? "opacity-30"
          : droppable.isOver
          ? "border-amber-400 bg-amber-900/20 scale-[1.01]"
          : "border-navy-700 bg-navy-800/60 hover:border-ocean-600 hover:bg-navy-800"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-ocean-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Ship className="w-4 h-4 text-ocean-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{vessel.name}</p>
          <p className="text-gray-400 text-xs mt-0.5 capitalize">{vessel.vessel_type}</p>
          <p className="text-gray-500 text-xs mt-1">
            {vessel.capacity_tons.toLocaleString()} tons &middot; ${vessel.daily_rate_usd}/day
          </p>
          <p className="text-gray-600 text-xs mt-1 truncate">{vessel.current_location}</p>
        </div>
      </div>
      {droppable.isOver && (
        <p className="text-amber-400 text-xs mt-2 text-center font-medium">
          Drop shipment here to recommend
        </p>
      )}
    </div>
  );
}

// ── Combined draggable + droppable shipment card ───────────────────────────────
function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const draggable = useDraggable({
    id: `shipment:${shipment.id}`,
    data: { type: "shipment", shipment },
  });
  const droppable = useDroppable({ id: `shipment:${shipment.id}` });

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      draggable.setNodeRef(node);
      droppable.setNodeRef(node);
    },
    [draggable.setNodeRef, droppable.setNodeRef]
  );

  const style = draggable.transform
    ? { transform: CSS.Translate.toString(draggable.transform) }
    : undefined;

  return (
    <div
      ref={setRef}
      style={style}
      {...draggable.listeners}
      {...draggable.attributes}
      className={`rounded-xl border p-4 cursor-grab active:cursor-grabbing transition-all select-none ${
        draggable.isDragging
          ? "opacity-30"
          : droppable.isOver
          ? "border-ocean-400 bg-ocean-900/20 scale-[1.01]"
          : "border-navy-700 bg-navy-800/60 hover:border-amber-600 hover:bg-navy-800"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <Package className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{shipment.commodity_type}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {shipment.cargo_weight_tons.toLocaleString()} tons
          </p>
          <p className="text-gray-500 text-xs mt-1 truncate">
            {shipment.origin_port?.city ?? "—"} &rarr; {shipment.destination_port?.city ?? "—"}
          </p>
          <p className="text-gray-600 text-xs mt-1">{shipment.departure_date}</p>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
            shipment.status === "open"
              ? "bg-green-900/40 text-green-400"
              : "bg-ocean-900/40 text-ocean-400"
          }`}
        >
          {shipment.status}
        </span>
      </div>
      {droppable.isOver && (
        <p className="text-ocean-400 text-xs mt-2 text-center font-medium">
          Drop vessel here to recommend
        </p>
      )}
    </div>
  );
}

// ── Toast type ─────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info";
type ToastState = { message: string; type: ToastType } | null;
type Tab = "users" | "board";

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>(null);
  const [activeItem, setActiveItem] = useState<
    { type: "vessel"; vessel: Vessel } | { type: "shipment"; shipment: Shipment } | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (user && user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    Promise.all([loadUsers(), loadBoard()]).finally(() => setLoading(false));
  }, [isAuthenticated, user]);

  const loadUsers = async () => {
    const res = await api.get("/admin/users");
    setUsers(res.data);
  };

  const loadBoard = async () => {
    const [sRes, vRes] = await Promise.all([
      api.get("/admin/board/shipments"),
      api.get("/admin/board/vessels"),
    ]);
    setShipments(sRes.data);
    setVessels(vRes.data);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { type: string; vessel?: Vessel; shipment?: Shipment } | undefined;
    if (!data) return;
    if (data.type === "vessel" && data.vessel) setActiveItem({ type: "vessel", vessel: data.vessel });
    if (data.type === "shipment" && data.shipment) setActiveItem({ type: "shipment", shipment: data.shipment });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    let shipmentId: string | null = null;
    let vesselId: string | null = null;

    if (activeId.startsWith("vessel:") && overId.startsWith("shipment:")) {
      vesselId = activeId.slice("vessel:".length);
      shipmentId = overId.slice("shipment:".length);
    } else if (activeId.startsWith("shipment:") && overId.startsWith("vessel:")) {
      shipmentId = activeId.slice("shipment:".length);
      vesselId = overId.slice("vessel:".length);
    }

    if (!shipmentId || !vesselId) return;

    try {
      await api.post("/admin/recommend", { shipment_id: shipmentId, vessel_id: vesselId });
      showToast("Recommendation created! The shipper will see it in their matches.", "success");
      await loadBoard();
    } catch (err: any) {
      showToast(err.response?.data?.detail ?? "Failed to create recommendation", "error");
    }
  };

  const roleColor: Record<string, string> = {
    shipper: "bg-amber-900/40 text-amber-400",
    tug_owner: "bg-ocean-900/40 text-ocean-400",
    barge_owner: "bg-blue-900/40 text-blue-400",
    admin: "bg-purple-900/40 text-purple-400",
  };

  if (!isAuthenticated || (user && user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <p className="text-gray-400">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in ${
            toast.type === "success"
              ? "bg-green-900 text-green-300 border border-green-700"
              : toast.type === "error"
              ? "bg-red-900 text-red-300 border border-red-700"
              : "bg-navy-800 text-gray-300 border border-navy-600"
          }`}
        >
          {toast.type === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.type === "error" && <XCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.type === "info" && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-500 text-sm">
              Manage users and manually recommend vessel–shipment pairings
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-navy-900 rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setTab("users")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "users" ? "bg-navy-700 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            Users
            <span className="bg-navy-600 text-gray-300 text-xs px-1.5 py-0.5 rounded-md">
              {users.length}
            </span>
          </button>
          <button
            onClick={() => setTab("board")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "board" ? "bg-navy-700 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            Recommendations Board
          </button>
        </div>

        {/* ── USERS TAB ──────────────────────────────────────────────────── */}
        {tab === "users" && (
          <>
            {loading ? (
              <div className="text-gray-500 text-sm py-20 text-center">Loading users…</div>
            ) : users.length === 0 ? (
              <div className="text-gray-500 text-sm py-20 text-center">No users found.</div>
            ) : (
              <div className="bg-navy-900 rounded-2xl border border-navy-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-800">
                      <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Name</th>
                      <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Email</th>
                      <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Role</th>
                      <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Company</th>
                      <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Phone</th>
                      <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Status</th>
                      <th className="text-left px-5 py-3.5 text-gray-400 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr
                        key={u.id}
                        className={`hover:bg-navy-800/40 transition-colors ${
                          i < users.length - 1 ? "border-b border-navy-800/60" : ""
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-navy-700 flex items-center justify-center text-xs text-gray-300 font-semibold flex-shrink-0">
                              {u.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium">{u.full_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400">{u.email}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                              roleColor[u.role] ?? "bg-gray-800 text-gray-400"
                            }`}
                          >
                            {u.role.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400">{u.company_name ?? "—"}</td>
                        <td className="px-5 py-3.5 text-gray-400">{u.phone ?? "—"}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              u.is_active
                                ? "bg-green-900/40 text-green-400"
                                : "bg-red-900/40 text-red-400"
                            }`}
                          >
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 text-xs">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── RECOMMENDATIONS BOARD TAB ───────────────────────────────────── */}
        {tab === "board" && (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {/* Instruction banner */}
            <div className="mb-6 flex items-start gap-3 bg-navy-900/60 border border-navy-800 rounded-xl px-5 py-4">
              <AlertCircle className="w-4 h-4 text-ocean-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-400 text-sm">
                <span className="text-white font-medium">Drag</span> a vessel onto a shipment
                (or a shipment onto a vessel) to create a manual match recommendation. The
                shipper will see it as a suggested match with a perfect score.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Shipments column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-4 h-4 text-amber-400" />
                  <h2 className="text-white font-semibold text-sm">
                    Open Shipments
                    <span className="ml-1.5 text-gray-500 font-normal">
                      ({shipments.length})
                    </span>
                  </h2>
                </div>
                {shipments.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-16">No open shipments</p>
                ) : (
                  <div className="space-y-3">
                    {shipments.map((s) => (
                      <ShipmentCard key={s.id} shipment={s} />
                    ))}
                  </div>
                )}
              </div>

              {/* Vessels column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Ship className="w-4 h-4 text-ocean-400" />
                  <h2 className="text-white font-semibold text-sm">
                    Available Vessels
                    <span className="ml-1.5 text-gray-500 font-normal">
                      ({vessels.length})
                    </span>
                  </h2>
                </div>
                {vessels.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-16">No available vessels</p>
                ) : (
                  <div className="space-y-3">
                    {vessels.map((v) => (
                      <VesselCard key={v.id} vessel={v} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Ghost card that follows the cursor while dragging */}
            <DragOverlay dropAnimation={null}>
              {activeItem?.type === "vessel" && (
                <div className="rounded-xl border border-ocean-500 bg-navy-700 p-4 shadow-2xl w-64 opacity-95 rotate-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-ocean-500/30 rounded-lg flex items-center justify-center">
                      <Anchor className="w-4 h-4 text-ocean-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{activeItem.vessel.name}</p>
                      <p className="text-ocean-400 text-xs capitalize">
                        {activeItem.vessel.vessel_type}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {activeItem?.type === "shipment" && (
                <div className="rounded-xl border border-amber-500 bg-navy-700 p-4 shadow-2xl w-64 opacity-95 rotate-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-500/30 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {activeItem.shipment.commodity_type}
                      </p>
                      <p className="text-amber-400 text-xs">
                        {activeItem.shipment.cargo_weight_tons.toLocaleString()} tons
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
