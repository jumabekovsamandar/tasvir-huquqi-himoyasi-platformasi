import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-ink-800 shadow-glow">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z" />
          <circle cx="12" cy="10" r="2.4" />
        </svg>
      </span>
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          light ? "text-white" : "text-ink-900",
        )}
      >
        ImageRights
        <span className="text-brand-500">.uz</span>
      </span>
    </Link>
  );
}
