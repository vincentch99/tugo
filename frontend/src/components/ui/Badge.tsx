import { clsx } from "clsx";

type BadgeVariant = "blue" | "green" | "yellow" | "red" | "gray" | "navy" | "gold";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "blue", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-blue-100 text-blue-800": variant === "blue",
          "bg-green-100 text-green-800": variant === "green",
          "bg-yellow-100 text-yellow-800": variant === "yellow",
          "bg-red-100 text-red-800": variant === "red",
          "bg-gray-100 text-gray-800": variant === "gray",
          "bg-navy-100 text-navy-900": variant === "navy",
          "bg-yellow-100 text-yellow-800": variant === "gold",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    open: "green",
    matched: "blue",
    booked: "yellow",
    completed: "gray",
    cancelled: "red",
    pending: "yellow",
    confirmed: "green",
    in_transit: "blue",
    available: "green",
  };
  return <Badge variant={variantMap[status] || "gray"}>{status.replace("_", " ")}</Badge>;
}
