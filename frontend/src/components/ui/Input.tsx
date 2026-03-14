import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 bg-white",
            "placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors",
            error
              ? "border-red-400 focus:ring-red-300"
              : "border-gray-300 focus:ring-ocean-300 focus:border-ocean-400",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function Select({ label, error, children, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={clsx(
          "w-full px-3.5 py-2.5 rounded-lg border text-sm text-gray-900 bg-white",
          "focus:outline-none focus:ring-2 transition-colors",
          error
            ? "border-red-400 focus:ring-red-300"
            : "border-gray-300 focus:ring-ocean-300 focus:border-ocean-400",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
