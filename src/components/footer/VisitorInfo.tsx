import { ordinal } from "@/lib/format";
import LiveClock from "./LiveClock";

// Server-rendered; only the clock ships JS. data-visitor is FooterScene's
// reveal hook — keep it.
export default function VisitorInfo({
  visitorNumber,
  className = "",
}: {
  /** From the persistent counter; null when unavailable — never a made-up number. */
  visitorNumber: number | null;
  className?: string;
}) {
  return (
    <div data-visitor className={`text-center ${className}`}>
      <p className="text-[13px] font-medium text-mist/85 sm:text-[15px]">
        {visitorNumber
          ? `You’re the ${ordinal(visitorNumber)} visitor`
          : "Thanks for stopping by."}
      </p>
      {/* the height is reserved so the clock appearing after hydration doesn't shift anything */}
      <p className="mt-1 min-h-[1.5em] text-[11px] text-balance text-mist/65 tabular-nums sm:text-[13px]">
        <LiveClock />
      </p>
    </div>
  );
}
