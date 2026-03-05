import { cn } from "@/lib/utils";

export function MessageSkeleton({ align }: { align: "left" | "right" }) {
  return (
    <div className={cn("flex w-full", align === "left" ? "justify-start" : "justify-end")}>
      <div className="max-w-[80%] space-y-1.5">
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5",
            align === "left" ? "rounded-bl-sm" : "rounded-br-sm"
          )}
        >
          <div className="space-y-1.5">
            <div className={cn("h-3 skeleton", align === "left" ? "w-48" : "w-36")} />
            <div className={cn("h-3 skeleton", align === "left" ? "w-32" : "w-24")} />
          </div>
        </div>
        <div className={cn("h-2.5 w-16 skeleton", align === "right" && "ml-auto")} />
      </div>
    </div>
  );
}

export function ChannelSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-24 skeleton" />
          <div className="h-2.5 w-10 skeleton" />
        </div>
        <div className="h-3 w-40 skeleton" />
      </div>
    </div>
  );
}
